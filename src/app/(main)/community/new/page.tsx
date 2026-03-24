'use client';

import { useRouter } from 'next/navigation';
import { useCreatePost } from '@/hooks/use-posts';
import { PostForm } from '@/components/features/post-form';

export default function NewPostPage() {
  const router = useRouter();
  const createPost = useCreatePost();

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">글쓰기</h1>
      <PostForm
        onSubmit={(data) => {
          createPost.mutate(
            { ...data, tags: [], images: data.images || [] },
            { onSuccess: () => router.push('/community') },
          );
        }}
        onCancel={() => router.back()}
        isLoading={createPost.isPending}
      />
    </div>
  );
}
