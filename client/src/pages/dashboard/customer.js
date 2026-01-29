'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OrderCard from '@/components/OrderCard';
import AuthGuard from '@/components/AuthGuard';
import { TrendingUp, Clock, DollarSign, ShoppingBag } from 'lucide-react';


export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Mock orders - fetch('/api/orders/me')
    const mockOrders = [
      { id: 'ORD-001', date: '2024-01-15', total: 45.99, status: 'completed' },
      { id: 'ORD-002', date: '2024-01-16', total: 29.50, status: 'pending' },
      { id: 'ORD-003', date: '2024-01-10', total: 67.25, status: 'completed' },
    ];
    setOrders(mockOrders);
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <AuthGuard requiredRole="customer">
      <DashboardLayout title="Customer Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon="orders"
            trend="+12%"
            description="from last month"
            color="primary"
          />
          
          <StatCard
            title="Pending Orders"
            value={pendingOrders}
            icon="pending"
            color="orange"
          />
          
          <StatCard
            title="Total Spent"
            value={`$${totalSpent.toFixed(2)}`}
            icon="revenue"
            trend="+8%"
            description="from last month"
            color="green"
          />
          
          <StatCard
            title="Favorites"
            value="12"
            icon="users"
            description="Saved dishes"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <button className="text-primary font-medium hover:text-primary/80">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">No orders yet</p>
                    <button className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                      Order Now
                    </button>
                  </div>
                ) : (
                  orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Order Food Now
                </button>
                <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  View Favorites
                </button>
                <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Edit Profile
                </button>
                <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Need Help?
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Order #001</span>
                  </div>
                  <span className="text-sm text-gray-600">Preparing</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Order #002</span>
                  </div>
                  <span className="text-sm text-gray-600">On the way</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="font-medium">Order #003</span>
                  </div>
                  <span className="text-sm text-gray-600">Delivered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}