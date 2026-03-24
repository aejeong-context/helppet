'use client';

import { useState } from 'react';
import { getCdnUrl, getThumbnailUrl } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  thumbnail?: boolean;
  thumbnailSize?: number;
  className?: string;
  fallback?: string;
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  quality = 80,
  thumbnail = false,
  thumbnailSize = 200,
  className,
  fallback = '🖼️',
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 text-3xl', className)}>
        {fallback}
      </div>
    );
  }

  const imageUrl = thumbnail
    ? getThumbnailUrl(src, thumbnailSize)
    : getCdnUrl(src, width, height, quality);

  return (
    <img
      src={imageUrl}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn('object-cover', className)}
      loading="lazy"
    />
  );
}
