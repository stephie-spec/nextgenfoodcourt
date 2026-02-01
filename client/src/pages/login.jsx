'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    signIn('credentials', {
      email,
      password,
      role,
      redirect: false
    }).then((result) => {
      if (result.error) {
        setError('Invalid email or password');
      } else {
        // Store token in localStorage for API calls
        const token = result.url?.match(/token=([^&]*)/)?.[1];
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_role', role);
        }
        
        // Redirect based on role
        if (role === 'owner') {
          router.push('/dashboard/owner');
        } else {
          router.push('/dashboard/customer');
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Nextgen Food Court</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                I am a:
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex-1 py-2 rounded-lg ${role === 'customer' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`flex-1 py-2 rounded-lg ${role === 'owner' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                >
                  Owner
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-border rounded-lg"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
            >
              Sign In
            </button>

            <div className="text-center">
              <Link href="/register" className="text-primary hover:underline">
                Don't have an account? Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}