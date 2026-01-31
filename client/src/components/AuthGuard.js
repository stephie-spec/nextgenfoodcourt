'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children, requiredRole }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== requiredRole) {
      // Redirect to dashboard based on role
      if (session.user.role === 'owner') {
        router.push('/dashboard/owner');
      } else {
        router.push('/dashboard/customer');
      }
    }
  }, [session, status, router, requiredRole]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session || session.user?.role !== requiredRole) {
    return null;
  }

  return children;
}