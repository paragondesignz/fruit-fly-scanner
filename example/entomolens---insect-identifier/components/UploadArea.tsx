import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface UploadAreaProps {
  onImageSelected: (file: File) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, selectedImage, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  }, [onImageSelected]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  if (selectedImage) {
    return (
      <div className="relative w-full max-w-md mx-auto mt-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200 group">
        <img 
          src={selectedImage} 
          alt="Selected insect" 
          className="w-full h-64 object-cover sm:h-80"
        />
        <button
          onClick={onClear}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-sm backdrop-blur-sm transition-all duration-200"
          aria-label="Remove image"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full max-w-md mx-auto mt-8 border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out text-center ${
        isDragging 
          ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' 
          : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <label 
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
      >
        <div className="bg-emerald-100 p-4 rounded-full mb-4 group-hover:bg-emerald-200 transition-colors">
          <Upload className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          Upload an image
        </h3>
        <p className="text-slate-500 text-sm mb-4">
          Drag and drop or click to browse
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          <ImageIcon className="w-3 h-3" />
          <span>Supports JPG, PNG, WEBP</span>
        </div>
      </label>
    </div>
  );
};