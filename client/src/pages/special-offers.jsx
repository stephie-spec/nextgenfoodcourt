'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Router for navigation
import { Clock, Store, Tag, ArrowRight, Star, Calendar, Flame, Percent, Timer, ChevronRight } from 'lucide-react';
import Navbar from '@/components/navbar';
import { useCart } from '@/lib/CartContext'; // Cart context

export default function SpecialOffersPage() {
  const router = useRouter(); // Router instance
  const { addToCart } = useCart(); // Get addToCart function
  const [offers, setOffers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [timeLeft, setTimeLeft] = useState({});

  // Mock special offers data
  const specialOffers = [
    {
      id: 1,
      title: 'Buy 1 Get 1 Free Pizza',
      outlet: 'Addis Kitchen',
      outletImage: '/outlet-showcase-1.jpg',
      originalPrice: 15.99,
      discountedPrice: 15.99,
      discount: 50,
      description: 'Any large pizza of your choice. Dine-in only.',
      timing: 'Mon-Fri: 11AM - 3PM',
      category: 'food',
      expiresIn: '2 days',
      rating: 4.8,
      reviews: 124,
      tag: 'Best Deal',
      image: '/food-1.jpg',
    },
    {
      id: 2,
      title: '30% Off All Nigerian Dishes',
      outlet: 'Naija Kitchen',
      outletImage: '/outlet-showcase-2.jpg',
      originalPrice: 12.99,
      discountedPrice: 9.09,
      discount: 30,
      description: 'Valid on all Nigerian specialty dishes including Jollof Rice and Egusi Soup.',
      timing: 'Daily: 5PM - 10PM',
      category: 'food',
      expiresIn: '5 hours',
      rating: 4.9,
      reviews: 89,
      tag: 'Popular',
      image: '/food-2.jpg',
    },
    {
      id: 3,
      title: 'Free Suya with Any Order',
      outlet: 'Lagos Grill',
      outletImage: '/outlet-showcase-3.jpg',
      originalPrice: 8.99,
      discountedPrice: 0,
      discount: 100,
      description: 'Add any main dish and get free suya skewers.',
      timing: 'Weekends Only: 12PM - 11PM',
      category: 'food',
      expiresIn: '1 day',
      rating: 4.7,
      reviews: 56,
      tag: 'Free',
      image: '/food-3.jpg',
    },
    {
      id: 4,
      title: 'Family Bundle - 50% Off',
      outlet: 'Yam Bliss',
      outletImage: '/outlet-showcase-4.jpg',
      originalPrice: 45.99,
      discountedPrice: 22.99,
      discount: 50,
      description: 'Family platter serves 4. Includes fried yam, soup, and sides.',
      timing: 'Sat-Sun: 12PM - 4PM',
      category: 'bundle',
      expiresIn: '3 days',
      rating: 4.6,
      reviews: 203,
      tag: 'Family',
      image: '/food-4.jpg',
    },
    {
      id: 5,
      title: 'Early Bird Breakfast Special',
      outlet: 'Nairobi Flame',
      outletImage: '/outlet-showcase-1.jpg',
      originalPrice: 9.99,
      discountedPrice: 5.99,
      discount: 40,
      description: 'Traditional African breakfast with tea. Valid before 9AM.',
      timing: 'Daily: 6AM - 9AM',
      category: 'breakfast',
      expiresIn: '6 hours',
      rating: 4.8,
      reviews: 67,
      tag: 'Early Bird',
      image: '/food-1.jpg',
    },
    {
      id: 6,
      title: 'Happy Hour - 2 for 1 Drinks',
      outlet: 'Congo Cafe',
      outletImage: '/outlet-showcase-2.jpg',
      originalPrice: 5.99,
      discountedPrice: 5.99,
      discount: 50,
      description: 'All smoothies and fresh juices. Dine-in only.',
      timing: 'Mon-Fri: 2PM - 5PM',
      category: 'drinks',
      expiresIn: '4 hours',
      rating: 4.5,
      reviews: 34,
      tag: 'Happy Hour',
      image: '/food-2.jpg',
    },
    {
      id: 7,
      title: '25% Off Ethiopian Platters',
      outlet: 'Addis Ababa',
      outletImage: '/outlet-showcase-3.jpg',
      originalPrice: 18.99,
      discountedPrice: 14.24,
      discount: 25,
      description: 'Includes injera, doro wat, and selection of vegan dishes.',
      timing: 'Daily: 11AM - 10PM',
      category: 'food',
      expiresIn: '1 week',
      rating: 4.9,
      reviews: 145,
      tag: 'Chef Pick',
      image: '/food-3.jpg',
    },
    {
      id: 8,
      title: 'Free Delivery on Orders Over $20',
      outlet: 'All Outlets',
      outletImage: '/outlet-showcase-4.jpg',
      originalPrice: 5.99,
      discountedPrice: 0,
      discount: 100,
      description: 'Free delivery within 5km radius. Use code: FREEDELIVERY',
      timing: 'Valid All Day',
      category: 'delivery',
      expiresIn: '2 weeks',
      rating: 4.4,
      reviews: 312,
      tag: 'Delivery',
      image: '/food-4.jpg',
    },
    {
      id: 9,
      title: 'Student Discount - 20% Off',
      outlet: 'Afro Delights',
      outletImage: '/outlet-showcase-1.jpg',
      originalPrice: 11.99,
      discountedPrice: 9.59,
      discount: 20,
      description: 'Valid student ID required. Valid on all items.',
      timing: 'Daily: 10AM - 10PM',
      category: 'food',
      expiresIn: '6 days',
      rating: 4.6,
      reviews: 78,
      tag: 'Student',
      image: '/food-1.jpg',
    },
    {
      id: 10,
      title: 'Midnight Snack Special',
      outlet: 'Night Owl Kitchen',
      outletImage: '/outlet-showcase-2.jpg',
      originalPrice: 7.99,
      discountedPrice: 4.99,
      discount: 38,
      description: 'Late night bites from 11PM - 2AM.',
      timing: 'Daily: 11PM - 2AM',
      category: 'food',
      expiresIn: '8 hours',
      rating: 4.3,
      reviews: 23,
      tag: 'Late Night',
      image: '/food-2.jpg',
    },
    {
      id: 11,
      title: 'Buy 3 Get 1 Free Wings',
      outlet: 'Spice Route',
      outletImage: '/outlet-showcase-3.jpg',
      originalPrice: 12.99,
      discountedPrice: 9.74,
      discount: 25,
      description: 'Choose from 5 spice levels. Mild to Extra Hot.',
      timing: 'Fri-Sat: 6PM - 11PM',
      category: 'food',
      expiresIn: '2 days',
      rating: 4.8,
      reviews: 167,
      tag: 'Spicy',
      image: '/food-3.jpg',
    },
    {
      id: 12,
      title: 'Lunch Combo - Save $5',
      outlet: 'Egusi Express',
      outletImage: '/outlet-showcase-4.jpg',
      originalPrice: 15.99,
      discountedPrice: 10.99,
      discount: 31,
      description: 'Soup + Fufu + Protein combo. Mon-Fri lunch.',
      timing: 'Mon-Fri: 11AM - 3PM',
      category: 'bundle',
      expiresIn: '1 day',
      rating: 4.7,
      reviews: 91,
      tag: 'Lunch',
      image: '/food-4.jpg',
    },
  ];

  useEffect(() => {
    setOffers(specialOffers);
  }, []);

  // Filter offers by category
  const filteredOffers = filter === 'all' 
    ? offers 
    : offers.filter(offer => offer.category === filter);

  // Categories
  const categories = [
    { id: 'all', label: 'All Offers', count: offers.length },
    { id: 'food', label: 'Food', count: offers.filter(o => o.category === 'food').length },
    { id: 'bundle', label: 'Bundles', count: offers.filter(o => o.category === 'bundle').length },
    { id: 'drinks', label: 'Drinks', count: offers.filter(o => o.category === 'drinks').length },
    { id: 'delivery', label: 'Delivery', count: offers.filter(o => o.category === 'delivery').length },
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
              <Percent className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-accent">Limited Time Only</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Special Offers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing deals from our premium outlets. Save big on your favorite African cuisines with exclusive discounts and promotions.
            </p>
          </div>

          {/* Countdown Banner */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <Flame className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-red-500">Ends Soon!</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
              <Timer className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">New Offers Weekly</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg">
              <Tag className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-accent">Up to 50% Off</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === cat.id
                    ? 'bg-primary text-primary-foreground'
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

      {/* Offers Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="group bg-background rounded-xl border border-border overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-xl"
              >
                {/* Image Section */}
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {offer.discount}% OFF
                  </div>
                  {/* Tag Badge */}
                  <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
                    {offer.tag}
                  </div>
                  {/* Expires Badge */}
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {offer.expiresIn}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-3">
                  {/* Outlet Info */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={offer.outletImage}
                        alt={offer.outlet}
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{offer.outlet}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {offer.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {offer.description}
                  </p>

                  {/* Timing */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{offer.timing}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(offer.rating)
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {offer.rating} ({offer.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-end justify-between pt-2 border-t border-border">
                    <div>
                      <span className="text-lg font-bold text-primary">
                        ${offer.discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        ${offer.originalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button 
                    onClick={() => {
                      addToCart(offer.id);
                      router.push('/cart');
                    }}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 group/btn"
                  >
                    Claim & Proceed
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/10 transition-colors">
              Load More Offers
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
            <Calendar className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-accent">Stay Updated</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Never Miss a Deal
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to our newsletter and get exclusive offers delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
            />
            <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>© 2024 Nextgen Food Court. All rights reserved.</p>
            <p className="text-sm mt-2">Offers are valid while supplies last. Terms and conditions apply.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
