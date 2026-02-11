'use client'; // Enables client-side rendering and hooks

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Optimized image handling
import { Star, TrendingUp, Plus, Minus, ShoppingCart } from 'lucide-react'; // Icons for UI accents
import { useCart } from '@/lib/CartContext'; // Cart context for shared state

export default function PopularItems() { // Now modified to show top four favourited dishes.

  // Use CartContext instead of local state
  const { cartItems, addToCart, removeFromCart, getItemQuantity } = useCart();
  
  // State for popular dishes data
  const [popularDishes, setPopularDishes] = useState([]);
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Fetch top four favourited items from TopFavourites resource in favourites.py.
  useEffect(() => {

    const fetchTopFavourites = async () => {

      try {
        const response = await fetch('http://localhost:5555/api/items/top_favourites');

        if (!response.ok) {
          throw new Error('Failed to fetch top favourite items');
        }

        const data = await response.json();

        const processedDishes = data.map((item) => ({

          id : item.id,
          name : item.name,
          outlet : item.outlet_name,
          price : item.price || 0,
          rating: ((Math.random() * (4.9 - 4.5)) + 4.5).toFixed(1),
          reviews: Math.floor(Math.random() * (300 - 100) + 100),
          category : item.category_name,
          image: item.image
            ? `http://localhost:5555/uploads/${item.image.replace(/^\/+/, '')}`
            : '/placeholder.svg',
          tag: 'Customer Favorite',
        }));

        setPopularDishes(processedDishes);
        setLoading(false);

      } catch (error) {

        console.error('Error fetching popular items:', error);
        setPopularDishes([]);
        setLoading(false);

      }
    };

    fetchTopFavourites ();
  }, []);


  // Handle add to cart
  const handleAddToCart = (dish) => {
    addToCart(dish.id);
  };

  return (
    // Popular items section
    <section id="popular" className="py-16 sm:py-20 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="xl:grid xl:grid-cols-[1fr_minmax(0,80rem)_18rem_1fr] xl:gap-12">
        <div className="xl:col-start-2 px-3 sm:px-6 lg:px-8">
          
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
            {popularDishes.map((dish) => {
              const quantity = getItemQuantity(dish.id);
              
              return (
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
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
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

                    {/* Outlet name */}
                    <p className="text-sm text-muted-foreground">
                      {dish.outlet}
                    </p>

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

                    {/* Price and cart controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-lg font-bold text-primary">
                        Ksh{dish.price.toFixed(2)}
                      </span>

                      {quantity > 0 ? (
                        // Quantity controls if item is in cart
                        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                          <button
                            onClick={() => removeFromCart(dish.id)}
                            className="p-1.5 hover:text-primary hover:bg-background rounded-md transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleAddToCart(dish)}
                            className="p-1.5 hover:text-primary hover:bg-background rounded-md transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // Add-to-cart button
                        <button
                          onClick={() => handleAddToCart(dish)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all active:scale-95"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="hidden xl:block xl:col-start-3">
          <div className="sticky top-54 mt-10 space-y-4">
            <div className="rounded-2xl border border-border bg-background/80 backdrop-blur p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Sponsored</p>
              </div>
              <h4 className="mt-3 text-lg font-semibold text-foreground">Taste of the Week</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Try the chef’s special platter with subtle spices and fresh sides.
              </p>
              <div className="mt-4 rounded-xl bg-secondary/60 px-4 py-3">
                <p className="text-xs text-muted-foreground">Limited offer</p>
                <p className="text-sm font-semibold text-foreground">Free drink with every platter</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/40 p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">New outlet</p>
              <p className="mt-2 text-sm font-semibold text-foreground">Kilimanjaro Bites</p>
              <p className="mt-1 text-xs text-muted-foreground">Authentic East African street food</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
