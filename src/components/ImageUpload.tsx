import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  } as any);

  if (value) {
    return (
      <div className={cn("relative rounded-xl overflow-hidden border border-neutral-200 aspect-video group", className)}>
        <img src={value} alt="Uploaded reference" className="w-full h-full object-cover" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
          }}
          className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100"
        >
          <X size={16} className="text-neutral-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors aspect-video flex flex-col items-center justify-center gap-3",
        isDragActive ? "border-rose-500 bg-rose-50" : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="bg-white p-3 rounded-full shadow-sm border border-neutral-100">
        <Upload className="w-6 h-6 text-rose-500" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-neutral-900">
          {isDragActive ? "Drop the image here" : "Upload reference image"}
        </p>
        <p className="text-xs text-neutral-500">
          Drag & drop or click to select
        </p>
      </div>
    </div>
  );
}
