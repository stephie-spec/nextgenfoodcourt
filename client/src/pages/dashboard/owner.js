'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OutletCard from '@/components/OutletCard';
import OrderCard from '@/components/OrderCard';
import Tabs from '@/components/Tabs';
import AuthGuard from '@/components/AuthGuard';
import { apiHelper } from '@/lib/apiHelper';
import { Search, Filter, Plus, Package, DollarSign, Users, TrendingUp, Store, ShoppingBag, Clock, ChefHat, Upload } from 'lucide-react';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddOutletModal, setShowAddOutletModal] = useState(false);
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
    { id: 'menu', label: 'Menu Items' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setLoading(true);

    let outletsData, ordersData;

    apiHelper.getOutlets()
      .then(data => {
        outletsData = data;
        setOutlets(outletsData);
        return apiHelper.getOrders();
      })
      .then(data => {
        ordersData = data;
        setOrders(ordersData);

        // Fetch and normalize menu items
        return fetch('http://localhost:5555/api/menu', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch menu: ${response.status} - ${response.statusText}`);
            }
            return response.json();
          })
          .then(rawMenuData => {
            // Normalize the nested /api/menu response into flat items
            const normalizedItems = rawMenuData.map(entry => ({
              id: entry.items?.item_id || entry.item_id || null,
              name: entry.items?.item_name || entry.item_name || 'Unnamed Item',
              price: Number(entry.items?.price || entry.price || 0),
              category: entry.items?.category || entry.category || 'Uncategorized',
              is_available: entry.items?.is_available ?? entry.is_available ?? true,
              outlet_id: entry.outlet_id,
              outlet_name: entry.outlet_name || 'Unknown Outlet'
            }));

            console.log('Normalized menu items:', normalizedItems);

            setMenuItems(normalizedItems);

            // Calculate stats using normalized menu data
            const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
            const totalOrders = ordersData.length;
            const activeItems = normalizedItems.filter(item => item.is_available).length;

            const avgRating = outletsData.length > 0
              ? (outletsData.reduce((sum, outlet) => sum + (outlet.rating || 4.5), 0) / outletsData.length).toFixed(1)
              : 0;

            setStats({
              totalRevenue,
              totalOrders,
              activeItems,
              avgRating: parseFloat(avgRating)
            });

            setLoading(false);
          })
          .catch(error => {
            console.error('Error fetching or processing menu:', error);
            setMenuItems([]);
            setLoading(false);
          });
      })
      .catch(error => {
        console.error('Error fetching outlets or orders:', error);
        setLoading(false);
      });
  }, []);

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

  const handleAddItem = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();

      // Add item data
      formData.append('name', newItem.name);
      formData.append('price', parseFloat(newItem.price));
      formData.append('is_available', newItem.is_available);
      formData.append('category', newItem.category);
      formData.append('outlet_id', parseInt(newItem.outlet_id));

      // Add image file if exists
      if (newItem.image_file) {
        formData.append('image', newItem.image_file);
      }

      const response = await fetch(`${API_BASE}/api/menu`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      if (response.ok) {
        // Refresh menu items
        const menuResponse = await fetch('http://localhost:5555/api/menu', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        let newMenuItems = [];

        if (menuResponse.ok) {
          const rawMenuData = await menuResponse.json();

          newMenuItems = rawMenuData.map(entry => ({
            id: entry.item_id,
            name: entry.item_name || 'Unnamed Item',
            price: entry.price || 0,
            category: entry.category || 'Uncategorized',
            is_available: entry.is_available ?? true,
            outlet_id: entry.outlet_id,
            outlet_name: entry.outlet_name || 'Unknown Outlet'
          }));

          console.log('Refreshed menu items after add:', newMenuItems);
        } else {
          console.warn('Failed to refresh menu after adding item:', menuResponse.status);
          alert('Item added successfully, but could not refresh the list. Please refresh the page manually.');
        }

        if (newMenuItems.length > 0) {
          setMenuItems(newMenuItems);
        }

        // Reset form
        setNewItem({
          name: '',
          price: '',
          category: 'Main Course',
          outlet_id: '',
          is_available: true,
          image: '',
          image_preview: '',
          image_file: null
        });

        setShowAddItemModal(false);
        alert('Menu item added successfully!');
      } else {
        throw new Error('Failed to add menu item');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Failed to add menu item. Please try again.');
    }
  };

  const handleAddOutlet = async (e) => {
    e.preventDefault();

    console.log("Starting to add outlet...", newOutlet);

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        alert("You must be logged in to add an outlet");
        return;
      }

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('name', newOutlet.name);
      formData.append('category_name', newOutlet.category_name);
      
      // Add image file if exists
      if (newOutlet.image_file) {
        formData.append('image', newOutlet.image_file);
      }

      console.log("Sending POST request to:", `${API_BASE}/api/outlets`);

      const response = await fetch(`${API_BASE}/api/outlets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData,
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Outlet added successfully:", result);

        // Refresh outlets list
        const outletsData = await apiHelper.getOutlets();
        setOutlets(outletsData);

        // Reset form
        setNewOutlet({
          name: "",
          category_name: "",
          image_file: null,
          image_preview: ""
        });

        setShowAddOutletModal(false);
        alert("Outlet added successfully!");
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));

        console.error("Server error:", errorData);
        alert(`Failed to add outlet: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error adding outlet:", error);
      alert(`Failed to add outlet: ${error.message}`);
    }
  };


  const handleImageUpload = (file, type = "item") => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large. Please choose an image under 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (type === "item") {
        setNewItem({
          ...newItem,
          image_preview: reader.result,
          image_file: file,
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

  return (
    <AuthGuard requiredRole="owner">
      <DashboardLayout title="Owner Dashboard">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <StatCard
            title="Revenue"
            value={`Ksh ${stats.totalRevenue > 999 ? (stats.totalRevenue / 1000).toFixed(1) + 'k' : stats.totalRevenue.toFixed(0)}`}
            icon="revenue"
            description="all time"
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
                      <OrderCard order={order} isOwner={true} />
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
                    </div>
                  </div>

                  <div className="space-y-6">
                    {filteredOrders.map(order => (
                      <OrderCard key={order.id} order={order} isOwner={true} />
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

          {activeTab === 'menu' && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Menu Items ({filteredMenuItems.length})</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Organized by outlet • {outlets.length} outlets
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={menuSortBy}
                      onChange={(e) => setMenuSortBy(e.target.value)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="price-high">Sort by Price: High to Low</option>
                      <option value="price-low">Sort by Price: Low to High</option>
                      <option value="category">Sort by Category</option>
                    </select>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Item
                    </button>
                  </div>
                </div>

                {/* Menu Filters */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={menuCategoryFilter}
                      onChange={(e) => setMenuCategoryFilter(e.target.value)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Categories</option>
                      {menuCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <select
                      value={menuAvailabilityFilter}
                      onChange={(e) => setMenuAvailabilityFilter(e.target.value)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Items</option>
                      <option value="available">Available Only</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Grouped by Outlet */}
                {Object.entries(menuItemsByOutlet).map(([outletId, items]) => (
                  <div key={outletId} className="mb-8 last:mb-0">
                    <div className="flex items-center gap-2 mb-4">
                      <Store className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getOutletName(parseInt(outletId))}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({items.length} items)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Item Name</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Availability</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => (
                            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <p className="font-medium">{item.item_name || item.name}</p>
                              </td>
                              <td className="py-4 px-4">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {item.category || 'Main'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-bold">Ksh. {item.price?.toFixed(2) || '0.00'}</p>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded text-xs ${item.is_available || item.isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                  }`}>
                                  {(item.is_available || item.isAvailable) ? 'Available' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <button className="text-primary hover:text-primary/80 text-sm mr-3">
                                  Edit
                                </button>
                                <button className="text-red-500 hover:text-red-700 text-sm">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {filteredMenuItems.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No Menu Items Found</h3>
                    <p className="text-gray-500 mt-2 mb-4">Try adjusting your filters or add new items</p>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Add Your First Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Item Modal */}
          {showAddItemModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                onClick={() => setShowAddItemModal(false)}
                className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px]"
              />

              <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-200 animate-fade-in">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Add Menu Item</h2>
                      <p className="text-sm text-gray-500 mt-1">Add a new item to your outlet's menu</p>
                    </div>
                    <button
                      onClick={() => setShowAddItemModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="text-xl text-gray-500 hover:text-gray-700">✕</span>
                    </button>
                  </div>

                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name
                      </label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                        placeholder="e.g., Jollof Rice"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (Ksh)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          required
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={newItem.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          <option value="Main Course">Main Course</option>
                          <option value="Side Dish">Side Dish</option>
                          <option value="Appetizer">Appetizer</option>
                          <option value="Dessert">Dessert</option>
                          <option value="Beverage">Beverage</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Outlet
                      </label>
                      <select
                        value={newItem.outlet_id}
                        onChange={(e) => setNewItem({ ...newItem, outlet_id: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select an outlet</option>
                        {outlets.map(outlet => (
                          <option key={outlet.id} value={outlet.id}>
                            {outlet.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Drag & Drop Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Image
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${newItem.image_preview || newItem.image
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        onClick={() => document.getElementById('fileInput').click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          if (!newItem.image_preview && !newItem.image) {
                            e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            handleImageUpload(file);
                          }
                        }}
                      >
                        <input
                          id="fileInput"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageUpload(file);
                          }}
                        />

                        {newItem.image_preview || newItem.image ? (
                          <div className="space-y-2">
                            <div className="relative w-32 h-32 mx-auto">
                              <img
                                src={newItem.image_preview || newItem.image}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewItem({
                                    ...newItem,
                                    image: '',
                                    image_preview: '',
                                    image_file: null
                                  });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
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
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_available"
                        checked={newItem.is_available}
                        onChange={(e) => setNewItem({ ...newItem, is_available: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="is_available" className="text-sm text-gray-700">
                        Available for ordering
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddItemModal(false)}
                        className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                      >
                        Add Item
                      </button>
                    </div>
                  </form>
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
                        onChange={(e) => setNewOutlet({...newOutlet, name: e.target.value})}
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
                        onChange={(e) => setNewOutlet({...newOutlet, category_name: e.target.value})}
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
                    
                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-2">
                        <div className="text-blue-600 mt-0.5">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">Auto-generated fields</p>
                          <p className="text-xs text-blue-700 mt-1">
                            The outlet ID and owner ID will be automatically assigned when you create the outlet.
                          </p>
                        </div>
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