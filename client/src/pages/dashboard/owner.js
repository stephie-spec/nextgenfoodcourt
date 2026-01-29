'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import OutletCard from '@/components/OutletCard';
import OrderCard from '@/components/OrderCard';
import AuthGuard from '@/components/AuthGuard';

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

  return (
    <AuthGuard requiredRole="owner">
      <DashboardLayout title="Owner Dashboard">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="col-span-3 grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border rounded-lg p-6 text-center">
              <div className="text-3xl font-bold">{outlets.length}</div>
              <div className="text-gray-600">Outlets</div>
            </div>
            <div className="bg-white border rounded-lg p-6 text-center">
              <div className="text-3xl font-bold">{orders.length}</div>
              <div className="text-gray-600">Pending Orders</div>
            </div>
            <div className="bg-white border rounded-lg p-6 text-center">
              <div className="text-3xl font-bold">
                ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
              </div>
              <div className="text-gray-600">Today's Revenue</div>
            </div>
          </div>

          <div className="md:col-span-1">
            <h2 className="text-xl font-bold mb-4">Your Outlets</h2>
            {outlets.map(outlet => (
              <OutletCard key={outlet.id} outlet={outlet} />
            ))}
            <button className="w-full py-3 border-2 border-dashed rounded-lg hover:bg-gray-50">
              + Add Outlet
            </button>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 mb-4">
                  <OrderCard order={order} />
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                      Complete
                    </button>
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="col-span-3 mt-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                Add Menu Item
              </button>
              <button className="px-6 py-3 border rounded-lg hover:bg-gray-50">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}