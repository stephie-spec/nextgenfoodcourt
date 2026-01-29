'use client';

import { Store, MapPin, Star, TrendingUp, Users, DollarSign } from 'lucide-react';
import Image from 'next/image';

export default function OutletCard({ outlet }) {
  // Sample outlet images
  const outletImages = {
    'Addis Kitchen': '/ethiopian-food.jpg',
    'Lagos Grill': '/nigerian-food.jpg',
    'Nairobi Flame': '/kenyan-food.jpg',
    'Kinshasa Kitchen': '/congolese-food.jpg',
  };

  const imageSrc = outletImages[outlet.name] || '/placeholder-outlet.jpg';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Outlet Image */}
      <div className="relative h-48 w-full">
        <Image
          src={imageSrc}
          alt={outlet.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            outlet.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {outlet.status}
          </span>
        </div>
      </div>

      {/* Outlet Info */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{outlet.name}</h3>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{outlet.category_name}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold">{outlet.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({outlet.reviews} reviews)</span>
          </div>
          <button className="text-primary text-sm font-medium hover:text-primary/80">
            Manage →
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <p className="text-lg font-bold text-gray-900">{outlet.today_orders}</p>
            </div>
            <p className="text-xs text-gray-600">Today's Orders</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <p className="text-lg font-bold text-gray-900">${outlet.today_revenue.toFixed(0)}</p>
            </div>
            <p className="text-xs text-gray-600">Revenue</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <p className="text-lg font-bold text-gray-900">{outlet.total_orders}</p>
            </div>
            <p className="text-xs text-gray-600">Total Orders</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            View Menu
          </button>
          <button className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
}