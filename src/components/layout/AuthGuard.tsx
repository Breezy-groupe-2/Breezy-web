'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return (
      <div
        className="min-h-svh flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
