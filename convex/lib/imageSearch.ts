// Dynamic image search utilities for species reference images

export interface ReferenceImage {
  url: string;
  description: string;
  source?: string;
}

export interface SearchParams {
  species: string;
  scientificName?: string;
  commonName?: string;
}

// Timeout for external API calls (5 seconds)
const API_TIMEOUT_MS = 5000;

// Helper to fetch with timeout
async function fetchWithTimeout(url: string, timeoutMs: number = API_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Helper to convert iNaturalist photo URL to medium size
function getINaturalistMediumUrl(url: string): string {
  if (!url) return '';
  // iNaturalist URLs have size suffixes like /square.jpg, /small.jpg, /medium.jpg, /large.jpg
  // Convert to medium size for good quality without being too large
  return url.replace(/\/(square|small|original|large)\.(jpg|jpeg|png)/i, '/medium.$2');
}

// iNaturalist API - Free, scientific, community-verified (BEST SOURCE)
export async function fetchINaturalistImages(searchTerm: string): Promise<ReferenceImage[]> {
  try {
    console.log(`🔍 iNaturalist search for: "${searchTerm}"`);

    // Search for taxon with timeout
    const searchResponse = await fetchWithTimeout(
      `https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(searchTerm)}&per_page=5`
    );

    if (!searchResponse.ok) {
      console.log(`❌ iNaturalist search failed: ${searchResponse.status}`);
      return [];
    }

    const searchData = await searchResponse.json();
    console.log(`📊 iNaturalist found ${searchData.results?.length || 0} taxa`);

    const images: ReferenceImage[] = [];
    const addedUrls = new Set<string>();

    for (const taxon of searchData.results || []) {
      // Get the default photo
      if (taxon.default_photo?.medium_url || taxon.default_photo?.url) {
        const photoUrl = getINaturalistMediumUrl(
          taxon.default_photo.medium_url || taxon.default_photo.url
        );
        if (photoUrl && !addedUrls.has(photoUrl)) {
          addedUrls.add(photoUrl);
          images.push({
            url: photoUrl,
            description: `${taxon.preferred_common_name || taxon.name} - verified by iNaturalist community`,
            source: 'iNaturalist'
          });
          console.log(`✅ Added iNaturalist image: ${photoUrl.substring(0, 60)}...`);
        }
      }

      // Get additional photos for the first matching taxon (with timeout)
      if (taxon.id && images.length < 3) {
        try {
          const taxonResponse = await fetchWithTimeout(
            `https://api.inaturalist.org/v1/taxa/${taxon.id}?locale=en`
          );
          if (taxonResponse.ok) {
            const taxonData = await taxonResponse.json();
            const photos = taxonData.results?.[0]?.taxon_photos?.slice(0, 3) || [];

            for (const photo of photos) {
              if (photo.photo && images.length < 3) {
                const photoUrl = getINaturalistMediumUrl(
                  photo.photo.medium_url || photo.photo.url
                );
                if (photoUrl && !addedUrls.has(photoUrl)) {
                  addedUrls.add(photoUrl);
                  images.push({
                    url: photoUrl,
                    description: `${taxon.preferred_common_name || taxon.name} reference photo`,
                    source: 'iNaturalist'
                  });
                }
              }
            }
          }
        } catch (e) {
          console.log(`⚠️ Failed to fetch additional photos for taxon ${taxon.id}`);
        }
      }

      if (images.length >= 3) break;
    }

    return images;
  } catch (error) {
    console.error('❌ iNaturalist API error:', error);
    return [];
  }
}

// Wikimedia Commons - search for actual specimen photos
export async function fetchWikimediaImages(searchTerm: string): Promise<ReferenceImage[]> {
  try {
    // Search specifically in File namespace, looking for photos
    const searchQuery = `${searchTerm}`;
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchQuery)}&srnamespace=6&srlimit=10&origin=*`;

    console.log(`🔍 Wikimedia search for: "${searchTerm}"`);

    const response = await fetchWithTimeout(searchUrl);
    if (!response.ok) {
      console.log(`❌ Wikimedia search failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`📊 Wikimedia found ${data.query?.search?.length || 0} files`);

    const images: ReferenceImage[] = [];

    // File extensions that indicate actual photos
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    // Patterns to exclude (documents, diagrams, maps, etc.)
    const excludePatterns = [
      'document', 'report', 'circular', 'page', 'cover', 'historic',
      'archived', 'pdf', 'map', 'diagram', 'chart', 'graph', 'logo',
      'icon', 'flag', 'stamp', 'distribution', 'range'
    ];

    for (const item of data.query?.search || []) {
      const fileName = item.title.replace('File:', '');
      const fileNameLower = fileName.toLowerCase();

      // Check if it's an actual image file
      const hasValidExtension = validExtensions.some(ext => fileNameLower.endsWith(ext));

      // Skip non-photo files
      const isExcluded = excludePatterns.some(pattern => fileNameLower.includes(pattern));

      if (hasValidExtension && !isExcluded) {
        const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=400`;
        images.push({
          url: imageUrl,
          description: fileName.replace(/_/g, ' ').replace(/\.[^.]+$/, '').substring(0, 100),
          source: 'Wikimedia Commons'
        });
        console.log(`✅ Added Wikimedia image: ${fileName.substring(0, 50)}...`);
      }

      if (images.length >= 2) break;
    }

    return images;
  } catch (error) {
    console.error('❌ Wikimedia API error:', error);
    return [];
  }
}

// Main function - truly dynamic search using multiple terms
export async function getSpeciesReferenceImages(params: SearchParams | string): Promise<ReferenceImage[]> {
  // Handle both old string format and new object format
  const searchParams: SearchParams = typeof params === 'string'
    ? { species: params }
    : params;

  const { species, scientificName, commonName } = searchParams;
  const allImages: ReferenceImage[] = [];
  const addedUrls = new Set<string>();

  console.log(`\n🔍 === Starting image search ===`);
  console.log(`   Species: ${species}`);
  console.log(`   Scientific: ${scientificName || 'not provided'}`);
  console.log(`   Common: ${commonName || 'not provided'}`);

  // Build search terms in order of specificity
  const searchTerms: string[] = [];

  // Scientific name is most specific - try it first
  if (scientificName && scientificName.trim()) {
    searchTerms.push(scientificName.trim());
  }

  // Then try the species field (might be common or scientific)
  if (species && species.trim() && !searchTerms.includes(species.trim())) {
    searchTerms.push(species.trim());
  }

  // Then common name
  if (commonName && commonName.trim() && !searchTerms.includes(commonName.trim())) {
    searchTerms.push(commonName.trim());
  }

  console.log(`📝 Search terms: ${searchTerms.join(', ')}`);

  // Try iNaturalist with each search term until we get results
  for (const term of searchTerms) {
    if (allImages.length >= 2) break;

    const iNatImages = await fetchINaturalistImages(term);
    for (const img of iNatImages) {
      if (!addedUrls.has(img.url) && allImages.length < 3) {
        addedUrls.add(img.url);
        allImages.push(img);
      }
    }

    if (iNatImages.length > 0) {
      console.log(`✅ iNaturalist returned ${iNatImages.length} images for "${term}"`);
      break; // Got results, don't need to try other terms
    }
  }

  // If we still need more images, try Wikimedia with scientific name
  if (allImages.length < 2 && scientificName) {
    const wikiImages = await fetchWikimediaImages(scientificName);
    for (const img of wikiImages) {
      if (!addedUrls.has(img.url) && allImages.length < 3) {
        addedUrls.add(img.url);
        allImages.push(img);
      }
    }
  }

  console.log(`\n✅ === Final result: ${allImages.length} images ===\n`);

  return allImages.slice(0, 3);
}
