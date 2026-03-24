'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useFileUpload } from '@/hooks/use-file-upload';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  maxFiles?: number;
  value?: string[];
  onChange?: (urls: string[]) => void;
  className?: string;
}

export function ImageUploader({ maxFiles = 1, value, onChange, className }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { previews, urls, isUploading, progress, error, upload, remove, setInitialUrls } = useFileUpload({ maxFiles });

  useEffect(() => {
    if (value && value.length > 0 && previews.length === 0) {
      setInitialUrls(value);
    }
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (urls.length > 0) {
      onChange?.(urls);
    }
  }, [urls]);// eslint-disable-line react-hooks/exhaustive-deps

  const handleFiles = useCallback((files: FileList | null) => {
    if (files && files.length > 0) upload(files);
  }, [upload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleRemove = useCallback((index: number) => {
    remove(index);
    onChange?.(urls.filter((_, i) => i !== index));
  }, [remove, onChange, urls]);

  const canAddMore = previews.length < maxFiles;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              <img src={src} alt={`upload-${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400',
            isUploading && 'pointer-events-none opacity-60',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={maxFiles > 1}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="text-gray-500 text-sm">
            <span className="text-2xl block mb-1">
              {isUploading ? '...' : '📷'}
            </span>
            {isUploading
              ? '업로드 중...'
              : '이미지를 드래그하거나 클릭하여 업로드'}
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WebP, GIF / 최대 10MB
              {maxFiles > 1 && ` / ${previews.length}/${maxFiles}장`}
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
