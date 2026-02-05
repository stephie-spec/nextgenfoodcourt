'use client';

import { CheckCircle, Clock, Package, Truck, Store, ChevronRight } from 'lucide-react';
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

  const outletName = order.outlet?.name || order.outlet_name;
    // Get food item image from backend
  const itemImage = order.items?.[0]?.image_path || 'default-food.jpg';
  const imageSrc = `http://localhost:5555/uploads/${itemImage.replace(/^\/+/, '')}`;

  const orderTime = order.created_at
    ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-primary transition-colors">
      <div className="p-4">
        <div className="flex gap-4">
          {/* Left side - Image */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted">
              <Image
                src={imageSrc}
                alt={order.items?.[0]?.name || outletName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-1 min-w-0">
            {/* Header with Action Button inline */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 truncate">
                    {isOwner ? `Order #${order.id}` : outletName}
                  </h3>
                  <div className={`px-2 py-1 rounded-full ${statusBg} flex items-center gap-1`}>
                    <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                    <span className="text-xs font-semibold">{statusLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Store className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{outletName}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 pl-2">
                <p className="text-xl font-bold text-gray-900">Ksh {order.total.toFixed(2)}</p>
                {isOwner && order.estimated_status === 'pending' && (
                  <button className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors whitespace-nowrap">
                    Start Prep
                  </button>
                )}
                {isOwner && order.estimated_status === 'preparing' && (
                  <button className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors whitespace-nowrap">
                    Mark Ready
                  </button>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="mb-3">
              <div className="space-y-1">
                {order.items?.slice(0, 2).map((item, index) => (
                  <div key={item.id || item.item_id || index} className="flex items-center gap-2 text-sm">
                      {item.quantity} x
                    <span className="text-gray-700 truncate">{item.name}</span>
                  </div>
                ))}

                {order.items?.length > 2 && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    +{order.items.length - 2} more items
                  </div>
                )}
              </div>
            </div>

            {/* Table Booking Info */}
            {order.table_booking && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                📍 Table {order.table_booking.table_number} for {order.table_booking.capacity} people
              </div>
            )}

            {/* Customer action buttons */}
            {!isOwner && (
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                {order.estimated_status === 'delivered' && (
                  <button className="px-3 py-1.5 bg-primary text-white rounded text-xs font-medium hover:bg-primary/90 transition-colors">
                    Reorder
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}