'use client';

import { CheckCircle, Clock, Package, Truck, User, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function OrderCard({ order, isOwner = false }) {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Pending' },
    preparing: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Preparing' },
    ready: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Ready' },
    delivered: { icon: Truck, color: 'text-green-500', bg: 'bg-green-100', label: 'Delivered' },
  };

  const StatusIcon = statusConfig[order.estimated_status]?.icon || Clock;
  const statusColor = statusConfig[order.estimated_status]?.color || 'text-yellow-500';
  const statusBg = statusConfig[order.estimated_status]?.bg || 'bg-yellow-100';
  const statusLabel = statusConfig[order.estimated_status]?.label || 'Pending';

  // Determine image based on outlet or items
  const outletImages = {
    'Addis Kitchen': '/ethiopian-food.jpg',
    'Lagos Grill': '/nigerian-food.jpg',
    'Nairobi Flame': '/kenyan-food.jpg',
    'Kinshasa Kitchen': '/congolese-food.jpg',
  };

  const outletName = order.outlet?.name || order.outlet_name;
  const imageSrc = outletImages[outletName] || '/placeholder-food.jpg';

  // Format items for display
  const itemsText = order.items
    ? order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')
    : 'No items';

  // Format time
  const orderTime = order.created_at 
    ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          {/* Order Image */}
          <div className="relative h-40 w-40 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={imageSrc}
              alt={outletName || "Food Order"}
              fill
              className="object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Order Details */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    {isOwner ? `Order #${order.id}` : outletName}
                  </h3>
                  <div className={`p-1.5 rounded-full ${statusBg}`}>
                    <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                  </div>
                </div>
                
                {isOwner ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4" />
                      <span>Customer: {order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>Outlet: {outletName}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600 mb-2">
                    {outletName} • {orderTime}
                  </p>
                )}

                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{itemsText}</p>
                </div>

                {order.table_booking && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      📍 Table {order.table_booking.table_number} for {order.table_booking.capacity} people
                    </p>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                </p>
                {!isOwner && order.delivery_time && (
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    ⏱️ {order.delivery_time}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              {isOwner ? (
                <>
                  {order.estimated_status === 'pending' && (
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                      Start Preparing
                    </button>
                  )}
                  {order.estimated_status === 'preparing' && (
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                      Mark as Ready
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    Contact Customer
                  </button>
                </>
              ) : (
                <>
                  {order.estimated_status === 'delivered' && (
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                      Order Again
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    {order.estimated_status === 'delivered' ? 'View Details' : 'Track Order'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}