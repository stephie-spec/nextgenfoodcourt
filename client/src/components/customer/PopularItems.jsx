'use client'; // Enables client-side rendering and hooks

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Optimized image handling
import { Star, TrendingUp } from 'lucide-react'; // Icons for UI accents

export default function PopularItems() {
  // State for popular dishes data
  const [popularDishes, setPopularDishes] = useState([]);
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Fetch popular items (mocked for now)
  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        // TODO: Replace mock data with backend API call
        setPopularDishes(mockPopularDishes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching popular items:', error);
        setLoading(false);
      }
    };

    fetchPopularItems();
  }, []);

  // Temporary mock data for popular dishes
  const mockPopularDishes = [
    {
      id: 1,
      name: 'Ethiopian Injera Platter',
      outlet: 'Addis Kitchen',
      price: '$12.99',
      rating: 4.8,
      reviews: 234,
      image: '/food-1.jpg',
      tag: 'Best Seller',
    },
    {
      id: 2,
      name: 'Nigerian Jollof Rice',
      outlet: 'Lagos Grill',
      price: '$11.99',
      rating: 4.9,
      reviews: 189,
      image: '/food-2.jpg',
      tag: 'Top Rated',
    },
    {
      id: 3,
      name: 'Kenyan Nyama Choma',
      outlet: 'Nairobi Flame',
      price: '$15.99',
      rating: 4.7,
      reviews: 156,
      image: '/food-3.jpg',
      tag: 'Most Ordered',
    },
    {
      id: 4,
      name: 'Congolese Fufu & Fish',
      outlet: 'Kinshasa Kitchen',
      price: '$13.99',
      rating: 4.6,
      reviews: 128,
      image: '/food-4.jpg',
      tag: 'Customer Favorite',
    },
  ];

  return (
    // Popular items section
    <section id="popular" className="py-16 sm:py-20 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section header */}
        <div className="mb-10 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
            <h2 className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              Most Popular
            </h2>
          </div>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Customer Favorites
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Discover the dishes that have captured our customers' hearts.
          </p>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Loading popular items...</p>
          </div>
        )}

        {/* Popular items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {popularDishes.map((dish) => (
            <div
              key={dish.id}
              className="group bg-background rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Dish image */}
              <div className="relative h-48 overflow-hidden bg-muted">
                <Image
                  src={dish.image || "/placeholder.svg"}
                  alt={dish.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Tag badge */}
                <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {dish.tag}
                </div>
              </div>

              {/* Dish details */}
              <div className="p-4 space-y-3">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {dish.name}
                </h4>

                {/* Rating display */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(dish.rating)
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {dish.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({dish.reviews})
                  </span>
                </div>

                {/* Price and action */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-lg font-bold text-primary">
                    {dish.price}
                  </span>
                  <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
