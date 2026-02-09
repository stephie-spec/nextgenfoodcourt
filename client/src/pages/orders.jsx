'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, ChevronRight, ChevronLeft, Search, Filter, ShoppingCart, Plus, Minus, CreditCard, Shield, Truck, Phone, Info, Tag, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { createOrder } from '@/lib/apiHelper';

const API_BASE = 'http://localhost:5555';

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuData, setMenuData] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(['All']);
  const [showAllOutlets, setShowAllOutlets] = useState(false);

  const promoAds = [
    {
      id: 'freedeliv',
      title: 'Free Delivery',
      description: 'Orders over Ksh30 qualify for free delivery.',
      code: 'FREEDELIV',
    },
    {
      id: 'save10',
      title: 'Save 10% Today',
      description: 'Use code SAVE10 to unlock instant savings.',
      code: 'SAVE10',
    },
  ];

  // Amber theme for orders content
  const amberTheme = {
    '--primary': '#FDBA74',
    '--primary-foreground': '#000000',
    '--secondary': 'color-mix(in oklab, #FDBA74 10%, var(--background))',
    '--secondary-foreground': 'var(--foreground)',
    '--accent': 'color-mix(in oklab, #FDBA74 20%, var(--background))',
    '--accent-foreground': 'var(--foreground)',
    '--ring': '#FDBA74',
    '--border': 'color-mix(in oklab, #FDBA74 12%, var(--background))',
  };


  const isLoggedIn = status === 'authenticated';
  const token = session?.accessToken || null;

  const getItemImage = (imagePath) => {
    const finalImage = imagePath || 'default-food.jpg';
    return `http://localhost:5555/uploads/${finalImage.replace(/^\/+/, '')}`;
  };

  // Fetch menu data from backend API
  useEffect(() => {
    setMounted(true);
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }
      const data = await response.json();
      
      // Transform backend data into organized structure
      const organizedMenu = {};
      const categorySet = new Set();

      data.forEach(menuItem => {
        const outletId = menuItem.outlet_id;
        const outletName = menuItem.outlet_name;
        
        if (!organizedMenu[outletId]) {
          organizedMenu[outletId] = {
            outletId,
            outletName,
            items: [],
            outletImage: null,
            itemCount: 0
          };
        }

        if (menuItem.category) {
          categorySet.add(menuItem.category);
        }

        organizedMenu[outletId].itemCount += 1;
        if (organizedMenu[outletId].itemCount === 2) {
          organizedMenu[outletId].outletImage = getItemImage(menuItem.image_path);
        }

        // Add item to outlet
        organizedMenu[outletId].items.push({
          id: menuItem.item_id,
          name: menuItem.item_name,
          price: menuItem.price,
          menuOutletItemId: menuItem.id,
          image: getItemImage(menuItem.image_path),
          description: menuItem.description || 'Delicious food item',
          category: menuItem.category || 'Uncategorized',
          calories: 350
        });
      });

      setMenuData(Object.values(organizedMenu));

      const categoryList = ['All', ...Array.from(categorySet)];
      setCategories(categoryList);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setOrderMessage(`Failed to load menu items: ${error.message}`);
    }
  };

  // Filter outlets based on search
  const filteredOutlets = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();

    return menuData
      .map((outlet) => {
        const filteredItems = outlet.items.filter((item) => {
          const matchesSearch =
            !searchQuery ||
            item.name.toLowerCase().includes(searchLower) ||
            (item.description || '').toLowerCase().includes(searchLower);

          const matchesCategory =
            selectedCategory === 'All' || item.category === selectedCategory;

          return matchesSearch && matchesCategory;
        });

        return {
          ...outlet,
          items: filteredItems,
        };
      })
      .filter((outlet) => outlet.items.length > 0);
  }, [menuData, searchQuery, selectedCategory]);

  const visibleOutlets = showAllOutlets ? filteredOutlets : filteredOutlets.slice(0, 3);

  // Handle item quantity
  const updateItemQuantity = (menuOutletItemId, quantity) => {
    if (quantity <= 0) {
      const newItems = { ...selectedItems };
      delete newItems[menuOutletItemId];
      setSelectedItems(newItems);
    } else {
      setSelectedItems(prev => ({
        ...prev,
        [menuOutletItemId]: { 
          ...prev[menuOutletItemId], 
          quantity 
        }
      }));
    }
  };

  // Add item to order
  const handleAddItem = (outlet, item) => {
    const menuOutletItemId = item.menuOutletItemId;
    if (selectedItems[menuOutletItemId]) {
      updateItemQuantity(menuOutletItemId, selectedItems[menuOutletItemId].quantity + 1);
    } else {
      setSelectedItems(prev => ({
        ...prev,
        [menuOutletItemId]: {
          outletId: outlet.outletId,
          outletName: outlet.outletName,
          itemName: item.name,
          itemId: item.id,
          price: item.price,
          quantity: 1
        }
      }));
    }
  };

  // Calculate order totals
  const orderItems = Object.entries(selectedItems).map(([menuOutletItemId, item]) => ({
    menuOutletItemId: parseInt(menuOutletItemId),
    ...item
  }));

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 25 ? 0 : 4.99;
  const tax = (subtotal - promoDiscount) * 0.08;
  const total = subtotal - promoDiscount + deliveryFee + tax;

  // Apply promo code
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoDiscount(subtotal * 0.10);
      setPromoApplied(true);
    } else if (promoCode.toUpperCase() === 'FREEDELIV') {
      setPromoDiscount(deliveryFee);
      setPromoApplied(true);
    }
  };

  // Submit order to backend
  const handleOrderSubmit = async () => {
    if (!isLoggedIn) {
      setOrderMessage('Please log in to place an order');
      return;
    }

    if (orderItems.length === 0) {
      setOrderMessage('Please add items to your order');
      return;
    }

    setIsLoading(true);
    setOrderMessage('');

    try {
      const customerId = session?.user?.id || session?.sub;
      
      console.log('Session details:', { 
        sessionUser: session?.user, 
        sessionSub: session?.sub,
        customerId, 
        type: typeof customerId,
        asInt: parseInt(customerId)
      });
      console.log('Order items:', orderItems);
      
      if (!customerId) {
        setOrderMessage('Unable to identify customer. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Create orders for each item
      const orderPromises = orderItems.map(item => {
        const orderPayload = {
          customer_id: parseInt(customerId),
          menu_outlet_item_id: item.menuOutletItemId,
          quantity: item.quantity
        };
        
        console.log('Order payload:', orderPayload);
        return createOrder(orderPayload, token);
      });

      const results = await Promise.all(orderPromises);
      console.log('Order results:', results);
      
      const allSuccessful = results.every(r => r && (r.status === 201 || r.status === 200));
      
      if (allSuccessful) {
        setOrderMessage('✓ Order placed successfully!');
        setSelectedItems({});
        setPromoApplied(false);
        setPromoDiscount(0);
        setPromoCode('');
        setTimeout(() => setOrderMessage(''), 3000);
      } else {
        const failedResults = results.filter(r => !r || (r.status !== 201 && r.status !== 200));
        setOrderMessage(`Some orders failed. ${failedResults.length} items could not be ordered.`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Check if it's a customer not found error
      if (error.message.includes('Customer with id') && error.message.includes('not found')) {
        setOrderMessage('Your session has expired. Please log in again.');
      } else {
        setOrderMessage(`Failed to place order: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const orderSummary = (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Your Cart</h2>
      </div>

      {orderItems.length > 0 ? (
        <div className="max-h-64 overflow-y-auto space-y-3 border-b border-border pb-4">
          {orderItems.map((item) => (
            <div key={item.menuOutletItemId} className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <p className="font-semibold text-foreground">{item.itemName}</p>
                <p className="text-xs text-muted-foreground">{item.outletName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Ksh{(item.price * item.quantity).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">x{item.quantity}</p>
              </div>
              <button
                onClick={() => updateItemQuantity(item.menuOutletItemId, 0)}
                className="ml-2 p-1 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-muted-foreground text-sm">No items selected</p>
        </div>
      )}

      {orderItems.length > 0 && (
        <div className="space-y-3 border-b border-border pb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Promo Code
          </h3>
          {!promoApplied ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:border-primary text-sm"
              />
              <button
                onClick={applyPromoCode}
                className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Apply
              </button>
            </div>
          ) : (
            <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-sm">
              <p className="text-green-600 font-semibold">Code Applied!</p>
              <p className="text-green-600 text-xs">-Ksh{promoDiscount.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}

      {orderItems.length > 0 && (
        <div className="space-y-2 py-4 border-b border-border">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>Ksh{subtotal.toFixed(2)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-Ksh{promoDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Delivery</span>
            <span>{deliveryFee > 0 ? `Ksh${deliveryFee.toFixed(2)}` : 'FREE'}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax (8%)</span>
            <span>Ksh{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">Ksh{total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {orderMessage && (
        <div className={`p-3 rounded-lg text-sm font-semibold ${
          orderMessage.includes('success')
            ? 'bg-green-500/10 text-green-600 border border-green-500/30'
            : 'bg-red-500/10 text-red-600 border border-red-500/30'
        }`}>
          {orderMessage}
        </div>
      )}

      {orderItems.length > 0 && (
        <button
          onClick={handleOrderSubmit}
          disabled={isLoading || !isLoggedIn}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Placing Order...' : 'Place Order Now'}
        </button>
      )}

      {!isLoggedIn && (
        <p className="text-xs text-muted-foreground text-center">
          Please log in to place an order
        </p>
      )}
    </div>
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex min-h-screen bg-background" style={amberTheme}>
        {/* Left Sidebar - Promotional Ads */}
        <aside className="hidden xl:block w-80 p-6 bg-card border-r border-border overflow-y-auto">
          <div className="sticky top-24 space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
              <span className="text-primary">🎁</span>
              Special Offers
            </h2>
            <div className="space-y-4">
              {promoAds.map((ad) => (
                <div key={ad.id} className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">{ad.title}</h3>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{ad.code}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{ad.description}</p>
                  <button
                    onClick={() => setPromoCode(ad.code)}
                    className="mt-4 w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
                  >
                    Apply Code
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-border">
              <h3 className="font-semibold text-lg text-foreground mb-4">Need Help?</h3>
              <div className="space-y-3">
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>(123) 456-7890</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Delivery Areas</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <Info className="w-5 h-5" />
                  <span>FAQ & Support</span>
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto px-6 py-8">
          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-4xl font-bold mb-2 text-foreground">Order African Cuisine</h1>
            <p className="text-muted-foreground">Browse our selection of authentic African restaurants</p>
          </div>

          <div className="bg-card rounded-2xl shadow-sm p-6 mb-8 border border-border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                />
              </div>

              <button className="md:hidden flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl hover:bg-secondary transition-colors">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8 pb-8">
            {visibleOutlets.length > 0 ? (
              visibleOutlets.map((outlet) => (
                <section key={outlet.outletId} className="space-y-6">
                  <div className="relative overflow-hidden rounded-2xl border border-border h-64">
                    {outlet.outletImage && (
                      <div className="absolute inset-0">
                        <Image
                          src={outlet.outletImage}
                          alt={`${outlet.outletName} dishes`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 768px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="relative h-full flex items-end p-6">
                      <div className="flex items-end justify-between gap-4 w-full">
                        <div>
                          <h2 className="text-3xl font-bold text-white drop-shadow-lg">{outlet.outletName}</h2>
                          <p className="text-sm text-white/90 drop-shadow">{outlet.items.length} items available</p>
                        </div>
                        <button className="hidden sm:flex items-center gap-2 text-sm font-semibold text-white hover:text-white/80 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                          View Outlet
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {outlet.items.map((item) => {
                      const selectedItem = selectedItems[item.menuOutletItemId];

                      return (
                        <div
                          key={item.menuOutletItemId}
                          className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
                        >
                          <div className="relative h-44 overflow-hidden bg-secondary">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                              Ksh{item.price?.toFixed(2) || '0.00'}
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>

                            <div className="flex items-center gap-2 pt-2">
                              {selectedItem ? (
                                <div className="flex-1 flex items-center justify-between gap-2 px-3 py-2 bg-secondary rounded-xl">
                                  <button
                                    onClick={() => updateItemQuantity(item.menuOutletItemId, selectedItem.quantity - 1)}
                                    className="p-1 hover:text-primary transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-6 text-center font-semibold">{selectedItem.quantity}</span>
                                  <button
                                    onClick={() => updateItemQuantity(item.menuOutletItemId, selectedItem.quantity + 1)}
                                    className="p-1 hover:text-primary transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddItem(outlet, item)}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  Add Item
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            ) : (
              <div className="text-center py-20">
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No items found</h3>
                <p className="text-muted-foreground">Try adjusting your search</p>
              </div>
            )}
          </div>

          {filteredOutlets.length > 3 && (
            <div className="flex justify-center pb-6">
              <button
                onClick={() => setShowAllOutlets((prev) => !prev)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-secondary transition"
              >
                {showAllOutlets ? 'Show Less' : 'View All Outlets'}
                <ChevronRight className={`w-4 h-4 transition-transform ${showAllOutlets ? '-rotate-90' : 'rotate-90'}`} />
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Delivery Information</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Delivery times: 25-45 minutes</li>
                <li>• Free delivery on orders over $30</li>
                <li>• Track your order in real-time</li>
                <li>• Contactless delivery available</li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Payment Methods</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Credit & Debit Cards</li>
                <li>• Digital Wallets (Apple Pay, Google Pay)</li>
                <li>• Cash on Delivery</li>
                <li>• Gift Cards & Vouchers</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 lg:hidden">
            {orderSummary}
          </div>
        </main>

        <aside className="hidden lg:block w-96 p-6 bg-card border-l border-border">
          <div className="sticky top-24 space-y-4">
            {orderSummary}
          </div>
        </aside>
      </div>
    </div>
  );
}
