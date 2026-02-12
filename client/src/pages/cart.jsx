'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight, Store, Clock, MapPin, Phone, CreditCard, Shield, Truck, Star, Info, Tag, X, Loader, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
// import { outletsData } from '@/lib/menuData';
import Navbar from '@/components/navbar';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, cartTotalItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');

  // Fetch menu data from backend and build a lookup map
  const [menuData, setMenuData] = useState([]);
  const [menuMap, setMenuMap] = useState({});
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoadingMenu(true);
        setMenuError(null);
        const res = await fetch('/api/menu');
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data = await res.json();
        setMenuData(data);
        // Build a map: key = `${outlet_id}-${item_name}`
        const map = {};
        data.forEach(item => {
          // Use backend outlet_id and item_name for key
          const key = `${item.outlet_id || item.outletId}-${item.item_name || item.name}`;
          map[key] = item;
        });
        setMenuMap(map);
      } catch (err) {
        setMenuError(err.message);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  // Get item details from backend menuMap or from add-ons
  const getItemDetails = (compositeId) => {
    // Handle add-ons: compositeId = "addon-{addonId}"
    if (compositeId.startsWith('addon-')) {
      const addonId = parseInt(compositeId.replace('addon-', ''));
      const addon = popularAddons.find(a => a.id === addonId);
      if (addon) {
        return {
          name: addon.name,
          outlet: addon.outlet,
          price: addon.price,
          image: '/placeholder.svg',
          category: 'Add-on',
          prepTime: 'N/A',
          calories: 0,
          description: addon.name,
        };
      }
      return { name: 'Unknown Add-on', outlet: 'Unknown Outlet', price: 0, image: '/placeholder.svg', category: 'Add-on', prepTime: 'N/A' };
    }
    // Handle regular menu items: compositeId = "outletId-itemName"
    const parts = compositeId.split('-');
    if (parts.length < 2) {
      return { name: 'Unknown Item', outlet: 'Unknown Outlet', price: 0, image: '/placeholder.svg', category: 'Unknown', prepTime: 'N/A' };
    }
    const outletId = parts[0];
    const itemName = parts.slice(1).join('-');
    const key = `${outletId}-${itemName}`;
    let item = menuMap[key];

    if (!item) {
      console.warn(`[getItemDetails] Exact key not found: "${compositeId}"`);

      const normalizedInput = compositeId.toLowerCase().trim();

      item = Object.values(menuMap).find(m => {
        const mOutlet = String(m.outlet_id || m.outletId || 'unknown');
        const mName = String(m.item_name || m.name || 'unknown-item').trim().toLowerCase();
        const mKey = `${mOutlet}-${mName}`;
        return mKey === normalizedInput;
      });

      if (item) {
        console.log(`[getItemDetails] Found via case-insensitive match for: "${compositeId}"`);
      }
    }

    if (!item) {
      const namePart = (compositeId.split('-')[1] || '').trim().toLowerCase();
      item = Object.values(menuMap).find(m =>
        (m.item_name || m.name || '').trim().toLowerCase() === namePart
      );
      if (item) {
        console.log(`[getItemDetails] Fallback name match for: "${compositeId}"`);
      }
    }
    if (!item) {
      return { name: 'Unknown Item', outlet: 'Unknown Outlet', price: 0, image: '/placeholder.svg', category: 'Unknown', prepTime: 'N/A' };
    }
    return {
      name: item.item_name || item.name,
      outlet: item.outlet_name || item.outlet,
      price: item.price,
      image: item.image_path ? `http://localhost:5555/uploads/${item.image_path.replace(/^\/+/, '')}` : '/placeholder.svg',
      category: item.category || 'Food Item',
      prepTime: item.prep_time || item.prepTime || 'N/A',
      calories: item.calories,
      description: item.description,
    };
  };

  // Popular add-ons
  const [selectedAddons, setSelectedAddons] = useState({});
  const popularAddons = [
    { id: 201, name: 'Extra Sauce', price: 50, outlet: 'All Outlets' },
    { id: 202, name: 'Extra Rice', price: 300, outlet: 'Zanzibari Spice House' },
    { id: 203, name: 'Grilled Chicken', price: 599, outlet: 'Lagos Grill' },
    { id: 204, name: 'Fresh Juice', price: 120, outlet: 'Capetown Kitchen' },
  ];

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonId]: !prev[addonId],
    }));
  };

  const addSelectedAddonsToCart = () => {
    Object.keys(selectedAddons).forEach(addonId => {
      if (selectedAddons[addonId]) {
        // Use composite ID: "addon-{addonId}"
        const compositeId = `addon-${addonId}`;
        addToCart(compositeId);
      }
    });
    setSelectedAddons({});
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    // Simulate loading time for smooth transition
    await new Promise(resolve => setTimeout(resolve, 800));

    // Pass cart data and table number to checkout page
    const checkoutData = {
      items: cartItemList,
      tableNumber: selectedTable,
      subtotal,
      deliveryFee,
      tax,
      total,
      promoDiscount,
      promoCode: promoApplied ? promoCode : null,
    };

    // Store in sessionStorage for checkout page
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

    router.push('/checkout');
  };

  // Calculate totals
  const cartItemList = Object.entries(cartItems)
    .filter(([_, quantity]) => typeof quantity === 'number')
    .map(([id, quantity]) => ({
      id,
      quantity,
      ...getItemDetails(id),
    }));

  if (loadingMenu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-lg text-muted-foreground">Loading menu...</span>
      </div>
    );
  }
  if (menuError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-lg text-red-500">{menuError}</span>
      </div>
    );
  }

  const subtotal = cartItemList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 25 ? 0 : 4.99;
  const tax = (subtotal - promoDiscount) * 0.08;
  const total = subtotal - promoDiscount + deliveryFee + tax;

  // Handle promo code
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoDiscount(subtotal * 0.10);
      setPromoApplied(true);
    } else if (promoCode.toUpperCase() === 'FREEDELIV') {
      setPromoDiscount(4.99);
      setPromoApplied(true);
    }
  };

  // Promo codes info
  const promoCodes = [
    { code: 'SAVE10', discount: '10% Off', description: 'Get 10% off your order' },
    { code: 'FREEDELIV', discount: '$4.99', description: 'Free delivery' },
    { code: 'FIRST20', discount: '20% Off', description: 'First order discount' },
  ];

  if (cartTotalItems === 0) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingCart className="w-24 h-24 mx-auto text-muted-foreground/30 mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/dashboard/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Browse Menu
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Empty Cart Tips */}
            <div className="mt-12 p-6 bg-secondary/30 rounded-xl">
              <h3 className="font-semibold text-foreground mb-4">While you're here...</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <Link href="/special-offers" className="p-4 bg-background rounded-lg hover:border-primary border border-border transition-colors">
                  <Tag className="w-8 h-8 text-accent mb-2" />
                  <h4 className="font-semibold text-foreground">Check Special Offers</h4>
                  <p className="text-sm text-muted-foreground">Up to 50% off select items</p>
                </Link>
                <Link href="/outlets" className="p-4 bg-background rounded-lg hover:border-primary border border-border transition-colors">
                  <Store className="w-8 h-8 text-primary mb-2" />
                  <h4 className="font-semibold text-foreground">Explore Outlets</h4>
                  <p className="text-sm text-muted-foreground">20+ African cuisines</p>
                </Link>
                <Link href="/dashboard/menu" className="p-4 bg-background rounded-lg hover:border-primary border border-border transition-colors">
                  <Star className="w-8 h-8 text-yellow-500 mb-2" />
                  <h4 className="font-semibold text-foreground">Customer Favorites</h4>
                  <p className="text-sm text-muted-foreground">Top rated dishes</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ArrowRight className="w-4 h-4" />
          <Link href="/dashboard/menu" className="hover:text-foreground">Menu</Link>
          <ArrowRight className="w-4 h-4" />
          <span className="text-foreground">Cart</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Your Cart</h1>
            <p className="text-muted-foreground">{cartTotalItems} item{cartTotalItems !== 1 ? 's' : ''} from {cartItemList.map(i => i.outlet).filter((v, i, a) => a.indexOf(v) === i).length} outlet{cartItemList.map(i => i.outlet).filter((v, i, a) => a.indexOf(v) === i).length !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/dashboard/menu"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Add More Items
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Promo & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Promo Code */}
            <div className="bg-background rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Promo Code
              </h3>
              {!promoApplied ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary rounded-lg border border-border focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-semibold text-sm">Code Applied!</span>
                    <button onClick={() => { setPromoApplied(false); setPromoDiscount(0); setPromoCode(''); }}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                  <p className="text-green-600 text-sm">-Ksh{promoDiscount.toFixed(2)} discount</p>
                </div>
              )}

              {/* Available Promo Codes */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Try these codes:</p>
                <div className="space-y-2">
                  {promoCodes.map((promo) => (
                    <button
                      key={promo.code}
                      onClick={() => setPromoCode(promo.code)}
                      className="w-full text-left p-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <span className="text-xs font-semibold text-primary">{promo.code}</span>
                      <p className="text-[10px] text-muted-foreground">{promo.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-background rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Delivery Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>25-35 min delivery</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Within 5km radius</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Contactless delivery</span>
                </div>
              </div>
              {deliveryFee > 0 && (
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-600">
                    Add Ksh{(25 - subtotal).toFixed(2)} more for free delivery!
                  </p>
                </div>
              )}
            </div>

            {/* Popular Add-ons */}
            <div className="bg-background rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                Popular Add-ons
              </h3>
              <div className="space-y-3">
                {popularAddons.map((addon) => (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${selectedAddons[addon.id]
                        ? 'bg-primary text-primary-foreground border border-primary'
                        : 'bg-secondary/50 text-foreground hover:bg-secondary border border-border'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedAddons[addon.id]
                          ? 'bg-primary-foreground border-primary-foreground'
                          : 'border-muted-foreground'
                        }`}>
                        {selectedAddons[addon.id] && <span className="text-xs font-bold text-primary">✓</span>}
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium">{addon.name}</span>
                        <p className="text-xs opacity-75">{addon.outlet}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">+Ksh{addon.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
              {Object.values(selectedAddons).some(v => v) && (
                <button
                  onClick={addSelectedAddonsToCart}
                  className="w-full mt-4 py-2.5 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Add Selected Add-ons to Cart
                </button>
              )}
            </div>

            {/* Customer Support */}
            <div className="bg-linear-to-br from-primary/10 to-accent/10 rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-3">Our customer support team is available 24/7</p>
              <button className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Support
              </button>
            </div>
          </div>

          {/* Center - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItemList.map((item) => (
              <div
                key={item.id}
                className="bg-background rounded-xl border border-border p-4 flex gap-4 hover:border-primary transition-colors"
              >
                {/* Item Image - Only show for non-add-ons */}
                {item.category !== 'Add-on' && (
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={
                        item.image && !item.image.startsWith('http')
                          ? `http://localhost:5555/uploads/${item.image.replace(/^\/+/, '')}`
                          : item.image
                      }
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 96px, 128px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{item.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Store className="w-4 h-4" />
                        <span>{item.outlet}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.prepTime}</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 text-xs bg-secondary rounded-full mt-1">
                        {item.category}
                      </span>
                    </div>
                    <button
                      onClick={() => updateQuantity(item.id, 0)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 hover:text-primary hover:bg-background rounded-md transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item.id)}
                        className="p-1.5 hover:text-primary hover:bg-background rounded-md transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <span className="text-lg font-bold text-primary">
                      Ksh{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          </div>

          {/* Right Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-background rounded-xl border border-border p-5 sticky top-24">
              {/* Order Summary Header */}
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Summary</h2>
              </div>

              {/* Order Items Preview */}
              <div className="max-h-40 overflow-y-auto mb-4 space-y-2">
                {cartItemList.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-secondary rounded flex items-center justify-center text-xs font-semibold">
                      {item.quantity}
                    </span>
                    <span className="flex-1 truncate text-muted-foreground">{item.name}</span>
                    <span className="font-semibold">Ksh{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Summary Details */}
              <div className="space-y-3 py-4 border-t border-b border-border mb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Ksh{subtotal.toFixed(2)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-Ksh{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>{deliveryFee > 0 ? `Ksh${deliveryFee.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span>Ksh{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">Ksh{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-2">Accepted Payment Methods</p>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-secondary rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 p-2 bg-secondary rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">M-Pesa</span>
                  </div>
                  <div className="flex-1 p-2 bg-secondary rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">Cash</span>
                  </div>
                </div>
              </div>

              {/* Table Number Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-3">Table Number</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Select your table number...</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((table) => (
                    <option key={table} value={table}>
                      Table {table}
                    </option>
                  ))}
                </select>
                {!selectedTable && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Please select a table to continue
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || cartTotalItems === 0 || !selectedTable}
                className="w-full py-3 sm:py-4 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors mb-3 flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              {/* Continue Shopping */}
              <Link
                href="/dashboard/menu"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>

              {/* Safety Info */}
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure checkout with SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
