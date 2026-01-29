'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import OrderCard from '@/components/OrderCard';
import AuthGuard from '@/components/AuthGuard';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Mock orders - fetch('/api/orders/me')
    const mockOrders = [
      { id: 'ORD-001', date: '2024-01-15', total: 45.99, status: 'completed' },
      { id: 'ORD-002', date: '2024-01-16', total: 29.50, status: 'pending' },
      { id: 'ORD-003', date: '2024-01-10', total: 67.25, status: 'completed' },
    ];
    setOrders(mockOrders);
  }, []);

  return (
    <AuthGuard requiredRole="customer">
      <DashboardLayout title="Customer Dashboard">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="col-span-3 grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border rounded-lg p-6 text-center">
              <div className="text-3xl font-bold">{orders.length}</div>
              <div className="text-gray-600">Total Orders</div>
            </div>
            <div className="bg-white border rounded-lg p-6 text-center">
              <div className="text-3xl font-bold">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-gray-600">Pending</div>
            </div>
            <div className="bg-white border rounded-lg p-6 text-center">
              <div className="text-3xl font-bold">
                ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
              </div>
              <div className="text-gray-600">Total Spent</div>
            </div>
          </div>

          <div className="col-span-3">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>

          <div className="col-span-3 mt-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="flex gap-4">
              <a 
                href="/outlets" 
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Order Food
              </a>
              <a 
                href="/profile" 
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                Edit Profile
              </a>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}