'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';

const CONTENT = {
  suspended: {
    icon: 'lock' as const,
    title: 'Compte suspendu',
    body: 'Ton compte a été temporairement suspendu par un administrateur. Contacte le support si tu penses qu’il s’agit d’une erreur.',
  },
  banned: {
    icon: 'ban' as const,
    title: 'Compte banni',
    body: 'Ton compte a été définitivement banni de Breezy. Contacte le support si tu penses qu’il s’agit d’une erreur.',
  },
};

export default function SuspendedPage() {
  const router = useRouter();
  const { token, user, isLoading, logout } = useAuth();
  const status = user?.status === 'banned' ? 'banned' : 'suspended';
  const content = CONTENT[status];

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (user?.status !== 'suspended' && user?.status !== 'banned') {
      router.replace('/home');
    }
  }, [isLoading, token, user, router]);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!token || (user?.status !== 'suspended' && user?.status !== 'banned')) return null;

  return (
    <div
      className="min-h-svh flex flex-col items-center justify-center px-8 text-center"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full mb-6"
        style={{ background: 'var(--primary-soft)' }}
      >
        <Icon name={content.icon} size={28} color="var(--primary)" />
      </div>
      <h1 className="font-display font-extrabold text-[26px] mb-2" style={{ color: 'var(--text)' }}>
        {content.title}
      </h1>
      <p className="text-[15px] max-w-[340px] mb-8" style={{ color: 'var(--text-muted)' }}>
        {content.body}
      </p>
      <button
        onClick={handleLogout}
        className="h-11 px-8 rounded-full text-[15px] font-bold"
        style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
