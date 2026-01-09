import { ExternalLink } from 'lucide-react'

interface ReferenceImage {
  url: string
  description: string
  source?: string
}

interface ReferenceImagesProps {
  images: ReferenceImage[]
}

export function ReferenceImages({ images }: ReferenceImagesProps) {
  if (!images || images.length === 0) return null

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">
        Reference Images for Comparison
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {images.map((img, index) => (
          <a
            key={index}
            href={img.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-lg overflow-hidden bg-slate-100 aspect-square"
          >
            <img
              src={img.url}
              alt={img.description}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs">
                <p className="line-clamp-2">{img.description}</p>
                {img.source && (
                  <p className="flex items-center gap-1 mt-1 text-white/70">
                    <ExternalLink className="w-3 h-3" />
                    {img.source}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
