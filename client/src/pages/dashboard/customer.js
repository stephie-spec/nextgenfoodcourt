'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import OrderCard from '@/components/OrderCard';
import OutletCard from '@/components/OutletCard';
import Tabs from '@/components/Tabs';
import AuthGuard from '@/components/AuthGuard';
import { Search, Filter, ShoppingBag, Star, Clock, Heart, Store } from 'lucide-react';

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('outlets');
  const [outlets, setOutlets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tabs = [
    { id: 'outlets', label: 'Outlets' },
    { id: 'orders', label: 'Active Orders' },
    { id: 'history', label: 'Order History' },
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
        minOrder: 15,
        deliveryTime: '25-35',
        distance: '0.5 mi',
        isOpen: true,
        tags: ['ethiopian', 'injera', 'vegetarian', 'traditional']
      },
      { 
        id: 2, 
        name: 'Lagos Grill', 
        category_name: 'Nigerian Cuisine',
        description: 'Vibrant Nigerian flavors with signature jollof rice and grilled specialties. Perfect for parties!',
        rating: 4.6,
        today_orders: 18,
        minOrder: 18,
        deliveryTime: '30-40',
        distance: '0.8 mi',
        isOpen: true,
        tags: ['nigerian', 'jollof', 'spicy', 'party']
      },
      { 
        id: 3, 
        name: 'Nairobi Flame', 
        category_name: 'Kenyan Cuisine',
        description: 'Traditional Kenyan grilled meats cooked over charcoal, served fresh and smoky.',
        rating: 4.9,
        today_orders: 12,
        minOrder: 22,
        deliveryTime: '35-45',
        distance: '1.2 mi',
        isOpen: true,
        tags: ['kenyan', 'nyama-choma', 'bbq', 'grilled']
      },
      { 
        id: 4, 
        name: 'Kinshasa Kitchen', 
        category_name: 'Congolese Cuisine',
        description: 'Authentic Congolese dishes featuring traditional cooking methods and fresh ingredients.',
        rating: 4.7,
        today_orders: 8,
        minOrder: 16,
        deliveryTime: '40-50',
        distance: '1.5 mi',
        isOpen: true,
        tags: ['congolese', 'fufu', 'fish', 'stew']
      },
      { 
        id: 5, 
        name: 'Cairo Oasis', 
        category_name: 'Egyptian Cuisine',
        description: 'Traditional Egyptian street food and authentic dishes from the heart of Cairo.',
        rating: 4.5,
        today_orders: 15,
        minOrder: 12,
        deliveryTime: '25-35',
        distance: '0.7 mi',
        isOpen: true,
        tags: ['egyptian', 'koshari', 'street-food', 'vegetarian']
      },
      { 
        id: 6, 
        name: 'Cape Town Grill', 
        category_name: 'South African Cuisine',
        description: 'Modern South African braai and traditional dishes with a contemporary twist.',
        rating: 4.8,
        today_orders: 20,
        minOrder: 20,
        deliveryTime: '30-40',
        distance: '1.0 mi',
        isOpen: true,
        tags: ['south-african', 'braai', 'game-meat', 'modern']
      },
    ];

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
    ];

    setOutlets(mockOutlets);
    setOrders(mockOrders);
  }, []);

  const activeOrders = orders.filter(o => o.estimated_status !== 'delivered');
  const pastOrders = orders.filter(o => o.estimated_status === 'delivered');

  // Filter outlets based on search and category
  const filteredOutlets = outlets.filter(outlet => {
    const matchesSearch = outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outlet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outlet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           outlet.category_name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                           outlet.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'ethiopian', 'nigerian', 'kenyan', 'congolese', 'egyptian', 'south-african'];

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
            title="Favorite Outlets"
            value="4"
            icon="star"
            description="saved for later"
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

        {/* Tabs Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'outlets' && (
            <div>
              {/* Search and Filter */}
              <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search outlets by name, cuisine, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-gray-500" />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat === 'all' ? 'All Cuisines' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Outlets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOutlets.map(outlet => (
                  <OutletCard key={outlet.id} outlet={outlet} isOwner={false} />
                ))}
              </div>

              {filteredOutlets.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <Store className="w-16 h-16 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">No outlets found matching your search</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Active Orders</h2>
                
                {activeOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">No active orders</p>
                    <button 
                      onClick={() => setActiveTab('outlets')}
                      className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Browse Outlets
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
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
                
                {pastOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">No order history yet</p>
                    <button 
                      onClick={() => setActiveTab('outlets')}
                      className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Order Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastOrders.map(order => (
                      <OrderCard key={order.id} order={order} isOwner={false} />
                    ))}
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
