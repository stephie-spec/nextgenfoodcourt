'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OutletCard from '@/components/OutletCard';
import OrderCard from '@/components/OrderCard';
import Tabs from '@/components/Tabs';
import AuthGuard from '@/components/AuthGuard';
import { Search, Filter, Plus, Package, DollarSign, Users, TrendingUp, Store, ShoppingBag, Clock, ChefHat } from 'lucide-react';
import { apiHelper } from '@/lib/apiHelper';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
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
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      try {
        // Fetch outlets, orders, and menu items
        const outletsData = await apiHelper.getOutlets();
        const ordersData = await apiHelper.getOrders();
        const menuResponse = await fetch('http://localhost:5555/menu');
        const menuData = menuResponse.ok ? await menuResponse.json() : [];

        setOutlets(outletsData);
        setOrders(ordersData);
        setMenuItems(menuData);

        // Calculate stats based on actual data
        const calculatedStats = calculateStats(outletsData, ordersData, menuData);
        setStats(calculatedStats);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data
        const mockData = getMockData();
        setOutlets(mockData.outlets);
        setOrders(mockData.orders);
        setMenuItems(mockData.menuItems);
        setStats(mockData.stats);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats based on data
  const calculateStats = (outletsData, ordersData, menuData) => {
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = ordersData.length;
    const activeItems = menuData.filter(item => item.is_available || item.isAvailable).length;
    const avgRating = outletsData.length > 0
      ? (outletsData.reduce((sum, outlet) => sum + (outlet.rating || 4.5), 0) / outletsData.length).toFixed(1)
      : 0;

    return {
      totalRevenue,
      totalOrders,
      activeItems,
      avgRating: parseFloat(avgRating)
    };
  };

  // Mock data fallback
  const getMockData = () => {
    const mockOutlets = [
      {
        id: 1,
        name: 'Addis Kitchen',
        category_name: 'Ethiopian Cuisine',
        description: 'Authentic Ethiopian dishes with traditional injera bread.',
        rating: 4.8,
        today_orders: 24,
        today_revenue: 1248.50,
        total_orders: 128,
        reviews: 89,
        isOpen: true,
        image_path: '/outlet-showcase-1.jpg'
      },
      {
        id: 2,
        name: 'Lagos Grill',
        category_name: 'Nigerian Cuisine',
        description: 'Vibrant Nigerian flavors with signature jollof rice.',
        rating: 4.6,
        today_orders: 18,
        today_revenue: 876.25,
        total_orders: 96,
        reviews: 67,
        isOpen: true,
        image_path: '/outlet-showcase-2.jpg'
      }
    ];

    const mockOrders = [
      {
        id: 1,
        customer_name: 'Michael Chen',
        created_at: new Date().toISOString(),
        estimated_status: 'pending',
        total: 45.99,
        outlet_name: 'Addis Kitchen',
        outlet: { name: 'Addis Kitchen' },
        items: [
          { name: 'Injera Platter', quantity: 1, price: 22.99 },
          { name: 'Doro Wat', quantity: 1, price: 18.99 }
        ],
        table_booking: null
      },
      {
        id: 2,
        customer_name: 'Sarah Johnson',
        created_at: new Date().toISOString(),
        estimated_status: 'preparing',
        total: 29.50,
        outlet_name: 'Lagos Grill',
        outlet: { name: 'Lagos Grill' },
        items: [
          { name: 'Jollof Rice Combo', quantity: 1, price: 16.99 },
          { name: 'Fried Plantains', quantity: 1, price: 7.99 }
        ],
        table_booking: { table_number: 5, capacity: 4 }
      }
    ];

    const mockMenuItems = [
      { id: 1, name: 'Injera Platter', price: 22.99, is_available: true, outlet_id: 1, category: 'Main Course' },
      { id: 2, name: 'Doro Wat', price: 18.99, is_available: true, outlet_id: 1, category: 'Main Course' },
      { id: 3, name: 'Jollof Rice', price: 16.99, is_available: true, outlet_id: 2, category: 'Main Course' },
      { id: 4, name: 'Fried Plantains', price: 7.99, is_available: false, outlet_id: 2, category: 'Side Dish' }
    ];

    const mockStats = calculateStats(mockOutlets, mockOrders, mockMenuItems);

    return {
      outlets: mockOutlets,
      orders: mockOrders,
      menuItems: mockMenuItems,
      stats: mockStats
    };
  };

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outlet.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group menu items by outlet for the menu tab
  const menuItemsByOutlet = menuItems.reduce((acc, item) => {
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

  return (
    <AuthGuard requiredRole="owner">
      <DashboardLayout title="Owner Dashboard">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon="revenue"
            description="all time"
            color="green"
          />

          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="orders"
            description="all outlets"
            color="primary"
          />

          <StatCard
            title="Active Items"
            value={stats.activeItems}
            icon="menu"
            description="across menus"
            color="orange"
          />

          <StatCard
            title="Avg Rating"
            value={`${stats.avgRating}★`}
            icon="star"
            description="across all outlets"
            color="yellow"
          />
        </div>

        {/* Tabs Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Business Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingBag className="w-6 h-6" />
                    <h3 className="text-lg font-bold">Best Performing</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">
                    {outlets[0]?.name || 'Addis Kitchen'}
                  </p>
                  <p className="text-primary-foreground/80">
                    ${outlets[0]?.today_revenue?.toFixed(2) || '0.00'} today
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ChefHat className="w-6 h-6" />
                    <h3 className="text-lg font-bold">Top Item</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">Jollof Rice</p>
                  <p className="text-white/80">42 orders today</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-6 h-6" />
                    <h3 className="text-lg font-bold">Avg Prep Time</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">24min</p>
                  <p className="text-white/80">Across all orders</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-primary font-medium hover:text-primary/80"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-6">
                  {orders.slice(0, 3).map(order => (
                    <OrderCard key={order.id} order={order} isOwner={true} />
                  ))}
                </div>
              </div>

              {/* Quick Management */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Management</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center"
                  >
                    <Package className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm font-medium">Update Stock</span>
                  </button>
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center">
                    <DollarSign className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm font-medium">View Reports</span>
                  </button>
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center">
                    <Users className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm font-medium">Staff</span>
                  </button>
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center">
                    <TrendingUp className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm font-medium">Analytics</span>
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
                  <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2">
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
                  <p className="text-gray-500">No outlets found</p>
                  <button className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
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
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search orders by customer name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                        <option>All Status</option>
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      <select className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                        <option>All Outlets</option>
                        {outlets.map(outlet => (
                          <option key={outlet.id} value={outlet.name}>{outlet.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {orders
                      .filter(order => {
                        if (searchTerm && !order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
                          return false;
                        }
                        return true;
                      })
                      .map(order => (
                        <OrderCard key={order.id} order={order} isOwner={true} />
                      ))}
                  </div>

                  {orders.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700">No Orders Yet</h3>
                      <p className="text-gray-500 mt-2">Orders from your outlets will appear here</p>
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
                    <h2 className="text-xl font-bold text-gray-900">Menu Items ({menuItems.length})</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Organized by outlet • {outlets.length} outlets
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Item
                  </button>
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

                {menuItems.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No Menu Items Yet</h3>
                    <p className="text-gray-500 mt-2 mb-4">Add items to your outlets' menus</p>
                    <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                      Add Your First Item
                    </button>
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