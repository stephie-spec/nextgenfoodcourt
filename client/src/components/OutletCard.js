'use client';

import { Store, MapPin, Star, Clock, Tag, Users } from 'lucide-react';
import Image from 'next/image';

export default function OutletCard({ outlet, isOwner = false }) {
  // Sample outlet images
  const outletImages = {
    'Addis Kitchen': '/ethiopian-food.jpg',
    'Lagos Grill': '/nigerian-food.jpg',
    'Nairobi Flame': '/kenyan-food.jpg',
    'Kinshasa Kitchen': '/congolese-food.jpg',
    'Cairo Oasis': '/egyptian-food.jpg',
    'Cape Town Grill': '/south-african-food.jpg',
  };

  const imageSrc = outletImages[outlet.name] || '/placeholder-outlet.jpg';

  // Tags based on cuisine type
  const getTags = (category) => {
    const tagMap = {
      'Ethiopian': ['Spicy', 'Injera', 'Traditional', 'Vegetarian'],
      'Nigerian': ['Jollof Rice', 'Spicy', 'Grilled', 'Party Food'],
      'Kenyan': ['Nyama Choma', 'Grilled', 'BBQ', 'Traditional'],
      'Congolese': ['Fufu', 'Fish', 'Stew', 'Traditional'],
      'Egyptian': ['Koshari', 'Falafel', 'Street Food', 'Vegetarian'],
      'South African': ['Braai', 'BBQ', 'Game Meat', 'Modern']
    };
    return tagMap[category] || ['African', 'Traditional', 'Authentic'];
  };

  const tags = getTags(outlet.category_name?.split(' ')[0] || 'African');

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
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            outlet.status === 'active' || outlet.isOpen
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {outlet.status === 'active' || outlet.isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Outlet Info */}
      <div className="p-5">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-900">{outlet.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold">{outlet.rating || 4.5}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{outlet.category_name || 'African Cuisine'}</span>
            {outlet.distance && (
              <span className="text-gray-500">• {outlet.distance}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {outlet.description || `Authentic ${outlet.category_name?.split(' ')[0] || 'African'} cuisine prepared by expert chefs using traditional methods.`}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <p className="text-lg font-bold text-gray-900">{outlet.today_orders || 0}</p>
            </div>
            <p className="text-xs text-gray-600">Today's Orders</p>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {outlet.minOrder ? `$${outlet.minOrder}` : '$15'}
            </p>
            <p className="text-xs text-gray-600">Min Order</p>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {outlet.deliveryTime || '30-45'}
            </p>
            <p className="text-xs text-gray-600">Mins</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            View Menu
          </button>
          {isOwner ? (
            <button className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Manage
            </button>
          ) : (
            <button className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}