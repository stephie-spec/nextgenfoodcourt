'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OutletCard from '@/components/OutletCard';
import OrderCard from '@/components/OrderCard';
import AuthGuard from '@/components/AuthGuard';
import { Plus, TrendingUp, Users, DollarSign, Package } from 'lucide-react';




export default function OwnerDashboard() {
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const mockOutlets = [
      { 
        id: 1, 
        name: 'Addis Kitchen', 
        category_name: 'Ethiopian Cuisine',
        status: 'active',
        today_orders: 24,
        today_revenue: 1248.50,
        total_orders: 128,
        rating: 4.8,
        reviews: 89
      },
      { 
        id: 2, 
        name: 'Lagos Grill', 
        category_name: 'Nigerian Cuisine',
        status: 'active',
        today_orders: 18,
        today_revenue: 876.25,
        total_orders: 96,
        rating: 4.6,
        reviews: 67
      },
      { 
        id: 3, 
        name: 'Nairobi Flame', 
        category_name: 'Kenyan Cuisine',
        status: 'active',
        today_orders: 12,
        today_revenue: 642.75,
        total_orders: 72,
        rating: 4.9,
        reviews: 52
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
      { id: 1, name: 'Injera Platter', price: 22.99, isAvailable: true },
      { id: 2, name: 'Doro Wat', price: 18.99, isAvailable: true },
      { id: 3, name: 'Jollof Rice', price: 16.99, isAvailable: true },
      { id: 4, name: 'Fried Plantains', price: 7.99, isAvailable: false },
    ];

    setOutlets(mockOutlets);
    setOrders(mockOrders);
    setMenuItems(mockMenuItems);
  }, []);

  const totalRevenueToday = outlets.reduce((sum, outlet) => sum + outlet.today_revenue, 0);
  const totalOrdersToday = outlets.reduce((sum, outlet) => sum + outlet.today_orders, 0);
  const pendingOrders = orders.filter(o => o.estimated_status === 'pending').length;
  const avgRating = (outlets.reduce((sum, outlet) => sum + outlet.rating, 0) / outlets.length).toFixed(1);

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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Outlets */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Outlets ({outlets.length})</h2>
                <button className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {outlets.map(outlet => (
                  <OutletCard key={outlet.id} outlet={outlet} />
                ))}
                
                <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2">
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="font-medium text-gray-600">Add New Outlet</span>
                </button>
              </div>
            </div>

            {/* Menu Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Menu Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Available Items</span>
                  <span className="font-bold">
                    {menuItems.filter(item => item.isAvailable).length}/{menuItems.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Out of Stock</span>
                  <span className="font-bold text-red-600">
                    {menuItems.filter(item => !item.isAvailable).length}
                  </span>
                </div>
                <button className="w-full mt-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  Update Menu
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Orders & Management */}
          <div className="lg:col-span-2">
            {/* Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <div className="flex gap-2">
                  <select className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                    <option>All Outlets</option>
                    {outlets.map(outlet => (
                      <option key={outlet.id}>{outlet.name}</option>
                    ))}
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
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
