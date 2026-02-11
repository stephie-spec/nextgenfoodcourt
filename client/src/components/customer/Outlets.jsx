'use client'; // Enables client-side rendering and React hooks

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Optimized image loading
import { MapPin, Clock, Phone, ChevronRight } from 'lucide-react'; // UI icons
import Link from 'next/link';

export default function OutletsShowcase() {
  // State for outlets data
  const [outlets, setOutlets] = useState([]);
  // Loading state for async fetch
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch outlets from backend
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        setError('');
        const response = await fetch('http://localhost:5555/api/outlets');
        if (!response.ok) {
          throw new Error('Failed to fetch outlets');
        }
        const data = await response.json();
        const outletsList = data.outlets || data;
        const shuffled = outletsList.sort(() => Math.random() - 0.5);
        setOutlets(shuffled.slice(0, 4));
      } catch (error) {
        console.error('Error fetching outlets:', error);
        setError('Failed to load outlets');
      } finally {
        setLoading(false);
      }
    };

    fetchOutlets();
  }, []);

  const getOutletImage = (imagePath) => {
    const finalImage = imagePath || 'default-outlet.jpg';
    return `http://localhost:5555/uploads/${finalImage.replace(/^\/+/, '')}`;
  };

  return (
    // Outlets showcase section
    <section id="outlets" className="py-16 sm:py-20 bg-gradient-to-br from-secondary/30 to-background">
      <div className="xl:grid xl:grid-cols-[1fr_minmax(0,80rem)_18rem_1fr] xl:gap-12">
        <div className="xl:col-start-2 px-3 sm:px-6 lg:px-8">
          
          {/* Section header */}
          <div className="mb-10 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
              <h2 className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
                Our Outlets
              </h2>
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              20+ Premium Outlets
            </h3>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Loading outlets...</p>
            </div>
          )}
          {!loading && error && (
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Outlets grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {outlets.map((outlet) => (
              <div
                key={outlet.id}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-xl"
              >
                {/* Outlet image */}
                <div className="relative h-32 sm:h-40 overflow-hidden bg-muted">
                  <Image
                    src={getOutletImage(outlet.image_path)}
                    alt={outlet.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  {/* Cuisine badge */}
                  <div className="absolute top-3 left-3 bg-accent/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                    {outlet.category_name || 'Food'}
                  </div>
                </div>

                {/* Outlet details */}
                <div className="p-4 space-y-3">
                  <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {outlet.name}
                  </h4>

                  {/* Location, hours, and contact info */}
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{outlet.location || 'Food Court Level 1'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{outlet.hours || '10:00 AM - 10:00 PM'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{outlet.phone || 'Contact us'}</span>
                    </div>
                  </div>

                  {/* Call-to-action */}
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                    View Menu
                    <ChevronRight className="w-4 h-4 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View all outlets button */}
          <div className="mt-12 text-center">
            <Link href="/outlets" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              View All 20+ Outlets
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <aside className="hidden xl:block xl:col-start-3">
          <div className="sticky top-48 mt-10 space-y-4">
            <div className="rounded-2xl border border-border bg-background/80 backdrop-blur p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Visitor Guide</p>
              </div>
              <h4 className="mt-3 text-lg font-semibold text-foreground">Quick Tips</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Order ahead for shorter wait times</li>
                <li>• Ask for allergy-friendly options</li>
                <li>• Peak hours: 12–2 PM</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/40 p-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Today</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">Most outlets open</p>
              <p className="mt-1 text-xs text-muted-foreground">10:00 AM – 10:00 PM</p>
            </div>

            <div className="rounded-2xl border border-border bg-background/80 p-5">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Need Help?</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">Customer Care</p>
              <p className="mt-1 text-xs text-muted-foreground">(555) 123-4500</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
