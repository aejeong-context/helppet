'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RegisterForm {
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      await signup(data.email, data.password, data.nickname);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg || '회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">오래오래</h1>
          <p className="mt-2 text-sm text-gray-500">노견/환견 케어 플랫폼 회원가입</p>
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
            id="nickname"
            label="닉네임"
            placeholder="닉네임"
            error={errors.nickname?.message}
            {...register('nickname', { required: '닉네임을 입력해주세요' })}
          />
          <Input
            id="password"
            type="password"
            label="비밀번호"
            placeholder="8자 이상"
            error={errors.password?.message}
            {...register('password', {
              required: '비밀번호를 입력해주세요',
              minLength: { value: 8, message: '8자 이상 입력해주세요' },
            })}
          />
          <Input
            id="confirmPassword"
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호 확인"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: '비밀번호를 다시 입력해주세요',
              validate: (value) => value === watch('password') || '비밀번호가 일치하지 않습니다',
            })}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-primary-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
