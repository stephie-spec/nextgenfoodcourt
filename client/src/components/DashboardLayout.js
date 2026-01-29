'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardLayout({ children, title }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              <p className="text-sm text-gray-600">
                Welcome, {session?.user?.name}!
              </p>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/" className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Home
              </Link>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}