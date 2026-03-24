'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bkend } from '@/lib/bkend';

import type { Post, Comment } from '@/types';

export function usePosts(category?: string) {
  return useQuery<Post[]>({
    queryKey: ['Posts', category],
    queryFn: () =>
      bkend.data.list('Posts', {
        ...(category && category !== 'all' ? { category } : {}),
        _sort: 'createdAt',
        _order: 'desc',
        _limit: '20',
      }),
  });
}

export function usePost(id: string) {
  return useQuery<Post>({
    queryKey: ['Posts', id],
    queryFn: () => bkend.data.get('Posts', id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Post, '_id' | 'createdAt' | 'updatedAt' | 'userId' | 'likeCount' | 'commentCount'>) =>
      bkend.data.create('Posts', { ...data, likeCount: 0, commentCount: 0 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Posts'] }),
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, currentCount, liked }: { id: string; currentCount: number; liked: boolean }) =>
      bkend.data.update('Posts', id, {
        likeCount: liked ? currentCount - 1 : currentCount + 1,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['Posts', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['Posts'] });
    },
  });
}

export function useComments(postId: string) {
  return useQuery<Comment[]>({
    queryKey: ['Comments', postId],
    queryFn: () => bkend.data.list('Comments', { postId }),
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { postId: string; content: string }) =>
      bkend.data.create('Comments', data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['Comments', variables.postId] }),
  });
}
