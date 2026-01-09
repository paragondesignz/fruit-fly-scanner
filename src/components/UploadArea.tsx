import { useState, useCallback, useRef } from 'react'
import { Upload, X, Bug } from 'lucide-react'

interface UploadAreaProps {
  onImageSelected: (file: File) => void
  selectedImage: string | null
  onClear: () => void
  isLoading?: boolean
}

export function UploadArea({ onImageSelected, selectedImage, onClear, isLoading }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelected(file)
    }
  }, [onImageSelected])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelected(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onImageSelected])

  // Selected image preview
  if (selectedImage && !isLoading) {
    return (
      <div className="card-elevated overflow-hidden">
        <div className="relative">
          <img
            src={selectedImage}
            alt="Selected"
            className="w-full h-auto max-h-80 object-contain bg-[#0a0f1c]"
          />
          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white backdrop-blur-sm transition-colors border border-white/10"
            aria-label="Clear image"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  // Upload interface matching hornet-check CameraInterface selection screen
  return (
    <div className="card-elevated p-6 lg:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[rgba(251,146,60,0.1)] border border-[rgba(251,146,60,0.2)] mb-4">
          <Bug className="w-7 h-7 text-[#fb923c]" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-100 mb-2">
          Identify Fly
        </h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Upload a photo of a fly to check for biosecurity threat species
        </p>
      </div>

      {/* Upload Area */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex flex-col items-center justify-center h-40 card-interactive overflow-hidden cursor-pointer border-dashed ${
          isDragging ? 'border-[#fb923c] bg-[rgba(251,146,60,0.05)]' : ''
        }`}
        aria-label="Upload an image"
      >
        <div className="w-12 h-12 rounded-xl bg-[#1a2540] border border-slate-700 flex items-center justify-center group-hover:border-[#fb923c] group-hover:bg-[rgba(251,146,60,0.05)] transition-all mb-4">
          <Upload className={`w-6 h-6 transition-colors ${isDragging ? 'text-[#fb923c]' : 'text-slate-400 group-hover:text-[#fb923c]'}`} aria-hidden="true" />
        </div>
        <div className="text-center">
          <div className={`font-semibold transition-colors ${isDragging ? 'text-[#fb923c]' : 'text-slate-200 group-hover:text-[#fb923c]'}`}>
            {isDragging ? 'Drop your image here' : 'Tap to upload'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Drag & drop or click to select
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          aria-label="Upload image file"
        />
      </label>

      {/* Photo Tips */}
      <div className="mt-6 p-4 rounded-lg bg-[#1a2540] border border-slate-700">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-medium">Tip:</span> For best results, use a clear, well-lit photo showing the entire fly. Close-up shots of wing patterns and body markings help with identification.
        </p>
      </div>

      {/* Supported formats */}
      <p className="text-xs text-slate-500 text-center mt-4">
        Supports: JPEG, PNG, WebP (max 20MB)
      </p>
    </div>
  )
}
