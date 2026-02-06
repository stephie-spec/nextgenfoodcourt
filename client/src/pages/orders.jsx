'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Flame, Clock, Star, ChevronRight, Search, Filter, ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight, Store, CreditCard, Shield, Truck, Phone, Info, Tag, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/navbar';
import { createOrder } from '@/lib/apiHelper';

const API_BASE = 'http://localhost:5555';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [menuData, setMenuData] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState(['All']);

  const isLoggedIn = status === 'authenticated';
  const token = session?.accessToken || null;

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
      const cuisines = new Set();

      data.forEach(menuItem => {
        const outletId = menuItem.outlet_id;
        const outletName = menuItem.outlet_name;
        
        if (!organizedMenu[outletId]) {
          organizedMenu[outletId] = {
            outletId,
            outletName,
            items: []
          };
        }

        // Add item to outlet
        organizedMenu[outletId].items.push({
          id: menuItem.items.item_id,
          name: menuItem.items.item_name,
          price: menuItem.items.price,
          menuOutletItemId: menuItem.id,
          image: '/food-1.jpg', // Default image - would come from backend
          description: 'Delicious food item',
          calories: 350
        });
      });

      setMenuData(Object.values(organizedMenu));
      
      // Extract unique cuisines (would ideally come from backend)
      setCuisineTypes(['All']);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setOrderMessage(`Failed to load menu items: ${error.message}`);
    }
  };

  // Filter outlets based on search
  const filteredOutlets = useMemo(() => {
    return menuData.filter((outlet) => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchQuery || 
        outlet.outletName.toLowerCase().includes(searchLower) ||
        outlet.items.some(item => item.name.toLowerCase().includes(searchLower));
      return matchesSearch;
    });
  }, [menuData, searchQuery]);

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

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Header */}
        <div className="w-full px-4 sm:px-8 lg:px-12 py-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-2">Place Your Order</h1>
            <p className="text-muted-foreground">Select items from our available menu</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Search Filter */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Search Menu
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search outlets or items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-lg border border-border focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Outlets and Items */}
              <div className="space-y-16">
                {filteredOutlets.length > 0 ? (
                  filteredOutlets.map((outlet) => (
                    <section key={outlet.outletId}>
                      {/* Outlet Header */}
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card to-card/50 border border-border mb-8 p-6">
                        <div className="flex items-start gap-4 lg:gap-6">
                          <div className="flex-1">
                            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                              {outlet.outletName}
                            </h2>
                            <p className="text-muted-foreground">{outlet.items.length} items available</p>
                          </div>
                        </div>
                      </div>

                      {/* Items Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        {outlet.items.map((item) => {
                          const selectedItem = selectedItems[item.menuOutletItemId];
                          
                          return (
                            <div
                              key={item.menuOutletItemId}
                              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
                            >
                              {/* Item Image */}
                              <div className="relative h-44 overflow-hidden bg-secondary">
                                <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                                  ${item.price?.toFixed(2) || '0.00'}
                                </div>
                                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                                  {item.calories} cal
                                </div>
                              </div>

                              {/* Card Content */}
                              <div className="p-4 space-y-3">
                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.description}
                                </p>

                                {/* Quantity Controls or Add Button */}
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
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-5 sticky top-24 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
                </div>

                {/* Order Items */}
                {orderItems.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-3 border-b border-border pb-4">
                    {orderItems.map((item) => (
                      <div key={item.menuOutletItemId} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{item.itemName}</p>
                          <p className="text-xs text-muted-foreground">{item.outletName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
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

                {/* Promo Code */}
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
                        <p className="text-green-600 text-xs">-${promoDiscount.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Totals */}
                {orderItems.length > 0 && (
                  <div className="space-y-2 py-4 border-b border-border">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-${promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Delivery</span>
                      <span>{deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'FREE'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {orderMessage && (
                  <div className={`p-3 rounded-lg text-sm font-semibold ${
                    orderMessage.includes('success')
                      ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                      : 'bg-red-500/10 text-red-600 border border-red-500/30'
                  }`}>
                    {orderMessage}
                  </div>
                )}

                {/* Order Button */}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
