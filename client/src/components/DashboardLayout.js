'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, LogOut, User, Bell, Settings, Menu, X, Package, CreditCard, Heart, BarChart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';

export default function DashboardLayout({ children, title }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');

  const isLoading = status === 'loading';

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    const name = localStorage.getItem('user_name');
    if (role) setUserRole(role);
    if (name) setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    if (session) {
      signOut({ callbackUrl: '/' });
    } else {
      router.push('/');
    }
  };

  const getSidebarItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', href: userRole === 'owner' ? '/dashboard/owner' : '/dashboard/customer', exact: true },
      { icon: User, label: 'Profile', href: userRole === 'owner' ? '/dashboard/owner/profile' : '/dashboard/customer/profile' },
      { icon: Bell, label: 'Notifications', href: userRole === 'owner' ? '/dashboard/owner/notifications' : '/dashboard/customer/notifications' },
      { icon: Settings, label: 'Settings', href: userRole === 'owner' ? '/dashboard/owner/settings' : '/dashboard/customer/settings' },
    ];

    if (userRole === 'owner') {
      return [
        ...baseItems,
        { icon: User, label: 'Staff Management', href: '/dashboard/owner/staff' },
        { icon: BarChart, label: 'Analytics', href: '/dashboard/owner/analytics' },
      ];
    }

    // Customer items
    return [
      ...baseItems,
      { icon: Heart, label: 'Favorites', href: '/dashboard/customer/favorites' },
      { icon: CreditCard, label: 'Payment Methods', href: '/dashboard/customer/payments' },
      { icon: Heart, label: 'Address Book', href: '/dashboard/customer/addresses' },
    ];
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page title banner */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground mt-2 capitalize">
              Welcome back, {session?.user?.name || 'User'} • {session?.user?.role === 'owner' ? 'Outlet Owner Dashboard' : 'Customer Dashboard'}
            </p>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-32">
                <nav className="space-y-2">
                  {sidebarItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? pathname === item.href // Exact match for dashboard
                      : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                          ? 'bg-primary text-white'
                          : 'text-foreground hover:bg-secondary'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Quick Stats */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    {userRole === 'owner' ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">Today's Orders</span>
                          <span className="font-bold text-primary">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">Active Tables</span>
                          <span className="font-bold text-green-500">12/20</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">Revenue</span>
                          <span className="font-bold text-green-500">Ksh 1,240</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">Active Orders</span>
                          <span className="font-bold text-primary">2</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">Favorites</span>
                          <span className="font-bold text-green-500">8</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">Rewards Points</span>
                          <span className="font-bold text-green-500">1,250</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
              <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}>
                <div className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border p-6" onClick={(e) => e.stopPropagation()}>
                  {/* Mobile header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">🍽️</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">Dashboard</h2>
                      <p className="text-xs text-muted-foreground capitalize">{userRole || 'User'}</p>
                    </div>
                  </div>

                  <nav className="space-y-2">
                    {sidebarItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={index}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              <div className="bg-card border border-border rounded-xl p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}