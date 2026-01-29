'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OrderCard from '@/components/OrderCard';
import AuthGuard from '@/components/AuthGuard';
import { ShoppingBag, Star, Heart, MapPin, Clock } from 'lucide-react';


export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const mockOrders = [
      { 
        id: 'ORD-001', 
        created_at: new Date().toISOString(),
        estimated_status: 'preparing',
        total: 45.99,
        items: [
          { name: 'Injera Platter', quantity: 1, price: 22.99 },
          { name: 'Doro Wat', quantity: 1, price: 18.99 }
        ],
        outlet: {
          id: 1,
          name: 'Addis Kitchen',
          category_name: 'Ethiopian'
        },
        delivery_time: '25 mins',
        customer_name: 'You'
      },
      { 
        id: 'ORD-002', 
        created_at: '2024-01-15T18:30:00Z',
        estimated_status: 'delivered',
        total: 29.50,
        items: [
          { name: 'Jollof Rice Combo', quantity: 1, price: 16.99 },
          { name: 'Fried Plantains', quantity: 1, price: 7.99 }
        ],
        outlet: {
          id: 2,
          name: 'Lagos Grill',
          category_name: 'Nigerian'
        },
        delivery_time: '35 mins',
        customer_name: 'You'
      },
      { 
        id: 'ORD-003', 
        created_at: '2024-01-10T19:15:00Z',
        estimated_status: 'delivered',
        total: 67.25,
        items: [
          { name: 'Nyama Choma Feast', quantity: 1, price: 32.99 },
          { name: 'Ugali', quantity: 1, price: 8.99 }
        ],
        outlet: {
          id: 3,
          name: 'Nairobi Flame',
          category_name: 'Kenyan'
        },
        delivery_time: '40 mins',
        customer_name: 'You'
      },
    ];

    const mockFavorites = [
      { id: 1, name: 'Injera Platter', outlet: 'Addis Kitchen', price: 22.99 },
      { id: 2, name: 'Jollof Rice', outlet: 'Lagos Grill', price: 16.99 },
      { id: 3, name: 'Nyama Choma', outlet: 'Nairobi Flame', price: 32.99 },
    ];

    setOrders(mockOrders);
    setFavorites(mockFavorites);
  }, []);

  const activeOrders = orders.filter(o => o.estimated_status !== 'delivered');
  const pastOrders = orders.filter(o => o.estimated_status === 'delivered');

  return (
    <AuthGuard requiredRole="customer">
      <DashboardLayout title="Customer Dashboard">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Orders"
            value={activeOrders.length}
            icon="pending"
            description="Being prepared"
            color="orange"
          />
          
          <StatCard
            title="Avg Delivery"
            value="32 mins"
            icon="clock"
            trend="-5 mins"
            description="faster than last month"
            color="green"
          />
          
          <StatCard
            title="Your Rating"
            value="4.7★"
            icon="star"
            description="from 12 orders"
            color="yellow"
          />
          
          <StatCard
            title="Favorites"
            value={favorites.length}
            icon="heart"
            description="saved items"
            color="purple"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders Section */}
          <div className="lg:col-span-2">
            {/* Active Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Orders</h2>
                <button className="text-primary font-medium hover:text-primary/80">
                  Track All
                </button>
              </div>
              
              {activeOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">No active orders</p>
                  <button className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Order Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map(order => (
                    <OrderCard key={order.id} order={order} isOwner={false} />
                  ))}
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
              <div className="space-y-4">
                {pastOrders.map(order => (
                  <OrderCard key={order.id} order={order} isOwner={false} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Order Food Now
                </button>
                <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Book a Table
                </button>
                <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  View Favorites
                </button>
                <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Favorites */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Your Favorites</h2>
                <button className="text-primary font-medium hover:text-primary/80 text-sm">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {favorites.map(fav => (
                  <div key={fav.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary/50">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{fav.name}</h4>
                      <p className="text-sm text-gray-600">{fav.outlet} • ${fav.price}</p>
                    </div>
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">Nearby Outlets</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Addis Kitchen</p>
                    <p className="text-sm text-gray-600">0.5 mi • Ethiopian</p>
                  </div>
                  <span className="text-sm text-green-600">Open now</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Lagos Grill</p>
                    <p className="text-sm text-gray-600">0.8 mi • Nigerian</p>
                  </div>
                  <span className="text-sm text-green-600">Open now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
