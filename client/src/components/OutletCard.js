'use client';

import { Store, MapPin, Star, MoreVertical, Edit } from 'lucide-react';
import Image from 'next/image';

export default function OutletCard({ outlet }) {
  const outletImages = {
    'Addis Kitchen': '/ethiopian-food.jpg',
    'Lagos Grill': '/nigerian-food.jpg',
    'Nairobi Flame': '/kenyan-food.jpg',
    'Kinshasa Kitchen': '/congolese-food.jpg',
  };

  const imageSrc = outletImages[outlet.name] || '/placeholder-outlet.jpg';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={imageSrc}
          alt={outlet.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 right-4">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white">
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Outlet Info */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{outlet.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{outlet.category}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            outlet.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {outlet.status}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">4.8 (128 reviews)</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">24</p>
            <p className="text-xs text-gray-600">Today's Orders</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">$1,248</p>
            <p className="text-xs text-gray-600">Today's Revenue</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            View Menu
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Edit className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}