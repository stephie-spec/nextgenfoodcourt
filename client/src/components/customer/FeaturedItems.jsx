'use client'; // Enables client-side rendering and React hooks

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Optimized image handling
import Link from 'next/link'; // Client-side navigation
import { ShoppingCart, Heart, Plus, Minus, Check } from 'lucide-react'; // UI icons
import { useCart } from '@/lib/CartContext'; // Cart context for shared state

export default function FeaturedItems() {
  // Use CartContext instead of local state
  const { cartItems, addToCart, removeFromCart, getItemQuantity } = useCart();
  
  // Tracks wishlist state per item
  const [wishlist, setWishlist] = useState({});
  // Featured menu items
  const [items, setItems] = useState([]);
  // Loading state while fetching items
  const [loading, setLoading] = useState(true);

  // Fetch featured items from backend API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/menu');
        if (!response.ok) {
          console.warn('Featured items fetch failed:', response.status);
          setItems([]);
          setLoading(false);
          return;
        }
        const data = await response.json();
        const processedItems = data.slice(0, 8).map((menuItem) => ({
          id: menuItem.item_id,
          name: menuItem.item_name,
          outlet: menuItem.outlet_name,
          description: `${menuItem.category || 'Special'} from ${menuItem.outlet_name}`,
          category: menuItem.category || 'Main Course',
          price: menuItem.price || 0,
          image: menuItem.image_path
            ? `http://localhost:5555/uploads/${menuItem.image_path.replace(/^\/+/, '')}`
            : '/placeholder.svg',
        }));
        setItems(processedItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error);
        setItems([]);
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);

  // Toggle wishlist status for an item
  const toggleWishlist = (itemId) => {
    setWishlist((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Handle add to cart with feedback
  const handleAddToCart = (item) => {
    addToCart(item.id);
  };

  return (
    // Featured menu section
    <section id="menu" className="py-20 bg-secondary/30">
      <div className="xl:grid xl:grid-cols-[1fr_minmax(0,80rem)_18rem_1fr] xl:gap-12">
        <div className="xl:col-start-2 px-4 sm:px-6 lg:px-8">
          
          {/* Section header */}
          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-primary" />
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
                Our Menu
              </h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground">
              Featured Dishes
            </h3>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Loading delicious items...</p>
            </div>
          )}

          {/* Items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item) => {
              const quantity = getItemQuantity(item.id);
              
              return (
                <div
                  key={item.id}
                  className="bg-background rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 group shadow-md hover:shadow-xl"
                >
                  {/* Item image and actions */}
                  <div className="relative h-32 sm:h-40 overflow-hidden bg-muted">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />

                    {/* Category label */}
                    <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      {item.category}
                    </div>

                    {/* Wishlist toggle */}
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishlist[item.id]
                            ? 'fill-red-500 text-red-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Item details */}
                  <div className="p-4 space-y-3">
                    <h4 className="font-bold text-foreground">
                      {item.name}
                    </h4>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>

                    {/* Price and cart controls */}
                    <div className="flex items-end justify-between pt-2 border-t border-border">
                      <span className="text-xl font-bold text-primary">
                        Ksh{item.price.toFixed(2)}
                      </span>

                      {quantity > 0 ? (
                        // Quantity controls if item is in cart
                        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 hover:text-primary hover:bg-background rounded-md transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="p-1.5 hover:text-primary hover:bg-background rounded-md transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // Add-to-cart button
                        <button
                          onClick={() => handleAddToCart(item)}
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

          {/* View full menu CTA */}
          <div className="mt-12 text-center">
            <Link href="/dashboard/menu" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
              View Full Menu
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <aside className="hidden xl:block xl:col-start-3">
          <div className="sticky top-48 mt-10 space-y-4">
            <div className="rounded-2xl border border-border bg-background/80 backdrop-blur p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Quality Promise</p>
              </div>
              <h4 className="mt-3 text-lg font-semibold text-foreground">Fresh & Curated</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Every dish is reviewed for freshness, prep time, and flavor balance.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/40 p-5">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Personal Picks</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">Saved items sync</p>
              <p className="mt-1 text-xs text-muted-foreground">Access your favorites across devices.</p>
            </div>

            <div className="rounded-2xl border border-border bg-background/80 p-5">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Checkout</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">Secure payments</p>
              <p className="mt-1 text-xs text-muted-foreground">Pay with card or mobile money.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

// Custom chevron icon component
function ChevronRight(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
