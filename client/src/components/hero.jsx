'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Sun, Moon, ShoppingCart, Calendar } from 'lucide-react';

const foodImages = [
  '/food-1.jpg',
  '/food-2.jpg',
  '/food-3.jpg',
  '/food-4.jpg',
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % foodImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToImage = (index) => {
    setCurrentImageIndex(index);
    setIsAutoPlay(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % foodImages.length);
    setIsAutoPlay(false);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + foodImages.length) % foodImages.length);
    setIsAutoPlay(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-primary">
                Nextgen Food Court
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/outlets" className="text-foreground hover:text-primary transition-colors">
                Outlets
              </Link>
              <Link href="/menu" className="text-foreground hover:text-primary transition-colors">
                Menu
              </Link>
              <Link href="/special-orders" className="text-foreground hover:text-primary transition-colors">
                Special Orders
              </Link>
            </div>

            {/* Right side: Theme toggle and Auth links */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground" />
                )}
              </button>

              {/* Auth Links */}
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-6 order-2 lg:order-1">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                  Taste Africa, Savor Excellence
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-4">
                  Experience authentic African cuisines from 20+ premium outlets serving Ethiopian, Nigerian, Congolese, Kenyan and more.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>20+ outlets with diverse cuisines</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Fast delivery and table booking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Special orders and catering available</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'add-to-cart',
                          timestamp: new Date(),
                        }),
                      });
                      const result = await response.json();
                      console.log('Cart response:', result);
                      // TODO: Show success toast or redirect to cart
                    } catch (error) {
                      console.error('Cart error:', error);
                      // TODO: Show error toast
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'book-table',
                          timestamp: new Date(),
                        }),
                      });
                      const result = await response.json();
                      console.log('Booking response:', result);
                      // TODO: Show booking modal or redirect to booking page
                    } catch (error) {
                      console.error('Booking error:', error);
                      // TODO: Show error toast
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  Book a Table
                </button>
              </div>
            </div>

            {/* Right - Image Carousel */}
            <div className="order-1 lg:order-2">
              <div className="relative h-96 md:h-[500px] lg:h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl">
                {/* Main Image */}
                <Image
                  src={foodImages[currentImageIndex] || "/placeholder.svg"}
                  alt={`Food carousel image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover transition-opacity duration-500"
                  priority
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                {/* Navigation Buttons */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  {foodImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`h-3 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'w-8 bg-white'
                          : 'w-3 bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Carousel Auto-play Toggle */}
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${isAutoPlay ? 'bg-primary animate-pulse' : 'bg-muted'}`}></div>
                <span>{isAutoPlay ? 'Auto-playing' : 'Paused'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
