'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OrderCard from '@/components/OrderCard';
import OutletCard from '@/components/OutletCard';
import BookingCard from '@/components/BookingCard'
import Tabs from '@/components/Tabs';
import AuthGuard from '@/components/AuthGuard';
import { Search, Filter, ShoppingBag, Star, Clock, Heart, Store, ArrowRight, RefreshCw, Calendar } from 'lucide-react';
import { apiHelper } from '@/lib/apiHelper';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { showToast } from '@/lib/toast';


export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('orders');
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isRefreshingBookings, setIsRefreshingBookings] = useState(false);
  const [activeBookingTab, setActiveBookingTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_BASE = 'http://localhost:5555';

  const tabs = [
    { id: 'orders', label: 'Active Orders' },
    { id: 'bookings', label: 'Reservations' },
    { id: 'history', label: 'Order History' },
  ];

const fetchCustomerBookings = async (token, customerId) => {
  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`);

    const ordersData = await response.json();
    console.log('All orders for bookings filter:', ordersData);

    // Filter orders that belong to this customer AND have a table booking
    const customerBookings = ordersData
      .filter(order => 
        String(order.customer_id) === String(customerId) && 
        order.table_booking
      )
      .map(order => ({
        id: order.table_booking.id,
        order_id: order.id,
        table_number: order.table_booking.table_number,
        capacity: order.table_booking.capacity || 4,
        status: order.table_booking.status || order.status || 'pending',
        created_at: order.table_booking.created_at || order.created_at,
        booking_date: order.table_booking.booking_date || null,
        booking_time: order.table_booking.booking_time || null,
        duration: order.table_booking.duration || null,
        special_requests: order.table_booking.special_requests || '',
        outlet_name: order.outlet_name || 'Unknown Outlet',
        outlet_id: order.outlet_id || null,
        customer_name: order.customer_name || 'You',
        customer_id: order.customer_id,
        items: order.items || [],
        total: order.total || 0,
        // For display consistency
        formatted_date: order.table_booking.booking_date 
          ? new Date(order.table_booking.booking_date).toLocaleDateString() 
          : null,
        formatted_time: order.table_booking.booking_time || null
      }));

    console.log(`Found ${customerBookings.length} table bookings for customer`);
    return customerBookings;
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    showToast('Failed to load reservations', 'error');
    return [];
  }
};


  useEffect(() => {
    if (!session || status === 'loading') {
      setLoading(false);
      return;
    }

    // Get auth data - prefer session, fallback to localStorage
    const token = session?.accessToken || localStorage.getItem('auth_token');
    const customerId = session?.user?.id || localStorage.getItem('user_id');
    const userRole = session?.user?.role || localStorage.getItem('user_role');

    // Optional safety check
    if (!token || !customerId || userRole !== 'customer') {
      console.warn('Missing required auth data in CustomerDashboard');
      setLoading(false);
      return;
    }
    setLoading(true);

    apiHelper.getCustomerOrders(token, customerId)
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

fetchCustomerBookings(token, customerId)
  .then(data => {
    setBookings(data);
  })
  .catch(error => {
    console.error('Error fetching bookings:', error);
    setBookings([]);
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
    ? orders.filter(o => ['pending', 'confirmed'].includes(o.estimated_status))
    : [];

  const pastOrders = Array.isArray(orders)
    ? orders.filter(o => ['completed', 'cancelled'].includes(o.estimated_status))
    : [];

  const refreshOrders = async () => {
    if (!session?.accessToken || !session?.user?.id) return;

    setIsRefreshing(true);
    try {
      const data = await apiHelper.getCustomerOrders(session.accessToken, session.user.id);
      setOrders(data);
      showToast('Orders refreshed successfully!', 'success');   // ← use your toast
    } catch (err) {
      console.error('Refresh failed:', err);
      showToast('Failed to refresh orders', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };


  const handleBookingUpdate = (updatedBooking) => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      )
    );
  };

  const activeBookings = bookings.filter(b =>
    ['pending', 'confirmed', 'checked-in'].includes(b.status)
  );

  const pastBookings = bookings.filter(b =>
    ['completed', 'cancelled', 'no-show'].includes(b.status)
  );

  // Refresh bookings
const refreshBookings = async () => {
  if (!session?.accessToken || !session?.user?.id) return;
  
  setIsRefreshingBookings(true);
  try {
    const token = session.accessToken || localStorage.getItem('auth_token');
    const customerId = session.user.id || localStorage.getItem('user_id');
    
    const bookingsData = await fetchCustomerBookings(token, customerId);
    setBookings(bookingsData);
    
    showToast('Bookings refreshed successfully!', 'success');
  } catch (err) {
    console.error('Failed to refresh bookings:', err);
    showToast('Failed to refresh bookings', 'error');
  } finally {
    setIsRefreshingBookings(false);
  }
};

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
            <Link
              href="/outlets"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              View Outlets <ArrowRight className="w-4 h-4" />
            </Link>
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
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={refreshOrders}
                    disabled={isRefreshing}
                    title="Refresh orders"
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isRefreshing ? 'opacity-60 cursor-not-allowed animate-spin' : ''
                      }`}
                    aria-label="Refresh orders"
                  >
                    <RefreshCw className="w-5 h-5 text-gray-600" />
                  </button>
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
                    <OrderCard key={order.id} order={order} isOwner={false} onOrderUpdate={handleOrderUpdate} />
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

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-xl font-bold text-gray-900">Table Reservations</h2>
      
      {/* Refresh Button */}
      <button
    onClick={refreshBookings}
    disabled={isRefreshingBookings}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      isRefreshingBookings
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-primary/10 text-primary hover:bg-primary/20'
    }`}
  >
    <RefreshCw className={`w-4 h-4 ${isRefreshingBookings ? 'animate-spin' : ''}`} />
    {isRefreshingBookings ? 'Refreshing...' : 'Refresh Bookings'}
  </button>
    </div>
              {/* Booking tabs */}
              <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveBookingTab('active')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeBookingTab === 'active'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Active Bookings ({activeBookings.length})
                </button>
                <button
                  onClick={() => setActiveBookingTab('history')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeBookingTab === 'history'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Booking History ({pastBookings.length})
                </button>
              </div>

              {/* Booking list */}
              <div className="space-y-6">
                {(activeBookingTab === 'active' ? activeBookings : pastBookings)
                  .map(booking => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      isOwner={false}
                      onBookingUpdate={handleBookingUpdate}
                    />
                  ))}

                {activeBookingTab === 'active' && activeBookings.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No Active Bookings</h3>
                    <p className="text-gray-500 mt-2">Your table reservations will appear here</p>
                    <Link
                      href="/book-table"
                      className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Book a Table
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {activeBookingTab === 'history' && pastBookings.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No Booking History</h3>
                    <p className="text-gray-500 mt-2">Your past reservations will appear here</p>
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