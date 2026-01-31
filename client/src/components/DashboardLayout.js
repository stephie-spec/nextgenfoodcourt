'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, LogOut, User, Bell, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children, title }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    signOut({ callbackUrl: '/' });
  };

  // Dashboard sidebar items based on user role
  const getSidebarItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', href: '#' },
      { icon: User, label: 'Profile', href: '#' },
      { icon: Bell, label: 'Notifications', href: '#' },
      { icon: Settings, label: 'Settings', href: '#' },
    ];

    if (session?.user?.role === 'owner') {
      return [
        ...baseItems,
        { icon: Home, label: 'My Outlets', href: '#' },
        { icon: User, label: 'Staff Management', href: '#' },
      ];
    }

    return baseItems;
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile menu button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-foreground hover:bg-secondary rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">🍽️</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">{title}</h1>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.role === 'owner' ? 'Outlet Owner Dashboard' : 'Customer Dashboard'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: User info and actions */}
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="hidden md:flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-foreground">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.role === 'owner' ? 'Outlet Owner' : 'Customer'}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <nav className="space-y-2">
                {sidebarItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <a
                      key={index}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  );
                })}
              </nav>
              
              {/* Stats Summary */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Today's Orders</span>
                    <span className="font-bold text-primary">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Active</span>
                    <span className="font-bold text-green-500">12</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}>
              <div className="fixed left-0 top-16 bottom-0 w-64 bg-background border-r border-border p-6" onClick={(e) => e.stopPropagation()}>
                <nav className="space-y-2">
                  {sidebarItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={index}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}