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
  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const result = await signIn('credentials', {
      email,
      password,
      role,
      redirect: false
    });

    if (result.error) {
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
      return;
    }

    // Store token in localStorage for API calls
    const token = result.url?.match(/token=([^&]*)/)?.[1];
    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', role);
      
      // Now fetch user details to get the ID
      const userEndpoint = role === 'owner' 
        ? 'http://localhost:5555/api/owner/details'
        : 'http://localhost:5555/api/customer/details';
      
      const userRes = await fetch(userEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        localStorage.setItem('user_id', userData.id);
        localStorage.setItem('user_name', userData.name || '');
        localStorage.setItem('user_email', userData.email || '');
      }
    }

    // Redirect based on role
    if (role === 'owner') {
      router.push('/dashboard/owner');
    } else {
      router.push('/dashboard/customer');
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('An error occurred during login');
  } finally {
    setIsLoading(false);
  }
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
  type="submit"
  disabled={isLoading}
  className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-80 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
>
  {isLoading ? (
    <>
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Signing In...
    </>
  ) : (
    'Sign In'
  )}
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