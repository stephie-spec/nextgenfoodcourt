'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OrderCard from '@/components/OrderCard';
import OutletCard from '@/components/OutletCard';
import Tabs from '@/components/Tabs';
import AuthGuard from '@/components/AuthGuard';
import { Search, Filter, ShoppingBag, Star, Clock, Heart, Store, ArrowRight } from 'lucide-react';
import { apiHelper } from '@/lib/apiHelper';

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  const tabs = [
    { id: 'orders', label: 'Active Orders' },
    { id: 'history', label: 'Order History' },
  ];


  useEffect(() => {
    setLoading(true);

    // Fetch from backend using apiHelper
    apiHelper.getCustomerOrders()
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        // Fallback to empty array
        setOrders([]);
        setLoading(false);
      });
  }, []);


  const activeOrders = Array.isArray(orders)
    ? orders.filter(o => o.estimated_status !== 'delivered')
    : [];

  const pastOrders = Array.isArray(orders)
    ? orders.filter(o => o.estimated_status === 'delivered')
    : [];


  return (
    <AuthGuard requiredRole="customer">
      <DashboardLayout title="Customer Dashboard">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <StatCard
            title="Table Bookings"
            value="2"
            icon="users"
            description="this month"
            color="green"
          />

          <StatCard
            title="Your Rating"
            value="4.7★"
            icon="star"
            description="average given"
            color="yellow"
          />

          <StatCard
            title="Total Orders"
            value={orders.length}
            icon="orders"
            description="this month"
            color="purple"
          />
        </div>

        {/* Link to outlets page */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-blue-900">Want to order?</h3>
              <p className="text-blue-700">Browse all food court outlets</p>
            </div>
            <a
              href="/outlets"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Outlets <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search your orders..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Preparing</option>
                    <option>Ready</option>
                    <option>Delivered</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {activeOrders.map(order => (
                  <OrderCard key={order.id} order={order} isOwner={false} />
                ))}
              </div>
            </div>
          )}


          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              {/* Add Search/Filter */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search order history..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Sort by: Newest</option>
                    <option>Sort by: Oldest</option>
                    <option>Sort by: Price High</option>
                    <option>Sort by: Price Low</option>
                  </select>
                </div>
              </div>

              {/* Two-column grid for history */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastOrders.map(order => (
                  <OrderCard key={order.id} order={order} isOwner={false} />
                ))}
              </div>
            </div>
          )}
        </div>

      </DashboardLayout>
    </AuthGuard>
  );
}
