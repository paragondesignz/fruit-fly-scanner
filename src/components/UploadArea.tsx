import { useState, useCallback } from 'react'
import { Upload, X, Camera } from 'lucide-react'
import { cn } from '../lib/utils'

interface UploadAreaProps {
  onImageSelected: (file: File) => void
  selectedImage: string | null
  onClear: () => void
  isLoading?: boolean
}

export function UploadArea({ onImageSelected, selectedImage, onClear, isLoading }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)

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
  }, [onImageSelected])

  if (selectedImage) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <img
          src={selectedImage}
          alt="Selected"
          className="w-full h-auto max-h-96 object-contain bg-slate-100"
        />
        {!isLoading && (
          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
            aria-label="Clear image"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    )
  }

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200",
        isDragging
          ? "border-orange-500 bg-orange-50 scale-[1.02]"
          : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-orange-400"
      )}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
        <div className={cn(
          "p-4 rounded-full mb-4 transition-colors",
          isDragging ? "bg-orange-100" : "bg-slate-200"
        )}>
          {isDragging ? (
            <Upload className="w-8 h-8 text-orange-600" />
          ) : (
            <Camera className="w-8 h-8 text-slate-500" />
          )}
        </div>

        <p className="mb-2 text-lg font-semibold text-slate-700">
          {isDragging ? "Drop your image here" : "Upload a photo"}
        </p>
        <p className="text-sm text-slate-500 mb-4">
          Drag & drop or click to select
        </p>
        <p className="text-xs text-slate-400">
          Supports: JPEG, PNG, WebP (max 20MB)
        </p>
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
      />
    </label>
  )
}
