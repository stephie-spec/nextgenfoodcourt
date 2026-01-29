'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children, requiredRole }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  if (requiredRole && session.user.role !== requiredRole) {
    // Redirect to correct dashboard
    if (session.user.role === 'owner') {
      router.push('/dashboard/owner');
    } else {
      router.push('/dashboard/customer');
    }
    return null;
  }

  return children;
}