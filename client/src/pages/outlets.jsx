import React, { useMemo } from 'react';
import Image from 'next/image';
import { MapPin, Clock, Phone, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { getMockOutlets } from '@/lib/outletsData';
export default function OutletsPage() {
  const router = useRouter();
  const outlets = useMemo(() => getMockOutlets(), []);
  const searchQuery = typeof router.query.search === 'string' ? router.query.search : '';
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOutlets = normalizedQuery
    ? outlets.filter((outlet) =>
        outlet.name.toLowerCase().includes(normalizedQuery) ||
        outlet.cuisine.toLowerCase().includes(normalizedQuery)
      )
    : outlets;

  return (
    <main className="min-h-screen bg-background py-12 pt-24">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">All Outlets</h1>
          <p className="text-muted-foreground mt-2">Explore all 20 premium outlets across the food court.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOutlets.map((outlet) => (
            <div key={outlet.id} className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-xl">
              <div className="relative h-40 overflow-hidden bg-muted">
                <Image src={outlet.image} alt={outlet.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-3 left-3 bg-accent/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                  {outlet.cuisine}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{outlet.name}</h3>
                <p className="text-sm text-muted-foreground">{outlet.description}</p>

                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{outlet.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{outlet.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{outlet.phone}</span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  View Menu
                  <ChevronRight className="w-4 h-4 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
