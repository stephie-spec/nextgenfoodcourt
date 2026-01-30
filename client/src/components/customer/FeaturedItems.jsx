'use client'; // Enables client-side rendering and React hooks

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Optimized image handling
import { ShoppingCart, Heart, Plus, Minus } from 'lucide-react'; // UI icons

export default function FeaturedItems() {
  // Tracks item quantities in cart (keyed by item ID)
  const [cartItems, setCartItems] = useState({});
  // Tracks wishlist state per item
  const [wishlist, setWishlist] = useState({});
  // Featured menu items
  const [items, setItems] = useState([]);
  // Loading state while fetching items
  const [loading, setLoading] = useState(true);

  // Fetch featured items (mocked for now)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // TODO: Replace mock data with backend API call
        setItems([
          { id: 1, name: 'Jollof Rice', outlet: 'Naija Kitchen', description: 'A traditional West African rice dish', category: 'Main Course', price: 12.99, image: '/food-1.jpg' },
          { id: 2, name: 'Fried Plantain', outlet: 'Afro Delights', description: 'Crispy fried plantain slices', category: 'Side Dish', price: 6.49, image: '/food-2.jpg' },
          { id: 3, name: 'Yam Porridge', outlet: 'Yam Bliss', description: 'Rich and creamy yam porridge', category: 'Staple', price: 8.99, image: '/food-3.jpg' },
          { id: 4, name: 'Egusi Soup', outlet: 'Egusi Express', description: 'A hearty egusi soup with vegetables', category: 'Soup', price: 10.99, image: '/food-4.jpg' },
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error);
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);

  // Increase quantity of an item in cart
  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  // Decrease quantity or remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  // Toggle wishlist status for an item
  const toggleWishlist = (itemId) => {
    setWishlist((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    // Featured menu section
    <section id="menu" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
          {items.map((item) => (
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
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
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
                    ${item.price.toFixed(2)}
                  </span>

                  {cartItems[item.id] ? (
                    // Quantity controls if item is in cart
                    <div className="flex items-center gap-2 bg-secondary rounded-lg">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 hover:text-primary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">
                        {cartItems[item.id]}
                      </span>
                      <button
                        onClick={() => addToCart(item.id)}
                        className="p-1 hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    // Add-to-cart button
                    <button
                      onClick={() => addToCart(item.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View full menu CTA */}
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
            View Full Menu
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
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
