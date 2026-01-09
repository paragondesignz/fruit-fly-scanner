// Security utilities: sanitization and validation

// Sanitize string input - remove potentially harmful characters
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return "";

  // Remove null bytes and other control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  sanitized = sanitized.substring(0, maxLength);

  return sanitized;
}

// Sanitize species name - only allow alphanumeric, spaces, hyphens, parentheses
export function sanitizeSpeciesName(name: string): string {
  if (!name) return "";

  // Allow letters, numbers, spaces, hyphens, parentheses, periods, apostrophes
  const sanitized = name.replace(/[^a-zA-Z0-9\s\-().,']/g, '');

  return sanitized.substring(0, 200).trim();
}

// Sanitize URL - validate against whitelist of allowed domains
export function sanitizeUrl(url: string, allowedDomains: string[]): string | null {
  try {
    const parsedUrl = new URL(url);

    // Check protocol
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }

    // Check against whitelist
    const isAllowed = allowedDomains.some(domain => {
      return parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain);
    });

    if (!isAllowed) {
      return null;
    }

    // Limit URL length
    if (url.length > 500) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

// Validate and sanitize reference images
export function sanitizeReferenceImages(images: any[]): Array<{
  url: string;
  description: string;
  source?: string;
}> {
  const allowedDomains = [
    'inaturalist.org',
    'commons.wikimedia.org',
    'upload.wikimedia.org',
  ];

  if (!Array.isArray(images)) return [];

  return images
    .map(img => {
      if (!img || typeof img !== 'object') return null;

      const url = sanitizeUrl(img.url, allowedDomains);
      if (!url) return null;

      return {
        url,
        description: sanitizeString(img.description, 300),
        source: img.source ? sanitizeString(img.source, 100) : undefined,
      };
    })
    .filter((img): img is NonNullable<typeof img> => img !== null)
    .slice(0, 5); // Max 5 reference images
}

// Round coordinates for privacy (3 decimal places = ~110m precision)
export function roundCoordinate(coord: number): number {
  return Math.round(coord * 1000) / 1000;
}

// Validate image file by checking magic bytes
export function validateImageMagicBytes(bytes: Uint8Array): {
  valid: boolean;
  mimeType: string | null;
} {
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { valid: true, mimeType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4E &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0D &&
    bytes[5] === 0x0A &&
    bytes[6] === 0x1A &&
    bytes[7] === 0x0A
  ) {
    return { valid: true, mimeType: 'image/png' };
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { valid: true, mimeType: 'image/webp' };
  }

  return { valid: false, mimeType: null };
}
