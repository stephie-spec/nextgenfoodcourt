'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OutletCard from '@/components/OutletCard';
import OrderCard from '@/components/OrderCard';
import Tabs from '@/components/Tabs';
import AuthGuard from '@/components/AuthGuard';
import { Search, Filter, Plus, Package, DollarSign, Users, TrendingUp, Store } from 'lucide-react';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'outlets', label: 'My Outlets' },
    { id: 'orders', label: 'Orders' },
    { id: 'menu', label: 'Menu Items' },
  ];

  useEffect(() => {
    const mockOutlets = [
      {
        id: 1,
        name: 'Addis Kitchen',
        category_name: 'Ethiopian Cuisine',
        description: 'Authentic Ethiopian dishes with traditional injera bread. Family recipes passed down for generations.',
        rating: 4.8,
        today_orders: 24,
        today_revenue: 1248.50,
        total_orders: 128,
        reviews: 89,
        status: 'active',
        minOrder: 15,
        deliveryTime: '25-35',
        tags: ['ethiopian', 'injera', 'vegetarian', 'traditional']
      },
      {
        id: 2,
        name: 'Lagos Grill',
        category_name: 'Nigerian Cuisine',
        description: 'Vibrant Nigerian flavors with signature jollof rice and grilled specialties.',
        rating: 4.6,
        today_orders: 18,
        today_revenue: 876.25,
        total_orders: 96,
        reviews: 67,
        status: 'active',
        minOrder: 18,
        deliveryTime: '30-40',
        tags: ['nigerian', 'jollof', 'spicy', 'party']
      },
      {
        id: 3,
        name: 'Nairobi Flame',
        category_name: 'Kenyan Cuisine',
        description: 'Traditional Kenyan grilled meats cooked over charcoal, served fresh and smoky.',
        rating: 4.9,
        today_orders: 12,
        today_revenue: 642.75,
        total_orders: 72,
        reviews: 52,
        status: 'active',
        minOrder: 22,
        deliveryTime: '35-45',
        tags: ['kenyan', 'nyama-choma', 'bbq', 'grilled']
      },
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
      },
      {
        id: 3,
        customer_name: 'David Kim',
        created_at: new Date().toISOString(),
        estimated_status: 'ready',
        total: 67.25,
        outlet_name: 'Nairobi Flame',
        outlet: { name: 'Nairobi Flame' },
        items: [
          { name: 'Nyama Choma Feast', quantity: 1, price: 32.99 },
          { name: 'Ugali', quantity: 2, price: 17.98 }
        ],
        table_booking: null
      },
    ];

    const mockMenuItems = [
      { id: 1, name: 'Injera Platter', price: 22.99, isAvailable: true, outlet: 'Addis Kitchen', category: 'Main' },
      { id: 2, name: 'Doro Wat', price: 18.99, isAvailable: true, outlet: 'Addis Kitchen', category: 'Main' },
      { id: 3, name: 'Jollof Rice', price: 16.99, isAvailable: true, outlet: 'Lagos Grill', category: 'Main' },
      { id: 4, name: 'Fried Plantains', price: 7.99, isAvailable: false, outlet: 'Lagos Grill', category: 'Side' },
      { id: 5, name: 'Nyama Choma', price: 32.99, isAvailable: true, outlet: 'Nairobi Flame', category: 'Main' },
    ];

    setOutlets(mockOutlets);
    setOrders(mockOrders);
    setMenuItems(mockMenuItems);
  }, []);

  const totalRevenueToday = outlets.reduce((sum, outlet) => sum + outlet.today_revenue, 0);
  const totalOrdersToday = outlets.reduce((sum, outlet) => sum + outlet.today_orders, 0);
  const pendingOrders = orders.filter(o => o.estimated_status === 'pending').length;
  const avgRating = (outlets.reduce((sum, outlet) => sum + outlet.rating, 0) / outlets.length).toFixed(1);

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outlet.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthGuard requiredRole="owner">
      <DashboardLayout title="Owner Dashboard">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Revenue"
            value={`$${totalRevenueToday.toFixed(2)}`}
            icon="revenue"
            trend="+24%"
            description="vs yesterday"
            color="green"
          />

          <StatCard
            title="Today's Orders"
            value={totalOrdersToday}
            icon="orders"
            trend="+8 orders"
            description="from yesterday"
            color="primary"
          />

          <StatCard
            title="Pending Orders"
            value={pendingOrders}
            icon="pending"
            description="need attention"
            color="orange"
          />

          <StatCard
            title="Avg Rating"
            value={`${avgRating}★`}
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
                  <h3 className="text-lg font-bold mb-2">Best Performing</h3>
                  <p className="text-3xl font-bold mb-1">Addis Kitchen</p>
                  <p className="text-primary-foreground/80">$1,248 today</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-2">Most Ordered</h3>
                  <p className="text-3xl font-bold mb-1">Jollof Rice</p>
                  <p className="text-white/80">42 orders today</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-2">Table Bookings</h3>
                  <p className="text-3xl font-bold mb-1">8</p>
                  <p className="text-white/80">Today's reservations</p>
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

                <div className="space-y-4">
                  {orders.slice(0, 3).map(order => (
                    <OrderCard key={order.id} order={order} isOwner={true} />
                  ))}
                </div>
              </div>

              {/* Quick Management */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Management</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center">
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">All Orders</h2>
                  <div className="flex gap-2">
                    <select className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                      <option>All Outlets</option>
                      {outlets.map(outlet => (
                        <option key={outlet.id}>{outlet.name}</option>
                      ))}
                    </select>
                    <select className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>Preparing</option>
                      <option>Ready</option>
                      <option>Delivered</option>
                    </select>
                    <button className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {orders.map(order => (
                    <OrderCard key={order.id} order={order} isOwner={true} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Menu Items ({menuItems.length})</h2>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Item</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Outlet</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map(item => (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <p className="font-medium">{item.name}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-gray-600">{item.outlet}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold">${item.price}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${item.isAvailable
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {item.isAvailable ? 'Available' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button className="text-primary hover:text-primary/80 text-sm">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
