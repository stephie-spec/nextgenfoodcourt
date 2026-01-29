'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OutletCard from '@/components/OutletCard';
import OrderCard from '@/components/OrderCard';
import AuthGuard from '@/components/AuthGuard';
import { Plus } from 'lucide-react';


export default function OwnerDashboard() {
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Mock data
    const mockOutlets = [
      { id: 1, name: 'Addis Kitchen', category: 'Ethiopian', status: 'active' },
      { id: 2, name: 'Lagos Grill', category: 'Nigerian', status: 'active' },
    ];
    
    const mockOrders = [
      { id: 'ORD-001', date: '2024-01-15', total: 45.99, status: 'pending' },
      { id: 'ORD-002', date: '2024-01-16', total: 29.50, status: 'pending' },
    ];

    setOutlets(mockOutlets);
    setOrders(mockOrders);
  }, []);

  const todayRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  
  return (
    <AuthGuard requiredRole="owner">
      <DashboardLayout title="Owner Dashboard">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Outlets"
            value={outlets.length}
            icon="users"
            trend="+1"
            description="new this month"
            color="primary"
          />
          
          <StatCard
            title="Today's Revenue"
            value={`$${todayRevenue.toFixed(2)}`}
            icon="revenue"
            trend="+24%"
            description="from yesterday"
            color="green"
          />
          
          <StatCard
            title="Pending Orders"
            value={pendingCount}
            icon="pending"
            color="orange"
          />
          
          <StatCard
            title="Avg. Rating"
            value="4.8"
            icon="trend"
            description="from 128 reviews"
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Outlets Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Outlets</h2>
                <button className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {outlets.map(outlet => (
                  <div key={outlet.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
                    <OutletCard outlet={outlet} />
                  </div>
                ))}
                
                <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2">
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="font-medium text-gray-600">Add New Outlet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Orders & Management */}
          <div className="lg:col-span-2">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Filter
                  </button>
                  <button className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                    <OrderCard order={order} />
                    <div className="flex gap-3 mt-4">
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                        Mark Complete
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                        View Details
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                        Contact Customer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-2">Best Seller</h3>
                <p className="text-3xl font-bold mb-1">Injera Platter</p>
                <p className="text-primary-foreground/80">Addis Kitchen</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-2">Today's Goal</h3>
                <p className="text-3xl font-bold mb-1">85%</p>
                <p className="text-white/80">$1,248 of $1,500</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-2">Customer Rating</h3>
                <p className="text-3xl font-bold mb-1">4.8★</p>
                <p className="text-white/80">128 reviews</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}