'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Package, AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/navbar';
import { getCustomerOrders } from '@/lib/apiHelper';

export default function CustomerOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isLoggedIn = status === 'authenticated';
  const token = session?.accessToken || null;

  useEffect(() => {
    if (isLoggedIn && session?.user?.id) {
      fetchOrders();
    }
  }, [isLoggedIn, session?.user?.id, token]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const customerId = session?.user?.id;
      const customerOrders = await getCustomerOrders(customerId, token);
      setOrders(customerOrders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertCircle className="w-24 h-24 mx-auto text-muted-foreground/30 mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">Please log in to view your orders</p>
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Go to Login
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Header */}
        <div className="w-full px-4 sm:px-8 lg:px-12 py-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Orders</h1>
            <p className="text-muted-foreground">Track and manage all your orders</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 py-12">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground mt-4">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <Package className="w-24 h-24 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6">You haven't placed any orders yet</p>
              <Link 
                href="/orders"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Place Your First Order
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground">
                            {order.items && order.items[0]?.name ? order.items[0].name : 'Order'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Order #<span className="font-mono">{order.id}</span>
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg border font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Outlet</p>
                          <p className="font-semibold text-foreground">{order.outlet_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cuisine</p>
                          <p className="font-semibold text-foreground">{order.outlet_category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <p className="font-semibold text-foreground">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-semibold text-foreground">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Items List */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-foreground">
                                {item.name} <span className="text-muted-foreground">×{item.quantity}</span>
                              </span>
                              <span className="font-semibold">Ksh{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="md:text-right">
                      <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        Ksh{order.total?.toFixed(2) || (order.items?.[0]?.price * order.quantity).toFixed(2) || '0.00'}
                      </p>
                      {order.estimated && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Est: {new Date(order.estimated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/orders"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Place New Order
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/dashboard/menu"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
            >
              Browse Menu
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
