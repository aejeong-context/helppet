'use client';

import { useState } from 'react';
import { useComments, useCreateComment } from '@/hooks/use-posts';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate } from '@/lib/utils';

interface CommentListProps {
  postId: string;
}

export function CommentList({ postId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment();
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    createComment.mutate(
      { postId, content: content.trim() },
      { onSuccess: () => setContent('') },
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">
        💬 댓글 {comments ? `(${comments.length})` : ''}
      </h3>

      {/* 댓글 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="댓글을 입력하세요"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none"
        />
        <Button size="sm" onClick={handleSubmit} disabled={createComment.isPending || !content.trim()}>
          등록
        </Button>
      </div>

      {/* 댓글 목록 */}
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : comments && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b border-gray-100 pb-3">
              <p className="text-sm">{comment.content}</p>
              <span className="text-xs text-gray-400 mt-1">{formatDate(comment.createdAt)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">아직 댓글이 없습니다</p>
      )}
    </div>
  );
}
