import type { UploadedFile } from '@/types';
import { supabase } from './bkend';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const BUCKET = 'images';

function getPublicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export function getCdnUrl(key: string, _width = 800, _height = 600, _quality = 80): string {
  if (key.startsWith('http')) return key;
  return getPublicUrl(key);
}

export function getThumbnailUrl(key: string, _size = 200): string {
  if (key.startsWith('http')) return key;
  return getPublicUrl(key);
}

export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadedFile> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'anonymous';
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${timestamp}-${safeName}`;

  onProgress?.(0);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  onProgress?.(100);

  return {
    id: path,
    key: path,
    url: getPublicUrl(path),
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
