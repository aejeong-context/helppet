'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-md mx-auto space-y-5">
      <h1 className="text-xl font-bold">설정</h1>

      <Card>
        <h2 className="font-semibold mb-3">내 정보</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">이메일</span>
            <span>{user?.email || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">닉네임</span>
            <span>{user?.nickname || '-'}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold mb-3">앱 정보</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">서비스</span>
            <span>오래오래</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">버전</span>
            <span>0.1.0</span>
          </div>
        </div>
      </Card>

      <Button variant="danger" className="w-full" onClick={logout}>
        로그아웃
      </Button>
    </div>
  );
}
