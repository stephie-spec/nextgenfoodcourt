'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, CreditCard, Smartphone, Banknote, Building2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { createOrder } from '@/lib/apiHelper';
import Navbar from '@/components/navbar';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    accountNumber: '',
    bankName: '',
    routingNumber: '',
  });

  useEffect(() => {
    // Load checkout data from sessionStorage
    const data = sessionStorage.getItem('checkoutData');
    if (data) {
      setCheckoutData(JSON.parse(data));
    } else {
      // Redirect to cart if no checkout data
      router.push('/cart');
    }

    // Fetch menu items to get their IDs
    const fetchMenuItems = async () => {
      try {
        const res = await fetch('/api/menu');
        if (res.ok) {
          const items = await res.json();
          setMenuItems(items);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, [router]);

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: Banknote,
      description: 'Pay when you receive your order',
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: Smartphone,
      description: 'Mobile money payment',
    },
    {
      id: 'credit',
      name: 'Credit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Amex',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building2,
      description: 'Direct bank transfer',
    },
  ];

  const handleInputChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }

    if (!session?.user?.id || !session?.accessToken) {
      alert('Please log in to complete your order');
      router.push('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // Filter out add-ons and create orders only for menu items
      const menuCartItems = checkoutData.items.filter(item => item.category !== 'Add-on');

      if (menuCartItems.length === 0) {
        throw new Error('No valid menu items in cart');
      }

      // Find menu item IDs for each cart item
      const orderPromises = menuCartItems.map(async (cartItem) => {
        // Find the menu item that matches this cart item
        const menuItem = menuItems.find(
          m => m.item_name === cartItem.name && m.outlet_name === cartItem.outlet
        );

        if (!menuItem) {
          throw new Error(`Menu item not found: ${cartItem.name} at ${cartItem.outlet}`);
        }

        // Create individual order for each item
        const orderPayload = {
          customer_id: parseInt(session.user.id),
          menu_outlet_item_id: menuItem.id,
          quantity: cartItem.quantity,
          table_number: parseInt(checkoutData.tableNumber) || null
        };

        console.log('Creating order:', orderPayload);
        return createOrder(orderPayload, session.accessToken);
      });

      // Wait for all orders to be created
      const results = await Promise.all(orderPromises);

      if (results.length > 0 && (results[0].status === 201 || results[0].status === 200)) {
        // Use the first order ID as reference
        setOrderId(results[0].data.id);
        setOrderPlaced(true);

        // Clear cart and checkout data
        clearCart();
        sessionStorage.removeItem('checkoutData');
      } else {
        throw new Error('Failed to create orders');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Failed to place order: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueShopping = () => {
    router.push('/dashboard/menu');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <CheckCircle2 className="w-24 h-24 mx-auto text-green-500 mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-2">Thank you for your order</p>
            <p className="text-sm text-muted-foreground mb-8">Your order confirmation has been sent to your email</p>

            <div className="bg-secondary/50 rounded-xl p-6 mb-8 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-semibold">#{orderId || Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Table Number:</span>
                  <span className="font-semibold">Table {checkoutData?.tableNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-semibold capitalize">{selectedPayment?.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">Ksh {checkoutData?.total?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Delivery:</span>
                  <span className="font-semibold">30-45 minutes</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleContinueShopping}
                className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Continue Shopping
              </button>
              <Link
                href="/dashboard/customer"
                className="flex-1 py-3 px-4 bg-secondary text-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors text-center"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/cart" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Complete Your Payment</h1>
            <p className="text-red-100">Choose your preferred payment method</p>
          </div>

          <div className="p-8">
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Table Number</span>
                  <span>Table {checkoutData.tableNumber}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Ksh {checkoutData.subtotal.toFixed(2)}</span>
                </div>
                {checkoutData.promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({checkoutData.promoCode})</span>
                    <span>-Ksh {checkoutData.promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>Ksh {checkoutData.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>Ksh {checkoutData.tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-gray-300 my-3"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">Ksh {checkoutData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handlePayment();
              }}
            >
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                          className="mt-1"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <Icon
                              className={`w-5 h-5 ${selectedPayment === method.id ? 'text-blue-600' : 'text-gray-600'
                                }`}
                            />
                            <span className="font-semibold">{method.name}</span>
                          </div>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                        {selectedPayment === method.id && (
                          <CheckCircle2 className="w-6 h-6 text-blue-600 absolute top-4 right-4" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8">
                {selectedPayment === 'cash' && (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Banknote className="w-6 h-6 text-green-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-2">Cash on Delivery Selected</h3>
                        <p className="text-sm text-green-800">
                          Please keep the exact amount ready. Our delivery agent will collect the payment when your order arrives.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === 'mpesa' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">M-Pesa Payment Details</h3>
                    <div>
                      <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="+254 712 345 678"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter your M-Pesa registered phone number</p>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Note:</strong> You will receive an STK push notification on your phone to complete the payment.
                      </p>
                    </div>
                  </div>
                )}

                {selectedPayment === 'credit' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Credit Card Details</h3>
                    <div>
                      <label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">Card Number</label>
                      <input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        maxLength={19}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cardName" className="text-sm font-medium text-gray-700">Cardholder Name</label>
                      <input
                        id="cardName"
                        name="cardName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                          id="expiryDate"
                          name="expiryDate"
                          type="text"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="text-sm font-medium text-gray-700">CVV</label>
                        <input
                          id="cvv"
                          name="cvv"
                          type="text"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === 'bank' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Bank Transfer Details</h3>
                    <div>
                      <label htmlFor="bankName" className="text-sm font-medium text-gray-700">Bank Name</label>
                      <input
                        id="bankName"
                        name="bankName"
                        type="text"
                        placeholder="Select or enter your bank"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">Account Number</label>
                      <input
                        id="accountNumber"
                        name="accountNumber"
                        type="text"
                        placeholder="Enter your account number"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="routingNumber" className="text-sm font-medium text-gray-700">Routing Number</label>
                      <input
                        id="routingNumber"
                        name="routingNumber"
                        type="text"
                        placeholder="Enter routing number"
                        value={formData.routingNumber}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Processing Time:</strong> Bank transfers may take 1-3 business days to process.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-12 text-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  {isProcessing ? 'Processing...' : `Complete Payment - Ksh ${checkoutData.total.toFixed(2)}`}
                </button>
                <p className="text-center text-xs text-gray-500">
                  By completing this payment, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Secure 256-bit SSL encrypted payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
