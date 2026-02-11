'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { MapPin, Flame, Clock, Star, ChevronRight, Search, Filter, ShoppingCart, Heart, X, Plus, Minus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import { useCart } from '@/lib/CartContext';
import { cuisineTypes, outletsData } from '@/lib/menuData';
import { toggleFavourite } from '@/lib/favourites';
import { useSession } from 'next-auth/react'; // For authentication purposes.

/* ---------------- PAGE ---------------- */

export default function MenuPage() {
  const searchParams = useSearchParams();
  const { addToCart, removeFromCart, cartItems, cartTotalItems } = useCart();
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [menuOutlets, setMenuOutlets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [favourites, setFavourites] = useState({});
  const [outletImageMap, setOutletImageMap] = useState({});
  const [itemImageMap, setItemImageMap] = useState({});
  const { data: session, status } = useSession(); // Session data for user auth.
  const token = session?.accessToken || null; // JWT
  const isLoggedIn = status === 'authenticated'; // To check authentication status on clicking the heart button.
  const userRole = session?.user?.role;

  // Initialize search from URL parameter on mount
  useEffect(() => {
    setMounted(true);
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOutletImages = async () => {
      try {
        const response = await fetch('http://localhost:5555/api/outlets');
        if (!response.ok) {
          throw new Error('Failed to fetch outlet images');
        }
        const data = await response.json();
        const outletsList = data.outlets || data;
        const imageMap = {};

        outletsList.forEach((outlet) => {
          const imagePath = outlet.image_path || 'default-outlet.jpg';
          const imageUrl = `http://localhost:5555/uploads/${imagePath.replace(/^\/+/, '')}`;
          imageMap[outlet.id] = imageUrl;
        });

        setOutletImageMap(imageMap);
      } catch (error) {
        console.error('Error fetching outlet images:', error);
      }
    };

    fetchOutletImages();
  }, []);

  useEffect(() => {
    const fetchMenuImages = async () => {
      try {
        const response = await fetch('/api/menu');
        if (!response.ok) {
          throw new Error('Failed to fetch menu images');
        }
        const data = await response.json();
        const imageMap = {};

        data.forEach((menuItem) => {
          const outletName = menuItem.outlet_name;
          const itemName = menuItem.item_name;
          const imagePath = menuItem.image_path || 'default-food.jpg';

          if (outletName && itemName) {
            const key = `${outletName}::${itemName}`.toLowerCase();
            imageMap[key] = `http://localhost:5555/uploads/${imagePath.replace(/^\/+/, '')}`;
          }
        });

        setItemImageMap(imageMap);
      } catch (error) {
        console.error('Error fetching menu images:', error);
      }
    };

    fetchMenuImages();
  }, []);


  const outletsWithImages = useMemo(() => {
    return menuOutlets.map((outlet) => {
      const backendImage = outletImageMap[outlet.outletId];
      return backendImage
        ? { ...outlet, image: backendImage, coverImage: backendImage }
        : outlet;
      });
    }, [menuOutlets, outletImageMap]);


  // const outletsWithImagesAndItems = useMemo(() => {
  //   return outletsWithImages.map((outlet) => ({
  //     ...outlet,
  //     items: (outlet.items || [])
  //     .filter(item => item && item.name)
  //     .map((item) => {
  //       const key = `${outlet.outletName}::${item.name}`.toLowerCase();
  //       const backendItemImage = itemImageMap[key];
  //       if (!backendItemImage) {
  //         return item;
  //       }
  //       return {
  //         ...item,
  //         image: backendItemImage || item.image
  //       };
  //     })
  //   }));
  // }, [itemImageMap, outletsWithImages]);

  const outletsWithImagesAndItems = useMemo(() => {
  return outletsWithImages.map((outlet) => ({
    ...outlet,
    items: (outlet.items || [])
      .filter(item => item && item.name)
      .map((item) => {
        const key = `${outlet.outletName}::${item.name}`.toLowerCase();
        const backendItemImage = itemImageMap[key];
        return {
          ...item,
          image: backendItemImage || item.image,  // Use backend image if available
          };
        })
      }));
    }, [outletsWithImages, itemImageMap]);

  // Filter outlets based on cuisine and search query
  const filteredOutlets = useMemo(() => {
    return outletsWithImagesAndItems.filter((outlet) => {
      const matchesCuisine = selectedCuisine === 'All' || outlet.cuisine === selectedCuisine;
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchQuery ||
        outlet.outletName.toLowerCase().includes(searchLower) ||
        outlet.cuisine.toLowerCase().includes(searchLower) ||
        outlet.items.some(item => item.name.toLowerCase().includes(searchLower));
      return matchesCuisine && matchesSearch;
    });
  }, [outletsWithImagesAndItems, selectedCuisine, searchQuery]);

  // Get quantity for an item
  const getItemQuantity = (outletId, itemName) => {
    // Create a unique ID for the item
    const itemId = `${outletId}-${itemName}`;
    return cartItems[itemId] || 0;
  };

  // Add item to cart
  const handleAddToCart = (outlet, item) => {
    const itemId = `${outlet.outletId}-${item.name}`;
    addToCart(itemId);
  };


// fetch outlets and menu from backend with descriptions
useEffect(() => {
  const fetchData = async () => {
    try {
      const [outletsRes, menuRes] = await Promise.all([
        fetch('http://localhost:5555/api/outlets'),
        fetch('http://localhost:5555/api/menu'),
      ]);

      if (!outletsRes.ok || !menuRes.ok) {
        console.warn('Menu fetch failed:', { outletsOk: outletsRes.ok, menuOk: menuRes.ok });
        setMenuOutlets([]);
        return;
      }

      const outletsDataBackend = await outletsRes.json();
      const menuData = await menuRes.json();

      // normalize outlets list from backend
      const outletsList = (outletsDataBackend.outlets || outletsDataBackend).reduce((acc, o) => {
        acc[o.id] = {
          outletId: o.id,
          outletName: o.name,
          cuisine: o.category_name || 'Uncategorized',
          location: '',
          rating: 0,
          deliveryTime: '',
          image: `http://localhost:5555/uploads/${(o.image_path || 'default-outlet.jpg').replace(/^\/+/, '')}`,
          coverImage: `http://localhost:5555/uploads/${(o.image_path || 'default-outlet.jpg').replace(/^\/+/, '')}`,
          items: [],
        };
        return acc;
      }, {});

      // menuData is an array of MenuOutletItem records from backend
      menuData.forEach((m) => {
        const outlet = outletsList[m.outlet_id] || {
          outletId: m.outlet_id,
          outletName: m.outlet_name || `Outlet ${m.outlet_id}`,
          cuisine: m.category || 'Uncategorized',
          image: `http://localhost:5555/uploads/${(m.image_path || 'default-food.jpg').replace(/^\/+/, '')}`,
          coverImage: `http://localhost:5555/uploads/${(m.image_path || 'default-food.jpg').replace(/^\/+/, '')}`,
          items: [],
        };

        outlet.items.push({
          id: m.item_id,
          name: m.item_name,
          price: m.price,
          image: `http://localhost:5555/uploads/${(m.image_path || 'default-food.jpg').replace(/^\/+/, '')}`,
          description: m.description || '',
          calories: m.calories || 0,
          is_available: m.is_available !== undefined ? m.is_available : true,
          favourite_count: 0,
          favourited: false,
        });

        outletsList[m.outlet_id] = outlet;
      });

      const menuOutletsArr = Object.values(outletsList);
      setMenuOutlets(menuOutletsArr);
    } catch (err) {
      console.error('Error loading backend menu:', err);
    }
  };

  fetchData();
}, []);

  // Handling the favourite toggle - heart button

  const handleFavourite = async (itemId) => {
    if (!token) {
      console.error('User not authenticated');
      return;
    }

    // Determine current state before update
    const currentItem = menuOutlets
      .flatMap(o => o.items)
      .find(i => i.id === itemId);
    const isCurrentlyFavourited = currentItem?.favourited || false;
    const action = isCurrentlyFavourited ? 'Removing' : 'Adding';
    
    console.log(`${action} favourite for item ID: ${itemId}`);

    // Update favourited data early - in order to reflect changes before actually making them.
    setMenuOutlets(prevOutlets =>
      prevOutlets.map(outlet => ({
        ...outlet,
        items: (outlet.items || []).map(item => {
          if (item.id !== itemId) return item;

          const currentFavourited =
            item.favourited ?? item.is_favourite ?? false;

          return {
            ...item,
            favourited: !currentFavourited,
            favourite_count: currentFavourited
              ? item.favourite_count - 1
              : item.favourite_count + 1,
          };
        }),
      }))
    );

    try {
      const response = await toggleFavourite(itemId, token);
      console.log(`✓ ${action} favourite successful:`, response);

      // Authoritative update from backend
      setMenuOutlets(prevOutlets =>
        prevOutlets.map(outlet => ({
          ...outlet,
          items: (outlet.items || []).map(item =>
            item.id === itemId
              ? {
                  ...item,
                  favourited: response.favourited,
                  favourite_count: response.favourite_count,
                }
              : item
          ),
        }))
      );
    } catch (error) {
      console.error(`✗ ${action} favourite failed:`, error);
    }
  };


// Fetch customer's favourites and add into menuOutlets - to persist the red heart button.

useEffect(() => {
  if (!token || !isLoggedIn) {
    console.log('Skipping favourites fetch: not authenticated');
    return;
  }

  const fetchCustomerFavourites = async () => {
    try {
      const response = await fetch('http://localhost:5555/api/customer/favourites', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // If not authorized or no favourites, just continue gracefully
      if (response.status === 401) {
        console.log('Favourites fetch unauthorized, continuing without');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Favourites API responded with ${response.status}: ${errorText}`);
        return;
      }

      const data = await response.json();
      const favouritedItemIds = new Set(
        data['Your Favourites']?.map(item => item.id) || []
      );

      // Update menuOutlets to mark favourited items
      setMenuOutlets(prevOutlets =>
        prevOutlets.map(outlet => ({
          ...outlet,
          items: (outlet.items || []).map(item => ({
            ...item,
            favourited: favouritedItemIds.has(item.id),
          })),
        }))
      );

      console.log('✓ Loaded customer favourites:', favouritedItemIds.size);
    } catch (error) {
      console.error('Error fetching customer favourites:', error);
      // Don't throw - just log and continue
    }
  };

  fetchCustomerFavourites();
}, [token, isLoggedIn]);


  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background pt-28 pb-16 px-4 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  {outletsWithImages.length} Outlets • {outletsWithImages.reduce((acc, o) => acc + o.items.length, 0)} Items
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
                  Our <span className="text-primary">Menu</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Discover authentic African cuisine from {outletsWithImages.length} unique outlets.
                  From Ethiopian injera to South African bobotie, taste the continent's finest flavors.
                </p>
                {searchQuery && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-full text-sm">
                    <Search className="w-4 h-4" />
                    <span>Showing results for "{searchQuery}"</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-accent/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search dishes or outlets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-72 pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="w-full sm:w-48 pl-10 pr-8 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  >
                    {cuisineTypes.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border py-4 px-4 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {cuisineTypes.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCuisine === cuisine
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Outlets Grid */}
        <div className="w-full px-4 sm:px-8 lg:px-12 py-12">
          <div className="max-w-7xl mx-auto space-y-16">
            {filteredOutlets.map((outlet) => (
              <section key={outlet.outletId} className="relative">
                {/* Outlet Header Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card to-card/50 border border-border mb-8">
                  {/* Cover Image */}
                  <div className="absolute inset-0 h-48 lg:h-64">
                    <Image
                      src={outlet.coverImage}
                      alt={outlet.outletName}
                      fill
                      sizes="100vw"
                      className="object-cover opacity-30"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent"></div>
                  </div>

                  <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row lg:items-end gap-6">
                    {/* Outlet Info */}
                    <div className="flex items-start gap-4 lg:gap-6">
                      <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 border-primary shadow-xl">
                        <Image
                          src={outlet.image}
                          alt={outlet.outletName}
                          fill
                          sizes="(max-width: 640px) 64px, 80px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                          {outlet.outletName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary" />
                            {outlet.location}
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-semibold">{outlet.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            {outlet.deliveryTime}
                          </div>
                          <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            <Flame className="w-3 h-3" />
                            {outlet.cuisine}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* View Outlet Button */}
                    <div className="lg:ml-auto">
                      <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25">
                        View Outlet
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {outlet.items.map((item, index) => {
                    const quantity = getItemQuantity(outlet.outletId, item.name);
                    // const itemId = item.id || `${outlet.outletId}-${item.name}`;
                    const itemId = item.id;
                    const favourited = item.favourited || false;

                    return (
                      <div
                        key={index}
                        className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
                      >
                        {/* Food Image */}
                        <div className="relative h-44 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized
                          />
                          <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                            Ksh{item.price.toFixed(2)}
                          </div>
                          {/* <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                            {item.calories} cal 
                          </div> */} {/* Calories removed, not in seed data. Can be added if desired.*/ }
                        </div>

                        {/* Card Content */}
                        <div className="p-4 space-y-3">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description || 'No description available'}
                          </p>

                          {/* Add to Cart Button */}
                          <div className="flex items-center gap-2 pt-2">
                            {quantity > 0 ? (
                              <div className="flex-1 flex items-center justify-between px-3 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl">
                                <button
                                  onClick={() => removeFromCart(`${outlet.outletId}-${item.name}`)}
                                  className="hover:opacity-80 transition-opacity"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-5 text-center">{quantity}</span>
                                <button
                                  onClick={() => handleAddToCart(outlet, item)}
                                  className="hover:opacity-80 transition-opacity"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(outlet, item)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </button>
                            )}
                            <button
                              disabled={!isLoggedIn}
                              onClick={() => handleFavourite(itemId)}
                              className="p-2.5 bg-secondary rounded-xl transition-colors hover:bg-secondary/80"
                            >
                              <Heart className={`w-5 h-5 transition-colors ${favourited ? 'text-red-500 fill-red-500' : 'text-muted-foreground hover:text-red-500'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* No Results */}
            {filteredOutlets.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filter</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCuisine('All'); }}
                  className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Floating Cart Button */}
        {cartTotalItems > 0 && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={() => window.location.href = '/cart'}
              className="flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground font-bold rounded-full shadow-2xl shadow-primary/40 hover:scale-110 transition-transform animate-bounce"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{cartTotalItems} Items</span>
              <span className="px-2 py-0.5 bg-primary-foreground text-primary rounded-full text-sm">
                Ksh{(cartTotalItems * 10).toFixed(2)}
              </span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
