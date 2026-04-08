import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

export default function LogoPreviewPage() {
  return (
    <main className="min-h-screen bg-warm-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-blue">Logo Preview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-primary-500">오래오래 로고 미리보기</h1>
            <p className="mt-2 text-sm text-warm-400">심볼, 워드마크, 실제 UI 배치를 한 화면에서 확인할 수 있습니다.</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-cal-btn transition-opacity hover:opacity-80"
          >
            앱으로 이동
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card padding="lg" className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-300">Source</p>
              <h2 className="mt-2 text-xl font-semibold text-primary-500">원본 이미지 사용</h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-cal">
              <Logo />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-cal">
              <Logo compact />
            </div>

            <div className="flex flex-col gap-4 rounded-2xl bg-warm-50 p-6">
              <Logo compact />
            </div>
          </Card>

          <Card padding="lg" className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-300">Asset</p>
              <h2 className="mt-2 text-xl font-semibold text-primary-500">실제 연결된 원본 PNG</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-6 shadow-cal">
                <Image src="/oreore-logo.png" alt="ORE-ORE 원본 로고" width={1408} height={792} priority className="h-auto w-full" />
              </div>
            </div>
          </Card>
        </div>

        <Card padding="lg" className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-300">In Context</p>
            <h2 className="mt-2 text-xl font-semibold text-primary-500">헤더 적용 예시</h2>
          </div>

          <div className="rounded-2xl bg-white px-6 py-4 shadow-cal">
            <div className="flex items-center justify-between gap-4">
              <Logo compact className="w-[140px]" />
              <div className="flex items-center gap-2 text-sm font-semibold text-warm-400">
                <span className="rounded-md bg-warm-100 px-3 py-1.5">대시보드</span>
                <span className="rounded-md px-3 py-1.5">내 반려동물</span>
                <span className="rounded-md px-3 py-1.5">커뮤니티</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
