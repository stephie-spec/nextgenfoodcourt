'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    
    // store in localStorage for demo
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      setMessage('User already exists');
      return;
    }
    
    const newUser = { id: Date.now(), name, email, password, role };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    setMessage('Account created! Redirecting to login...');
    
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Nextgen Food Court</h1>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Register as:
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
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-border rounded-lg"
                required
              />
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

            {message && (
              <div className="text-green-500 text-sm">{message}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
            >
              Create Account
            </button>

            <div className="text-center">
              <Link href="/login" className="text-primary hover:underline">
                Already have an account? Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}