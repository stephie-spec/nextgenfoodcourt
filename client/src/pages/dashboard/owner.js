'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OutletCard from '@/components/OutletCard';
import OrderCard from '@/components/OrderCard';
import Tabs from '@/components/Tabs';
import AuthGuard from '@/components/AuthGuard';
import { apiHelper } from '@/lib/apiHelper';
import { Search, Filter, Plus, Package, DollarSign, Users, TrendingUp, Store, ShoppingBag, Clock, ChefHat, Upload, CheckCircle, XCircle, Edit, Pencil, Trash2, RefreshCw, Calendar } from 'lucide-react';
import { showToast } from '@/lib/toast';
import BookingCard from '@/components/BookingCard';

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingOutletFilter, setBookingOutletFilter] = useState('all');
  const [bookingSortBy, setBookingSortBy] = useState('newest');
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddOutletModal, setShowAddOutletModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    outlet_id: '',
    is_available: true,
    image: '',
    image_preview: '',
    image_file: null
  });

  const [newOutlet, setNewOutlet] = useState({
    name: '',
    category_name: '',
    image_file: null,
    image_preview: ''
  });

  const API_BASE = 'http://localhost:5555';


  // Filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderOutletFilter, setOrderOutletFilter] = useState('all');
  const [orderSortBy, setOrderSortBy] = useState('newest');

  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [menuAvailabilityFilter, setMenuAvailabilityFilter] = useState('all');
  const [menuSortBy, setMenuSortBy] = useState('name');

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeItems: 0,
    avgRating: 0
  });

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'outlets', label: 'My Outlets' },
    { id: 'orders', label: 'Orders' },
    { id: 'bookings', label: 'Table Bookings' },
  ];

  useEffect(() => {
    // Early return if no session yet
    if (!session || status === 'loading') {
      setLoading(false);
      return;
    }

    // Get auth data - prefer session, fallback to localStorage
    const token = session?.accessToken || localStorage.getItem('auth_token');
    const ownerId = session?.user?.id || localStorage.getItem('user_id');
    const userRole = session?.user?.role || localStorage.getItem('user_role');

    console.log('DEBUG - OwnerDashboard useEffect:', {
      tokenExists: !!token,
      ownerId,
      userRole,
      sessionExists: !!session
    });

    // Critical auth check - if anything essential is missing, stop and let AuthGuard handle redirect
    if (!token || !ownerId || userRole !== 'owner') {
      console.warn('Missing required auth data (token, ownerId, or role) - dashboard will not load data');
      setLoading(false);
      // Optional: trigger redirect here if you want extra safety
      // router.push('/login');
      return;
    }

    if (ownerId) {
      setOwnerId(ownerId);
    }

    let isMounted = true;
    setLoading(true);

    const fetchDashboardData = async () => {
      try {
        // Fetch owner's outlets
        const outletsData = await apiHelper.getOwnerOutlets(token);
        if (!isMounted) return;
        setOutlets(outletsData);

        // Fetch owner's orders
        const ordersData = await apiHelper.getOrders(token, ownerId);
        if (!isMounted) return;
        setOrders(ordersData);

        const bookingsData = await fetchOwnerBookings(token, ownerId, outletsData);
        if (!isMounted) return;
        setBookings(bookingsData);

        // Fetch all menu items and filter for owner's outlets
        const menuResponse = await fetch(`${API_BASE}/api/menu`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!menuResponse.ok) {
          throw new Error(`Menu fetch failed: ${menuResponse.status}`);
        }

        const rawMenuData = await menuResponse.json();

        // Get owner's outlet IDs
        const ownerOutletIds = outletsData.map((outlet) => outlet.id);

        // Filter menu items to only those belonging to owner's outlets
        const filteredMenuData = rawMenuData.filter((entry) =>
          entry.outlet_id && ownerOutletIds.includes(entry.outlet_id)
        );

        console.log(`Filtered ${filteredMenuData.length} menu items from ${rawMenuData.length} total`);

        // Normalize menu items 
        const normalizedItems = filteredMenuData.map((entry) => {
          let imageUrl = 'https://placehold.co/400';
          const imageFilename = entry.image || entry.items?.image || 'default-food.jpg';

          if (imageFilename && imageFilename !== 'default-food.jpg') {
            imageUrl = `http://localhost:5555/uploads/${imageFilename}`;
          } else if (imageFilename.startsWith('http')) {
            imageUrl = imageFilename;
          }

          return {
            id: entry.items?.item_id || entry.item_id || null,
            name: entry.items?.item_name || entry.item_name || 'Unnamed Item',
            price: Number(entry.items?.price || entry.price || 0),
            category: entry.items?.category || entry.category || 'Uncategorized',
            is_available: entry.items?.is_available ?? entry.is_available ?? true,
            outlet_id: entry.outlet_id,
            outlet_name: entry.outlet_name || 'Unknown Outlet',
            image: imageUrl,
            image_filename: imageFilename
          };
        });

        if (!isMounted) return;
        setMenuItems(normalizedItems);

        // Calculate stats
        const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = ordersData.length;
        const activeItems = normalizedItems.filter((item) => item.is_available).length;
        const avgRating =
          outletsData.length > 0
            ? (outletsData.reduce((sum, outlet) => sum + (outlet.rating || 4.5), 0) / outletsData.length).toFixed(1)
            : '0.0';

        if (!isMounted) return;
        setStats({
          totalRevenue,
          totalOrders,
          activeItems,
          avgRating: parseFloat(avgRating)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Optional: show toast/error message to user
        // showToast('Failed to load dashboard data', 'error');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [session, status]);  // Dependencies: re-run when session or status changes

  // Filtered and sorted orders
  const filteredOrders = orders
    .filter(order => {
      // Status filter
      if (orderStatusFilter !== 'all' && order.estimated_status !== orderStatusFilter) {
        return false;
      }
      // Outlet filter
      if (orderOutletFilter !== 'all' && order.outlet_name !== orderOutletFilter) {
        return false;
      }
      // Search filter
      if (searchTerm && !order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (orderSortBy) {
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
    });

  // Filtered outlets
  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outlet.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique categories from menu items
  const menuCategories = [...new Set(menuItems.map(item => item.category || 'Main Course'))];

  // Filtered and sorted menu items
  const filteredMenuItems = menuItems
    .filter(item => {
      if (!item) return false;

      // Category filter
      if (menuCategoryFilter !== 'all' && item.category !== menuCategoryFilter) {
        return false;
      }
      // Availability filter
      if (menuAvailabilityFilter !== 'all') {
        const isAvailable = item.is_available || item.isAvailable;
        if (menuAvailabilityFilter === 'available' && !isAvailable) return false;
        if (menuAvailabilityFilter === 'out-of-stock' && isAvailable) return false;
      }
      // Search filter (for menu tab)
      if (activeTab === 'menu' && searchTerm) {
        const itemName = item.item_name || item.name || '';
        if (!itemName.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;

      const aName = (a.item_name || a.name || '').toString();
      const bName = (b.item_name || b.name || '').toString();
      const aCategory = (a.category || '').toString();
      const bCategory = (b.category || '').toString();

      switch (menuSortBy) {
        case 'name':
          return aName.localeCompare(bName);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'category':
          return aCategory.localeCompare(bCategory);
        default:
          return 0;
      }
    });

  // Group menu items by outlet for the menu tab
  const menuItemsByOutlet = filteredMenuItems.reduce((acc, item) => {
    const outletId = item.outlet_id || item.outlet?.id;
    if (!acc[outletId]) {
      acc[outletId] = [];
    }
    acc[outletId].push(item);
    return acc;
  }, {});

  // Get outlet name by ID
  const getOutletName = (outletId) => {
    const outlet = outlets.find(o => o.id === outletId);
    return outlet?.name || 'Unknown Outlet';
  };

  // Filtered and sorted bookings
  const filteredBookings = bookings
    .filter(booking => {
      // Status filter
      if (bookingStatusFilter !== 'all' && booking.status !== bookingStatusFilter) {
        return false;
      }
      // Outlet filter
      if (bookingOutletFilter !== 'all' && booking.outlet_name !== bookingOutletFilter) {
        return false;
      }
      // Search filter
      if (searchTerm && !booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (bookingSortBy) {
        case 'newest':
          return new Date(b.booking_date || b.created_at) - new Date(a.booking_date || a.created_at);
        case 'oldest':
          return new Date(a.booking_date || a.created_at) - new Date(b.booking_date || b.created_at);
        case 'table-asc':
          return a.table_number - b.table_number;
        case 'table-desc':
          return b.table_number - a.table_number;
        default:
          return 0;
      }
    });

  const handleAddOutlet = async (e) => {
    e.preventDefault();

    console.log("Starting to add outlet...", newOutlet);

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        alert("You must be logged in to add an outlet");
        return;
      }

      const currentOwnerId = localStorage.getItem('user_id') || session?.user?.id;

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('name', newOutlet.name);
      formData.append('category_name', newOutlet.category_name);
      formData.append('owner_id', ownerId);

      // Add image file if exists
      if (newOutlet.image_file) {
        formData.append('image', newOutlet.image_file);
      }

      console.log("Sending POST request to:", `${API_BASE}/api/outlets`);

      const response = await fetch(`${API_BASE}/api/outlets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Outlet added successfully:", result);

        // Refresh outlets list
        const outletsData = await apiHelper.getOwnerOutlets();
        setOutlets(outletsData);

        // Reset form
        setNewOutlet({
          name: "",
          category_name: "",
          image_file: null,
          image_preview: ""
        });

        setShowAddOutletModal(false);
        showToast('Outlet added successfully!', 'success');
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));

        console.error("Server error:", errorData);
        showToast(`Failed to add outlet: ${errorData.message || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error("Error adding outlet:", error);
      showToast(`Failed to add outlet: ${error.message}`, 'error');
    }
  };


  const handleImageUpload = (file, type = "item") => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size too large. Please choose an image under 5MB.', 'error');
      return;
    }

    // File type validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid file type. Please upload PNG, JPEG, GIF, or WebP images.', 'error');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (type === "item") {
        setNewItem({
          ...newItem,
          image_preview: reader.result,
          image_file: file,
          image: file.name
        });
      }

      if (type === "outlet") {
        setNewOutlet({
          ...newOutlet,
          image_preview: reader.result,
          image_file: file
        });
      }
    };

    reader.readAsDataURL(file);
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );

    // Update stats if needed
    setStats(prevStats => ({
      ...prevStats,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
    }));

    showToast('Order updated successfully!', 'success');
  };

  const refreshOrders = async () => {
    if (!session?.accessToken || !ownerId) return;

    setIsRefreshing(true);
    try {
      const token = session.accessToken || localStorage.getItem('auth_token');
      const ordersData = await apiHelper.getOrders(token, ownerId);

      setOrders(ordersData);

      // Optional: recalculate stats if needed
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
      setStats(prev => ({
        ...prev,
        totalRevenue,
        totalOrders: ordersData.length,
      }));

      showToast('Orders refreshed successfully!', 'success');
    } catch (err) {
      console.error('Failed to refresh orders:', err);
      showToast('Failed to refresh orders', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch bookings for owner's outlets
  const fetchOwnerBookings = async (token, ownerId, outletsData) => {
    try {
      if (!outletsData || outletsData.length === 0) return [];

      // Get all outlet IDs
      const outletIds = outletsData.map(outlet => outlet.id);

      // Fetch all orders for these outlets
      const ordersResponse = await fetch(`${API_BASE}/api/orders/owner/${ownerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!ordersResponse.ok) {
        throw new Error(`Failed to fetch orders: ${ordersResponse.status}`);
      }

      const ordersData = await ordersResponse.json();

      // Filter orders that have table bookings
      const bookingsData = ordersData
        .filter(order => order.table_booking) // Only orders with table bookings
        .map(order => ({
          id: order.table_booking.id,
          order_id: order.id,
          table_number: order.table_booking.table_number,
          capacity: order.table_booking.capacity,
          status: order.table_booking.status || 'pending',
          created_at: order.table_booking.created_at,
          booking_date: order.table_booking.booking_date,
          duration: order.table_booking.duration,
          special_requests: order.table_booking.special_requests,
          outlet_name: order.outlet_name,
          outlet_id: order.outlet_id,
          customer_name: order.customer_name || 'Customer',
          customer_id: order.customer_id,
          items: order.items || [],
          total: order.total || 0
        }));

      console.log(`Found ${bookingsData.length} bookings for owner's outlets`);
      return bookingsData;

    } catch (error) {
      console.error('Error fetching owner bookings:', error);
      return [];
    }
  };

  const handleBookingUpdate = (updatedBooking) => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      )
    );
    showToast('Booking updated successfully!', 'success');
  };

  return (
    <AuthGuard requiredRole="owner">
      <DashboardLayout title="Owner Dashboard">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <StatCard
            title="Revenue"
            value={`Ksh ${stats.totalRevenue > 999 ? (stats.totalRevenue / 1000).toFixed(1) + 'k' : stats.totalRevenue.toFixed(0)}`}
            icon="revenue"
            description="daily"
            color="green"
          />
          <StatCard
            title="Orders"
            value={stats.totalOrders}
            icon="orders"
            description="total"
            color="indigo"
          />
          <StatCard
            title="Items"
            value={stats.activeItems}
            icon="menu"
            description="active"
            color="orange"
          />
          <StatCard
            title="Rating"
            value={stats.avgRating > 0 ? `${stats.avgRating}★` : '—'}
            icon="star"
            description="average"
            color="purple"
          />
        </div>

        {/* Tabs Navigation */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 mb-4">
          <div className="flex min-w-max px-4 sm:px-0">
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Business Insights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
                {/* Best Performing */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3 overflow-hidden">
                  <div className="flex items-center justify-between mb-1 overflow-hidden">
                    <span className="text-xs font-medium text-blue-100 truncate">Best Performing</span>
                    <ShoppingBag className="w-3 h-3 flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-base font-bold mb-0.5 truncate">{outlets[0]?.name || '—'}</p>
                  <p className="text-xs text-blue-100 truncate">
                    Ksh. {outlets[0]?.today_revenue?.toFixed(2) || '0.00'} today
                  </p>
                </div>

                {/* Top Item */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg p-3 overflow-hidden">
                  <div className="flex items-center justify-between mb-1 overflow-hidden">
                    <span className="text-xs font-medium text-emerald-100 truncate">Top Item</span>
                    <ChefHat className="w-3 h-3 flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-base font-bold mb-0.5 truncate">{menuItems[0]?.name || '—'}</p>
                  <p className="text-xs text-emerald-100 truncate">{menuItems.length} total items</p>
                </div>

                {/* Total Outlets */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-3 overflow-hidden">
                  <div className="flex items-center justify-between mb-1 overflow-hidden">
                    <span className="text-xs font-medium text-purple-100 truncate">Total Outlets</span>
                    <Store className="w-3 h-3 flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-base font-bold mb-0.5 truncate">{outlets.length}</p>
                  <p className="text-xs text-purple-100 truncate">Active outlets</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-primary font-medium hover:text-primary/80 text-sm sm:text-base self-start sm:self-center"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id} className="border-b border-gray-200 last:border-0 pb-4 sm:pb-0 sm:border-0">
                      <OrderCard order={order} isOwner={true} onOrderUpdate={handleOrderUpdate} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Management */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Management</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center"
                  >
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium">Update Stock</span>
                  </button>
                  <button className="p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center">
                    <DollarSign className="w-6 h-6 text-primary mb-2" />
                    <span className="text-xs sm:text-sm font-medium">View Reports</span>
                  </button>
                  <button className="p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center">
                    <Users className="w-6 h-6 text-primary mb-2" />
                    <span className="text-xs sm:text-sm font-medium">Staff</span>
                  </button>
                  <button className="p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center">
                    <TrendingUp className="w-6 h-6 text-primary mb-2" />
                    <span className="text-xs sm:text-sm font-medium">Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'outlets' && (
            <div>
              {/* Search and Add Outlet */}
              <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search your outlets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddOutletModal(true)}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Outlet
                  </button>
                </div>
              </div>

              {/* Outlets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOutlets.map(outlet => (
                  <OutletCard key={outlet.id} outlet={outlet} isOwner={true} />
                ))}
              </div>

              {filteredOutlets.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No Outlets Found</h3>
                  <p className="text-gray-500 mt-2 mb-4">Get started by adding your first outlet</p>
                  <button
                    onClick={() => setShowAddOutletModal(true)}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Outlet
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                {/* Search and Filter Controls */}
                <div className="mb-6">
                  <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />                        <input
                          type="text"
                          placeholder="Search orders by customer name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex gap-2">
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg w-full"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      <select
                        value={orderOutletFilter}
                        onChange={(e) => setOrderOutletFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg w-full"
                      >
                        <option value="all">All Outlets</option>
                        {outlets.map(outlet => (
                          <option key={outlet.id} value={outlet.name}>{outlet.name}</option>
                        ))}
                      </select>
                      <select
                        value={orderSortBy}
                        onChange={(e) => setOrderSortBy(e.target.value)}
                        className="col-span-2 sm:col-span-1 px-3 py-2 text-sm border border-gray-300 rounded-lg w-full"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="price-low">Price: Low to High</option>
                      </select>

                      {/* Refresh button */}
                      <button
                        onClick={refreshOrders}
                        disabled={isRefreshing}
                        title={isRefreshing ? "Refreshing..." : "Refresh orders"}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ${isRefreshing ? 'opacity-60 cursor-not-allowed animate-spin' : ''
                          }`}
                        aria-label="Refresh orders"
                      >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {filteredOrders.map(order => (
                      <OrderCard key={order.id} order={order} isOwner={true} onOrderUpdate={handleOrderUpdate} />
                    ))}
                  </div>

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700">No Orders Found</h3>
                      <p className="text-gray-500 mt-2">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                {/* Search and Filter Controls */}
                <div className="mb-6">
                  <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type="text"
                          placeholder="Search bookings by customer name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex gap-2">
                      <select
                        value={bookingStatusFilter}
                        onChange={(e) => setBookingStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg w-full"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>

                      <select
                        value={bookingOutletFilter}
                        onChange={(e) => setBookingOutletFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg w-full"
                      >
                        <option value="all">All Outlets</option>
                        {outlets.map(outlet => (
                          <option key={outlet.id} value={outlet.name}>{outlet.name}</option>
                        ))}
                      </select>

                      <select
                        value={bookingSortBy}
                        onChange={(e) => setBookingSortBy(e.target.value)}
                        className="col-span-2 sm:col-span-1 px-3 py-2 text-sm border border-gray-300 rounded-lg w-full"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="table-asc">Table: Low to High</option>
                        <option value="table-desc">Table: High to Low</option>
                      </select>

                      {/* Refresh button */}
                      <button
                        onClick={refreshOrders}
                        disabled={isRefreshing}
                        title={isRefreshing ? "Refreshing..." : "Refresh bookings"}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ${isRefreshing ? 'opacity-60 cursor-not-allowed animate-spin' : ''
                          }`}
                        aria-label="Refresh bookings"
                      >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-700">Pending</p>
                      <p className="text-xl font-bold text-yellow-700">
                        {bookings.filter(b => b.status === 'pending').length}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-700">Confirmed</p>
                      <p className="text-xl font-bold text-green-700">
                        {bookings.filter(b => b.status === 'confirmed').length}
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700">Checked In</p>
                      <p className="text-xl font-bold text-blue-700">
                        {bookings.filter(b => b.status === 'checked_in').length}
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-purple-700">Today's Bookings</p>
                      <p className="text-xl font-bold text-purple-700">
                        {bookings.filter(b => {
                          if (!b.booking_date) return false;
                          const today = new Date().toDateString();
                          const bookingDate = new Date(b.booking_date).toDateString();
                          return bookingDate === today;
                        }).length}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {filteredBookings.map(booking => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        isOwner={true}
                        onBookingUpdate={handleBookingUpdate}
                      />
                    ))}
                  </div>

                  {filteredBookings.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700">No Bookings Found</h3>
                      <p className="text-gray-500 mt-2">
                        {searchTerm || bookingStatusFilter !== 'all' || bookingOutletFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'No table reservations yet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Outlet Modal */}
          {showAddOutletModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                onClick={() => setShowAddOutletModal(false)}
                className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px]"
              />

              <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-200 animate-fade-in max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Add New Outlet</h2>
                      <p className="text-sm text-gray-500 mt-1">Create a new outlet location</p>
                    </div>
                    <button
                      onClick={() => setShowAddOutletModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="text-xl text-gray-500 hover:text-gray-700">✕</span>
                    </button>
                  </div>

                  <form onSubmit={handleAddOutlet} className="space-y-4">
                    {/* Outlet Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Outlet Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newOutlet.name}
                        onChange={(e) => setNewOutlet({ ...newOutlet, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        placeholder="e.g., Downtown Branch"
                      />
                    </div>

                    {/* Category Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newOutlet.category_name}
                        onChange={(e) => setNewOutlet({ ...newOutlet, category_name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        placeholder="e.g., Fast Food, Fine Dining, Cafe"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The type or category of your outlet
                      </p>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Outlet Image
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                          ${newOutlet.image_preview
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        onClick={() => document.getElementById('outletFileInput').click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          if (!newOutlet.image_preview) {
                            e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            handleImageUpload(file, 'outlet');
                          }
                        }}
                      >
                        <input
                          id="outletFileInput"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageUpload(file, 'outlet');
                          }}
                        />

                        {newOutlet.image_preview ? (
                          <div className="space-y-2">
                            <div className="relative w-32 h-32 mx-auto">
                              <img
                                src={newOutlet.image_preview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewOutlet({
                                    ...newOutlet,
                                    image_file: null,
                                    image_preview: ''
                                  });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="text-sm text-gray-600">
                              Click or drag to change image
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-gray-400 mx-auto w-12 h-12">
                              <Upload className="w-full h-full" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Drag & drop an image here
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                or click to browse (PNG, JPG up to 5MB)
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                Optional - default image will be used if not provided
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>


                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddOutletModal(false)}
                        className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
                      >
                        Add Outlet
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}