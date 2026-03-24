'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUploader } from '@/components/ui/image-uploader';
import { CONDITION_CATEGORIES } from '@/lib/utils';

import type { Post } from '@/types';

interface PostFormData {
  category: Post['category'];
  title: string;
  content: string;
  images?: string[];
}

interface PostFormProps {
  defaultValues?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PostForm({ defaultValues, onSubmit, onCancel, isLoading }: PostFormProps) {
  const [images, setImages] = useState<string[]>(defaultValues?.images || []);
  const { register, handleSubmit, formState: { errors } } = useForm<PostFormData>({
    defaultValues,
  });

  const handleFormSubmit = (data: PostFormData) => {
    onSubmit({ ...data, images: images.length > 0 ? images : undefined });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
        <select
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          {...register('category', { required: true })}
        >
          {Object.entries(CONDITION_CATEGORIES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <Input
        id="pf-title"
        label="제목"
        placeholder="제목을 입력하세요"
        error={errors.title?.message}
        {...register('title', { required: '제목을 입력해주세요' })}
      />
      <div>
        <label htmlFor="pf-content" className="block text-sm font-medium text-gray-700 mb-1">내용</label>
        <textarea
          id="pf-content"
          placeholder="내용을 입력하세요"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          rows={8}
          {...register('content', { required: '내용을 입력해주세요' })}
        />
        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이미지 (선택, 최대 5장)</label>
        <ImageUploader maxFiles={5} value={images} onChange={setImages} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>취소</Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? '등록 중...' : '등록'}
        </Button>
      </div>
    </form>
  );
}
