'use client'; // Marks this as a Client Component (uses state & interactivity)

import React, { useState } from 'react';
import { ChevronRight, Home, Utensils, Star, Info, Phone, X, LayoutDashboard, Store, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';


export default function Sidebar() {
  // Controls whether the sidebar is open or closed
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Sidebar not on dashboard pages
  const isDashboardPage = pathname?.startsWith('/dashboard');
  if (isDashboardPage) {
    return null;
  }


  // Sidebar navigation items
  const menuItems = [
    { icon: Home, label: 'Home', href: '#home' },
    { icon: Star, label: 'Popular Items', href: '#popular' },
    { icon: Utensils, label: 'All Outlets', href: '#outlets' },
    { icon: Info, label: 'About Us', href: '#about' },
    { icon: Phone, label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Toggle button for opening / closing sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-40 bg-primary text-primary-foreground p-2 rounded-lg shadow-md hover:bg-primary/90 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* Sidebar container */}
      <aside
        className={`fixed top-20 left-14 bg-background border border-border rounded-lg shadow-xl z-30 transition-all duration-300 ${isOpen ? 'w-56 opacity-100 pointer-events-auto' : 'w-0 opacity-0 pointer-events-none'
          } overflow-hidden`}
      >
        <div className="flex flex-col h-full p-4 pr-6">

          {/* Logo section (desktop only) */}
          <div className="mb-8 hidden md:flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🍽️</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1">
            <ul className="space-y-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Icon className="w-5 h-5 text-primary transition-colors" />
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* QR code section (desktop only) */}
          <div className="hidden md:flex flex-col items-center border-t border-border pt-4 gap-3">
            <p className="text-xs text-muted-foreground font-medium">Scan for App</p>
            <div className="relative w-20 h-20">
              <Image
                src="/qr-code.jpg"
                alt="QR code to download app"
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>
          </div>

          {/* Contact section (desktop only) */}
          <div className="hidden md:block border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground font-medium">Need Help?</p>
            <a
              href="tel:+1234567890"
              className="text-primary hover:text-accent text-xs font-semibold mt-2 inline-block transition-colors"
            >
              Call Us
            </a>
          </div>
        </div>
      </aside>

      {/* Background overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
