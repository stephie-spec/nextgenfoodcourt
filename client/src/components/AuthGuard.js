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
      return;
    }

    if (status === 'authenticated') {
      const token = session?.accessToken;
      const role = session?.user?.role || '';

      //  Store only the token in localStorage
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', role); 
      }

      // Role-based redirect
      if (requiredRole && role !== requiredRole) {
        if (role === 'owner') router.push('/dashboard/owner');
        else router.push('/dashboard/customer');
      }
    }
  }, [session, status, router, requiredRole]);

  if (status === 'loading') return <div>Loading...</div>;

  if (!session || (requiredRole && session?.user?.role !== requiredRole)) return null;

  return children;
}