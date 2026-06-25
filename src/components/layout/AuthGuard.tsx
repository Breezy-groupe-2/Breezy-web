'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();
  const restricted = user?.status === 'suspended' || user?.status === 'banned';

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (restricted) {
      router.replace('/suspended');
    }
  }, [isLoading, token, restricted, router]);

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

  if (!token || restricted) return null;

  return <>{children}</>;
}
