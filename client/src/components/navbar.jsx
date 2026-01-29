'use client'; // Marks this component as a Client Component in Next.js (App Router)
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Search, LogIn, UserPlus, ShoppingCart, X } from 'lucide-react'; // Icon set
import { useTheme } from 'next-themes'; //  (dark/light)
import Link from 'next/link'; // Client-side navigation

export default function Navbar() {
  // Theme state from next-themes
  const { theme, setTheme } = useTheme();

  // Local UI state
  const [searchOpen, setSearchOpen] = useState(false); // Toggle search input
  const [searchQuery, setSearchQuery] = useState(''); // Search text
  const [cartCount, setCartCount] = useState(0); // Cart item count
  const [mounted, setMounted] = useState(false); // Track client-side mount

  // Ensure component only renders theme toggle after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle search input changes
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // TODO: Fetch search results from backend API
  };

  return (
    // Fixed navbar with blur + border
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-lg">
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-base sm:text-lg">🍽️</span>
            </div>
            <span className="font-bold text-sm sm:text-xl text-foreground hidden sm:block group-hover:text-primary transition-colors">
              Nextgen Food Court
            </span>
          </div>

          {/* Desktop navigation links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="#outlets" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Outlets
            </Link>
            <Link href="#menu" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
              Menu
            </Link>
            <Link href="#special" className="text-foreground hover:text-primary transition-colors text-sm font-medium">
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
            </div>

            {/* Cart button with badge */}
            <button
              onClick={() => {
                // TODO: Navigate to cart or open cart sidebar
              }}
              className="relative p-2 sm:p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors shadow-md hover:shadow-lg"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
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

            {/* Auth actions (desktop only) */}
            <div className="hidden sm:flex items-center gap-2">
              <button className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-secondary rounded-full transition-colors">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </button>
              <button className="flex items-center gap-1 px-3 py-2 bg-accent text-primary-foreground text-xs sm:text-sm font-medium rounded-full hover:bg-accent/90 transition-colors shadow-md">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Reusable hamburger menu icon component
function Menu(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
