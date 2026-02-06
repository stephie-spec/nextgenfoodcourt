'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import { Bell, CheckCircle, AlertTriangle, Info, ShoppingBag, Star, Gift } from 'lucide-react';

export default function CustomerNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Order Ready for Pickup',
      message: 'Your order from Taj Express is ready for pickup at counter 3.',
      time: '10 minutes ago',
      type: 'order',
      read: false,
      icon: ShoppingBag
    },
    {
      id: 2,
      title: 'New Special Offer',
      message: 'Get 20% off on all Ethiopian dishes at Addis Kitchen this weekend!',
      time: '2 hours ago',
      type: 'promotion',
      read: false,
      icon: Gift
    },
    {
      id: 3,
      title: 'Order Delivered',
      message: 'Your order from Lagos Grill has been delivered successfully.',
      time: '1 day ago',
      type: 'order',
      read: true,
      icon: CheckCircle
    },
    {
      id: 4,
      title: 'Please Rate Your Order',
      message: 'How was your recent order from Dragon Palace? Share your experience.',
      time: '2 days ago',
      type: 'feedback',
      read: true,
      icon: Star
    },
    {
      id: 5,
      title: 'System Maintenance',
      message: 'The food court app will be unavailable tomorrow from 2 AM to 4 AM for maintenance.',
      time: '3 days ago',
      type: 'system',
      read: true,
      icon: Info
    },
    {
      id: 6,
      title: 'Payment Failed',
      message: 'Your last payment attempt failed. Please update your payment method.',
      time: '5 days ago',
      type: 'alert',
      read: true,
      icon: AlertTriangle
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthGuard requiredRole="customer">
      <DashboardLayout title="Notifications">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Notifications</h1>
                  <p className="text-gray-600">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map(notification => {
              const Icon = notification.icon;
              const iconColor = {
                order: 'text-blue-600 bg-blue-100',
                promotion: 'text-green-600 bg-green-100',
                feedback: 'text-yellow-600 bg-yellow-100',
                system: 'text-gray-600 bg-gray-100',
                alert: 'text-red-600 bg-red-100'
              }[notification.type] || 'text-gray-600 bg-gray-100';

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl border ${notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'} p-4`}
                >
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-full ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{notification.title}</h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                      {notification.type === 'order' && !notification.read && (
                        <button className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                          View Order Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {notifications.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No Notifications</h3>
              <p className="text-gray-500 mt-2">You're all caught up!</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}