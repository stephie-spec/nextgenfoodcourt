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
import { useSession } from 'next-auth/react';


export default function CustomerDashboard() {
  const { data: session } = useSession();
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
    if (!session?.accessToken || !session?.user?.id) {
      console.log('No session data');
      setLoading(false);
      return;
    }

    setLoading(true);

    apiHelper.getCustomerOrders(session.accessToken, session.user.id)
      .then(data => {
        console.log('Orders from apiHelper:', data);
        setOrders(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setOrders([]);
        setLoading(false);
      });
  }, [session]);

    const handleOrderUpdate = (updatedOrder) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  }


  const activeOrders = Array.isArray(orders)
    ? orders.filter(o => o.estimated_status !== 'completed')
    : [];

  const pastOrders = Array.isArray(orders)
    ? orders.filter(o => o.estimated_status === 'completed')
    : [];

  return (
    <AuthGuard requiredRole="customer">
      <DashboardLayout title="Customer Dashboard">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <StatCard
            title="Active"
            value={activeOrders.length}
            icon="orders"
            description="orders"
            color="indigo"
          />
          <StatCard
            title="Bookings"
            value="2"
            icon="users"
            description="this month"
            color="green"
          />
          <StatCard
            title="Rating"
            value="4.7★"
            icon="star"
            description="average"
            color="orange"
          />
          <StatCard
            title="Total"
            value={orders.length}
            icon="total"
            description="orders"
            color="purple"
          />
        </div>

        {/* Link to outlets page */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-blue-900">Want to order?</h3>
              <p className="text-blue-700 text-sm sm:text-base">Browse all food court outlets</p>
            </div>
            <a
              href="/outlets"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              View Outlets <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 mb-4">
          <div className="flex min-w-max px-4 sm:px-0">
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        placeholder="Search your orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {activeOrders
                  .filter(order => {
                    if (searchTerm && !order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
                      return false;
                    }
                    if (statusFilter !== 'all' && order.estimated_status !== statusFilter) {
                      return false;
                    }
                    return true;
                  })
                  .map(order => (
                    <OrderCard key={order.id} order={order} isOwner={false} />
                  ))}

                {activeOrders.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No Active Orders</h3>
                    <p className="text-gray-500 mt-2">Your active orders will appear here</p>
                  </div>
                )}
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="newest">Sort by: Newest</option>
                    <option value="oldest">Sort by: Oldest</option>
                    <option value="price-high">Sort by: Price High</option>
                    <option value="price-low">Sort by: Price Low</option>
                  </select>
                </div>
              </div>

              {/* Order history */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {pastOrders
                  .filter(order => {
                    if (searchTerm && !order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
                      return false;
                    }
                    return true;
                  })
                  .sort((a, b) => {
                    switch (sortOption) {
                      case 'newest':
                        return new Date(b.created_at) - new Date(a.created_at);
                      case 'oldest':
                        return new Date(a.created_at) - new Date(b.created_at);
                      case 'price-high':
                        return b.total - a.total;
                      case 'price-low':
                        return a.total - b.total;
                      default:
                        return 0;
                    }
                  })
                  .map(order => (
                    <OrderCard key={order.id} order={order} isOwner={false} onOrderUpdate={handleOrderUpdate} />
                  ))}

                {pastOrders.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No Order History</h3>
                    <p className="text-gray-500 mt-2">Your past orders will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </DashboardLayout>
    </AuthGuard>
  );
}