'use client';

import { useRouter } from 'next/navigation';
import { useCreateAdoption } from '@/hooks/use-adoptions';
import { AdoptionForm } from '@/components/features/adoption-form';

export default function NewAdoptionPage() {
  const router = useRouter();
  const createAdoption = useCreateAdoption();

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">🏡 입양/임시보호 공고 등록</h1>
      <AdoptionForm
        onSubmit={(data) =>
          createAdoption.mutate(data, { onSuccess: () => router.push('/adoption') })
        }
        onCancel={() => router.back()}
        isLoading={createAdoption.isPending}
      />
    </div>
  );
}
