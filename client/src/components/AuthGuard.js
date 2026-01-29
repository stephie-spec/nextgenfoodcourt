'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children, requiredRole }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && requiredRole && session.user.role !== requiredRole) {
      // Redirect to dashboard
      if (session.user.role === 'owner') {
        router.push('/dashboard/owner');
      } else {
        router.push('/dashboard/customer');
      }
    }
  }, [session, status, router, requiredRole]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || (requiredRole && session.user.role !== requiredRole)) {
    return null;
  }

  return children;
}