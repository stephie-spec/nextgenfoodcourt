import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Clock, Phone, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import Navbar from '@/components/navbar';

export default function OutletsPage() {
  const router = useRouter();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch outlets from backend
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await fetch('http://localhost:5555/api/outlets');
        if (!response.ok) {
          throw new Error('Failed to fetch outlets');
        }
        const data = await response.json();
        const outletsList = data.outlets || data;
        setOutlets(outletsList);
      } catch (err) {
        console.error('Error fetching outlets:', err);
        setError('Failed to load outlets');
      } finally {
        setLoading(false);
      }
    };

    fetchOutlets();
  }, []);

  // Helper function to get outlet image URL from backend
  const getOutletImage = (imagePath) => {
    const finalImage = imagePath || 'default-outlet.jpg';
    return `http://localhost:5555/uploads/${finalImage.replace(/^\/+/, '')}`;
  };

  const searchQuery = typeof router.query.search === 'string' ? router.query.search : '';
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOutlets = normalizedQuery
    ? outlets.filter((outlet) =>
      outlet.name.toLowerCase().includes(normalizedQuery) ||
      (outlet.category_name && outlet.category_name.toLowerCase().includes(normalizedQuery))
    )
    : outlets;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="min-h-screen bg-background py-12 pt-24">

        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground">All Outlets</h1>
            <p className="text-muted-foreground mt-2">Explore our premium outlets across the food court.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading outlets...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredOutlets.map((outlet, index) => (
                <div key={outlet.id} className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-xl">
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <Image
                      src={getOutletImage(outlet.image_path)}
                      alt={outlet.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading={index < 6 ? "eager" : "lazy"}
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute top-3 left-3 bg-accent/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                      {outlet.category_name || 'Food'}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{outlet.name}</h3>
                    <p className="text-sm text-muted-foreground">{outlet.description || 'Delicious food and great service'}</p>

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

                    <button
                      onClick={() => router.push(`/dashboard/menu?search=${encodeURIComponent(outlet.name)}`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      View Menu
                      <ChevronRight className="w-4 h-4 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredOutlets.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No outlets found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
