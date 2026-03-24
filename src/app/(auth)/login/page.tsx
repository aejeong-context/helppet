'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      await login(data.email, data.password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg || '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">오래오래</h1>
          <p className="mt-2 text-sm text-gray-500">노견/환견 케어 플랫폼</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="이메일"
            placeholder="email@example.com"
            error={errors.email?.message}
            {...register('email', { required: '이메일을 입력해주세요' })}
          />
          <Input
            id="password"
            type="password"
            label="비밀번호"
            placeholder="비밀번호"
            error={errors.password?.message}
            {...register('password', { required: '비밀번호를 입력해주세요' })}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link href="/register" className="text-primary-600 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
