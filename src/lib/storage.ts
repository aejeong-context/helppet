import type { UploadedFile } from '@/types';
import { bkendFetch } from './bkend';

const IMAGE_CDN = process.env.NEXT_PUBLIC_IMAGE_CDN || 'https://img.bkend.ai';

interface PresignedUrlResponse {
  url: string;
  key: string;
  filename: string;
  contentType: string;
}

async function getPresignedUrl(file: File): Promise<PresignedUrlResponse> {
  return bkendFetch('/files/presigned-url', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
      visibility: 'public',
      category: 'images',
    }),
  });
}

async function uploadToStorage(
  url: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

interface FileMetadataResponse {
  id: string;
  key: string;
  originalName: string;
  contentType: string;
  size: number;
}

async function registerFileMetadata(params: {
  key: string;
  originalName: string;
  contentType: string;
  size: number;
}): Promise<FileMetadataResponse> {
  return bkendFetch('/files', {
    method: 'POST',
    body: JSON.stringify({
      ...params,
      visibility: 'public',
      category: 'images',
    }),
  });
}

export function getCdnUrl(key: string, width = 800, height = 600, quality = 80): string {
  if (key.startsWith('http')) return key;
  return `${IMAGE_CDN}/fit-in/${width}x${height}/filters:quality(${quality})/${key}`;
}

export function getThumbnailUrl(key: string, size = 200): string {
  if (key.startsWith('http')) return key;
  return `${IMAGE_CDN}/fit-in/${size}x${size}/filters:quality(70)/${key}`;
}

export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadedFile> {
  const presigned = await getPresignedUrl(file);
  await uploadToStorage(presigned.url, file, onProgress);
  const metadata = await registerFileMetadata({
    key: presigned.key,
    originalName: file.name,
    contentType: file.type,
    size: file.size,
  });

  return {
    id: metadata.id,
    key: presigned.key,
    url: getCdnUrl(presigned.key),
    filename: file.name,
    contentType: file.type,
  };
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE_MB = 10;

export function validateFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'JPG, PNG, WebP, GIF 파일만 업로드 가능합니다';
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `파일 크기는 ${MAX_FILE_SIZE_MB}MB 이하여야 합니다`;
  }
  return null;
}
