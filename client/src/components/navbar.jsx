'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { Moon, Sun, Search, LogIn, UserPlus, ShoppingCart, X, User, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { getCuisineList, getMockOutlets } from '@/lib/outletsData';
import { getMenuItems } from '@/lib/menuData';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { cartTotalItems } = useCart();
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const outlets = useMemo(() => getMockOutlets(), []);
  const cuisines = useMemo(() => getCuisineList(), []);
  const menuItems = useMemo(() => getMenuItems(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = status === 'loading';

  // Handle search input changes
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const outletMatches = normalizedQuery
    ? outlets.filter((outlet) => outlet.name.toLowerCase().includes(normalizedQuery)).slice(0, 6)
    : [];
  const cuisineMatches = normalizedQuery
    ? cuisines.filter((cuisine) => cuisine.toLowerCase().includes(normalizedQuery)).slice(0, 6)
    : [];
  const menuItemMatches = normalizedQuery
    ? menuItems.filter((item) => item.name.toLowerCase().includes(normalizedQuery)).slice(0, 6)
    : [];

  const goToSearch = (value, target = 'outlets') => {
    if (!value) return;
    const path = target === 'menu' ? '/dashboard/menu' : '/outlets';
    router.push(`${path}?search=${encodeURIComponent(value)}`);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleAuthNavigation = (type) => {
    if (type === 'login') {
      router.push('/login');
    } else {
      router.push('/register');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_email');

    signOut({ callbackUrl: '/' });
  };

  const handleDashboardNavigation = () => {
    if (session?.user?.role === 'owner') {
      router.push('/dashboard/owner');
    } else {
      router.push('/dashboard/customer');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-lg">
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-base sm:text-lg">🍽️</span>
            </div>
            <span className="font-bold text-sm sm:text-xl text-foreground hidden sm:block group-hover:text-primary transition-colors">
              Nextgen Food Court
            </span>
          </Link>

          {/* Desktop navigation links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/outlets" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Outlets
            </Link>
            <Link href="/dashboard/menu" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Menu
            </Link>
            <Link href="/special-offers" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Special Offers
            </Link>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-grow sm:flex-grow-0 justify-end">

            {/* Search toggle / input */}
            <div className="relative flex-grow sm:flex-grow-0 max-w-xs">
              {searchOpen ? (
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search dishes, outlets..."
                    value={searchQuery}
                    onChange={handleSearch}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        const trimmedQuery = searchQuery.trim();
                        if (!trimmedQuery) return;
                        const hasMenuMatch = cuisineMatches.length > 0 || menuItemMatches.length > 0;
                        goToSearch(trimmedQuery, hasMenuMatch ? 'menu' : 'outlets');
                      }
                    }}
                    className="w-full px-4 py-2 bg-secondary text-foreground placeholder-foreground/60 border-2 border-primary rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="absolute right-3 p-1"
                  >
                    <X className="w-4 h-4 text-foreground/60" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 sm:p-2.5 bg-secondary hover:bg-primary/20 text-primary rounded-full transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              )}
              {/* Search results dropdown */}
            </div>

            {/* Cart button with badge */}
            <button
              onClick={() => router.push('/cart')}
              className="relative p-2 sm:p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors shadow-md hover:shadow-lg"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5" />
              {mounted && cartTotalItems > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartTotalItems}
                </span>
              )}
            </button>

            {/* Dark / Light mode toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 sm:p-2.5 bg-secondary hover:bg-accent/20 text-accent rounded-full transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 sm:w-5 h-4 sm:h-5" />
                ) : (
                  <Moon className="w-4 sm:w-5 h-4 sm:h-5" />
                )}
              </button>
            )}

            {/* Auth actions */}
            <div className="hidden sm:flex items-center gap-2">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-secondary rounded-full animate-pulse"></div>
                  <div className="w-20 h-4 bg-secondary rounded animate-pulse"></div>
                </div>
              ) : session?.user ? (
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-primary/20 rounded-full transition-colors">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">
                        {session.user.name || 'User'}
                      </span>
                    </button>

                    <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="font-medium text-sm">{session.user.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {session.user.role === 'owner' ? 'Outlet Owner' : 'Customer'}
                          </p>
                        </div>

                        <button
                          onClick={handleDashboardNavigation}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          {session.user.role === 'owner' ? 'Owner Dashboard' : 'My Dashboard'}
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2 text-red-500"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthNavigation('login')}
                    className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-secondary rounded-full transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Login</span>
                  </button>
                  <button
                    onClick={() => handleAuthNavigation('register')}
                    className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground text-xs sm:text-sm font-medium rounded-full hover:shadow-lg hover:scale-105 transition-all shadow-md"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}