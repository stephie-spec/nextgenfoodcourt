'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import { Bell, ShoppingBag, AlertTriangle, Users, TrendingUp, Package, CheckCircle, Info } from 'lucide-react';

export default function OwnerNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Order Received',
      message: 'New order #ORD-7842 for Taj Express - Ksh 2,450',
      time: '5 minutes ago',
      type: 'order',
      outlet: 'Taj Express',
      read: false,
      icon: ShoppingBag
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      message: 'Chicken Tikka Masala is running low at Lagos Grill',
      time: '1 hour ago',
      type: 'inventory',
      outlet: 'Lagos Grill',
      read: false,
      icon: AlertTriangle
    },
    {
      id: 3,
      title: 'Staff Shift Reminder',
      message: 'Chef Michael starts evening shift in 30 minutes',
      time: '2 hours ago',
      type: 'staff',
      outlet: 'Addis Kitchen',
      read: true,
      icon: Users
    },
    {
      id: 4,
      title: 'Sales Milestone',
      message: 'Dragon Palace achieved monthly sales target!',
      time: '1 day ago',
      type: 'performance',
      outlet: 'Dragon Palace',
      read: true,
      icon: TrendingUp
    },
    {
      id: 5,
      title: 'New Menu Item Added',
      message: 'Spicy Jollof Rice added to Lagos Grill menu',
      time: '2 days ago',
      type: 'menu',
      outlet: 'Lagos Grill',
      read: true,
      icon: Package
    },
    {
      id: 6,
      title: 'Order Completed',
      message: 'Order #ORD-7819 delivered successfully',
      time: '3 days ago',
      type: 'order',
      outlet: 'Taj Express',
      read: true,
      icon: CheckCircle
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const filterByOutlet = (outlet) => {
    if (outlet === 'all') return notifications;
    return notifications.filter(n => n.outlet === outlet);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const outlets = ['All Outlets', 'Taj Express', 'Lagos Grill', 'Addis Kitchen', 'Dragon Palace'];
  const [selectedOutlet, setSelectedOutlet] = useState('all');

  return (
    <AuthGuard requiredRole="owner">
      <DashboardLayout title="Notifications">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Business Notifications</h1>
                  <p className="text-gray-600">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {outlets.map(outlet => (
                    <option key={outlet} value={outlet === 'All Outlets' ? 'all' : outlet.toLowerCase()}>
                      {outlet}
                    </option>
                  ))}
                </select>
                
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filterByOutlet(selectedOutlet).map(notification => {
              const Icon = notification.icon;
              const iconColor = {
                order: 'text-blue-600 bg-blue-100',
                inventory: 'text-yellow-600 bg-yellow-100',
                staff: 'text-green-600 bg-green-100',
                performance: 'text-purple-600 bg-purple-100',
                menu: 'text-orange-600 bg-orange-100'
              }[notification.type] || 'text-gray-600 bg-gray-100';

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl border ${notification.read ? 'border-gray-200' : 'border-purple-200 bg-purple-50'} p-4`}
                >
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-full ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{notification.title}</h3>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {notification.outlet}
                            </span>
                          </div>
                          <p className="text-gray-600">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-purple-600 hover:text-purple-800"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      
                      {!notification.read && (
                        <div className="mt-3 flex gap-2">
                          {notification.type === 'order' && (
                            <>
                              <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                View Order
                              </button>
                              <button className="px-3 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50">
                                Assign Staff
                              </button>
                            </>
                          )}
                          {notification.type === 'inventory' && (
                            <button className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
                              Update Stock
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filterByOutlet(selectedOutlet).length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No Notifications</h3>
              <p className="text-gray-500 mt-2">No notifications for the selected outlet</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}