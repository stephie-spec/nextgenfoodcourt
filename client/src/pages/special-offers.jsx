'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Flame, Percent, Search, SlidersHorizontal, Star, Tag } from 'lucide-react';
import Navbar from '@/components/navbar';
import { useCart } from '@/lib/CartContext'; // Cart context

const API_BASE = 'http://localhost:5555';

const fallbackOffers = [
  {
    id: 'fallback-1',
    title: 'Chef Special Combo',
    outlet: 'Addis Kitchen',
    outletImage: '/outlet-showcase-1.jpg',
    originalPrice: 18.99,
    discountedPrice: 13.99,
    discount: 26,
    description: 'Signature platter with your choice of two sides.',
    timing: 'Daily: 12PM - 9PM',
    category: 'food',
    expiresIn: '2 days',
    rating: 4.8,
    reviews: 124,
    tag: 'Chef Pick',
    image: '/food-1.jpg',
  },
  {
    id: 'fallback-2',
    title: 'Family Bundle Savings',
    outlet: 'Yam Bliss',
    outletImage: '/outlet-showcase-4.jpg',
    originalPrice: 44.99,
    discountedPrice: 29.99,
    discount: 33,
    description: 'Feeds 4 with sides and drinks included.',
    timing: 'Weekends: 1PM - 6PM',
    category: 'bundle',
    expiresIn: '1 week',
    rating: 4.7,
    reviews: 87,
    tag: 'Best Deal',
    image: '/food-4.jpg',
  },
  {
    id: 'fallback-3',
    title: 'Happy Hour Drinks',
    outlet: 'Congo Cafe',
    outletImage: '/outlet-showcase-2.jpg',
    originalPrice: 8.99,
    discountedPrice: 5.49,
    discount: 39,
    description: 'Refreshing juices and smoothies at a steal.',
    timing: 'Mon-Fri: 2PM - 5PM',
    category: 'drinks',
    expiresIn: '5 hours',
    rating: 4.5,
    reviews: 44,
    tag: 'Limited',
    image: '/food-2.jpg',
  },
];

export default function SpecialOffersPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [offers, setOffers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const buildOffersFromMenu = (menuItems) => {
      const discountSteps = [10, 15, 20, 25, 30, 35];
      const tags = ['Chef Pick', 'Limited', 'Hot Deal', 'Trending', 'New'];
      const timings = ['All Day', 'Lunch Special', 'Dinner Deal', 'Happy Hour'];
      const expirations = ['2 hours', '6 hours', '1 day', '2 days', '1 week'];

      return menuItems.map((menuItem, index) => {
        const price = Number(menuItem.price) || 12.99;
        const discount = discountSteps[index % discountSteps.length];
        const originalPrice = Number((price / (1 - discount / 100)).toFixed(2));
        const imagePath = menuItem.image_path ? menuItem.image_path.replace(/^\/+/, '') : '';
        const imageUrl = imagePath ? `${API_BASE}/uploads/${imagePath}` : '/default-food.jpg';
        const category = (menuItem.category || 'food').toLowerCase();

        return {
          id: menuItem.id,
          title: menuItem.item_name || 'Signature Special',
          outlet: menuItem.outlet_name || 'Featured Outlet',
          outletImage: imageUrl,
          originalPrice,
          discountedPrice: price,
          discount,
          description: menuItem.description || 'Enjoy a curated deal crafted for food lovers.',
          timing: `${timings[index % timings.length]}`,
          category,
          expiresIn: expirations[index % expirations.length],
          rating: Number((4.4 + (index % 5) * 0.1).toFixed(1)),
          reviews: 40 + index * 3,
          tag: tags[index % tags.length],
          image: imageUrl,
        };
      });
    };

    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await fetch('/api/menu');
        if (!response.ok) {
          throw new Error(`Failed to load offers (${response.status})`);
        }
        const data = await response.json();
        const menuOffers = buildOffersFromMenu(data).slice(0, 24);
        if (isMounted) {
          setOffers(menuOffers.length > 0 ? menuOffers : fallbackOffers);
        }
      } catch (error) {
        if (isMounted) {
          setOffers(fallbackOffers);
          setErrorMessage(error.message || 'Unable to load offers.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOffers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter offers by category
  const filteredOffers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const byFilter = filter === 'all' ? offers : offers.filter((offer) => offer.category === filter);

    if (!normalizedQuery) {
      return byFilter;
    }

    return byFilter.filter((offer) =>
      offer.title.toLowerCase().includes(normalizedQuery) ||
      offer.outlet.toLowerCase().includes(normalizedQuery) ||
      offer.description.toLowerCase().includes(normalizedQuery)
    );
  }, [offers, filter, searchQuery]);

  const categories = useMemo(() => {
    const counts = offers.reduce((acc, offer) => {
      acc[offer.category] = (acc[offer.category] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: 'all', label: 'All Offers', count: offers.length },
      ...Object.entries(counts).map(([key, count]) => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        count,
      })),
    ];
  }, [offers]);

  const featuredOffer = useMemo(() => {
    // Find tibs dish first, otherwise use first filtered offer
    const tibsOffer = filteredOffers.find(offer => 
      offer.title.toLowerCase().includes('tibs')
    );
    return tibsOffer || filteredOffers[0];
  }, [filteredOffers]);

  const secondaryOffers = useMemo(() => {
    // Exclude the featured offer from secondary list
    return filteredOffers.filter(offer => offer.id !== featuredOffer?.id);
  }, [filteredOffers, featuredOffer]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-accent/10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/80 border border-border rounded-full shadow-sm">
                <Percent className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Special offers curated daily</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Grab today’s hottest deals from top African kitchens.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Browse limited-time promotions, exclusive bundles, and discounted meals handcrafted by our most-loved outlets.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search offers, outlets, dishes"
                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </button>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-background/80 border border-border rounded-full">
                  <Flame className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">New drops weekly</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-background/80 border border-border rounded-full">
                  <Tag className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold">Up to 35% off</span>
                </div>
              </div>
            </div>

            {featuredOffer && (
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
                <div className="relative h-56 sm:h-64">
                  <Image
                    src={featuredOffer.image}
                    alt={featuredOffer.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 540px"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {featuredOffer.discount}% OFF
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm uppercase tracking-wide opacity-80">Featured</p>
                    <h2 className="text-2xl font-bold">{featuredOffer.title}</h2>
                    <p className="text-sm opacity-80">{featuredOffer.outlet}</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{featuredOffer.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-primary">Ksh{featuredOffer.discountedPrice.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        Ksh{featuredOffer.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(featuredOffer.id);
                        router.push('/cart');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold shadow"
                    >
                      Order now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === cat.id
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                }`}
              >
                {cat.label}
                <span className="ml-2 opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage} Showing curated fallback offers.
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-44 rounded-2xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {secondaryOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="group flex flex-col sm:flex-row bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all"
                >
                  <div className="relative h-44 sm:h-auto sm:w-48 md:w-56">
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                      className="object-cover group-hover:scale-105 transition-transform"
                      unoptimized
                    />
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {offer.discount}% OFF
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {offer.expiresIn}
                    </div>
                  </div>

                  <div className="flex-1 p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
                          <Image
                            src={offer.outletImage}
                            alt={offer.outlet}
                            width={24}
                            height={24}
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        {offer.outlet}
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 bg-accent/15 text-accent rounded-full">
                        {offer.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {offer.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{offer.timing}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        {offer.rating} ({offer.reviews})
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <span className="text-lg font-bold text-primary">Ksh{offer.discountedPrice.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          Ksh{offer.originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          addToCart(offer.id);
                          router.push('/cart');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
                      >
                        Order
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
