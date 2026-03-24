'use client';

import { useState, useCallback } from 'react';
import { uploadFile, validateFile } from '@/lib/storage';

import type { UploadedFile } from '@/types';

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSizeMB?: number;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { maxFiles = 1 } = options;
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList);
    const remaining = maxFiles - files.length;
    if (remaining <= 0) {
      setError(`최대 ${maxFiles}장까지 업로드 가능합니다`);
      return;
    }

    const filesToUpload = newFiles.slice(0, remaining);
    for (const file of filesToUpload) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    // Add local previews immediately
    const newPreviews = filesToUpload.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);

    const uploaded: UploadedFile[] = [];
    for (let i = 0; i < filesToUpload.length; i++) {
      try {
        const result = await uploadFile(filesToUpload[i], (pct) => {
          const overallPct = Math.round(((i + pct / 100) / filesToUpload.length) * 100);
          setProgress(overallPct);
        });
        uploaded.push(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '업로드에 실패했습니다');
        // Remove failed preview
        setPreviews((prev) => prev.filter((_, idx) => idx < files.length + uploaded.length));
        break;
      }
    }

    if (uploaded.length > 0) {
      setFiles((prev) => [...prev, ...uploaded]);
      // Replace previews with CDN URLs
      setPreviews((prev) => {
        const existing = prev.slice(0, files.length);
        const cdnUrls = [...files, ...uploaded].map((f) => f.url);
        return [...cdnUrls];
      });
    }

    setIsUploading(false);
    setProgress(100);
  }, [files, maxFiles]);

  const remove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const url = prev[index];
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setError(null);
  }, []);

  const reset = useCallback(() => {
    previews.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setFiles([]);
    setPreviews([]);
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, [previews]);

  const setInitialUrls = useCallback((urls: string[]) => {
    setFiles(urls.map((url) => ({ id: '', key: '', url, filename: '', contentType: '' })));
    setPreviews(urls);
  }, []);

  return {
    files,
    urls: files.map((f) => f.url),
    previews,
    isUploading,
    progress,
    error,
    upload,
    remove,
    reset,
    setInitialUrls,
  };
}
