'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, CreditCard, Smartphone, DollarSign, Wallet, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { createOrder } from '@/lib/apiHelper';
import Navbar from '@/components/navbar';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // Load checkout data from sessionStorage
    const data = sessionStorage.getItem('checkoutData');
    if (data) {
      setCheckoutData(JSON.parse(data));
    } else {
      // Redirect to cart if no checkout data
      router.push('/cart');
    }
  }, [router]);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: Smartphone,
      description: 'Mobile money transfer',
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Wallet,
      description: 'Direct bank account transfer',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: DollarSign,
      description: 'Pay when your order arrives',
      color: 'from-orange-500 to-orange-600',
    },
  ];

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
      // Prepare order data for backend
      const orderPayload = {
        customer_id: session.user.id,
        table_number: checkoutData.tableNumber,
        payment_method: selectedPayment,
        total_amount: checkoutData.total,
        items: checkoutData.items.map(item => ({
          item_name: item.name,
          quantity: item.quantity,
          price: item.price,
          outlet: item.outlet,
        })),
        promo_code: checkoutData.promoCode,
        discount_amount: checkoutData.promoDiscount,
        delivery_fee: checkoutData.deliveryFee,
        tax_amount: checkoutData.tax,
      };

      console.log('Creating order:', orderPayload);

      // Create order in backend
      const response = await createOrder(orderPayload, session.accessToken);
      
      if (response.status === 201 || response.status === 200) {
        setOrderId(response.data.id || response.data.order_id);
        setOrderPlaced(true);
        
        // Clear cart and checkout data
        clearCart();
        sessionStorage.removeItem('checkoutData');
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order. Please try again.');
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
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Checkout</h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-6">Select Payment Method</h2>

            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                    selectedPayment === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 bg-background'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`bg-linear-to-br ${method.color} p-3 rounded-lg flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {selectedPayment === method.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-primary-foreground rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Security Info */}
            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm">Your payment is secure</p>
                <p className="text-xs text-muted-foreground">All transactions are encrypted with SSL technology</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24 bg-background rounded-xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-4">Order Summary</h3>

              {checkoutData && (
                <>
                  <div className="space-y-3 pb-4 border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Table Number</span>
                      <span className="font-semibold text-foreground">Table {checkoutData.tableNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items ({checkoutData.items.length})</span>
                      <span className="font-semibold text-foreground">Ksh {checkoutData.subtotal.toFixed(2)}</span>
                    </div>
                    {checkoutData.promoDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({checkoutData.promoCode})</span>
                        <span>-Ksh {checkoutData.promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-semibold text-foreground">Ksh {checkoutData.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span className="font-semibold text-foreground">Ksh {checkoutData.tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 pb-6 border-b border-border flex justify-between">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-primary text-lg">Ksh {checkoutData.total.toFixed(2)}</span>
                  </div>
                </>
              )}

              <button
                onClick={handlePayment}
                disabled={isProcessing || !selectedPayment}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-6"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Complete Payment</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-muted-foreground mt-3">
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
