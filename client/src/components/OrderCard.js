'use client';

import { CheckCircle, Clock, XCircle, ShoppingBag, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function OrderCard({ order }) {
  const statusIcons = {
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
  };

  const StatusIcon = statusIcons[order.status]?.icon || Clock;
  const statusColor = statusIcons[order.status]?.color || 'text-yellow-500';
  const statusBg = statusIcons[order.status]?.bg || 'bg-yellow-100';

  const foodImages = [
    '/food-1.jpg',
    '/food-2.jpg',
    '/food-3.jpg',
    '/food-4.jpg',
  ];
  
  const imageIndex = parseInt(order.id.slice(-1)) % foodImages.length;
  const foodImage = order.image || foodImages[imageIndex];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative h-32 w-32 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={foodImage || "/placeholder-food.jpg"}
              alt={order.items || "Food Order"}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{order.items || `Order #${order.id}`}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {order.outlet || 'Food Court'} • {order.date}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className={`p-2 rounded-full ${statusBg}`}>
                    <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                  </div>
                  <span className="text-sm text-gray-700">
                    {order.status === 'completed' ? 'Delivered' : 
                     order.status === 'pending' ? 'Preparing' : 
                     'Cancelled'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">{order.itemsCount || '1 item'}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                Order Again
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}