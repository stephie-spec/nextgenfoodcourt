'use client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Store, MapPin, Star, Tag, Users, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OutletCard({ outlet, isOwner = false }) {
  const router = useRouter();
  // outlet images url path
  const getOutletImage = (imagePath) => {
    const finalImage = imagePath || 'default-food.jpg';
    return `http://localhost:5555/uploads/${finalImage.replace(/^\/+/, '')}`;
  };

  const imageSrc = getOutletImage(outlet.image_path);

  // Tags based on cuisine type
  const getTags = (category) => {
    const tagMap = {
      'Ethiopian': ['Family Style', 'Injera', 'Traditional'],
      'Nigerian': ['Jollof Rice', 'Spicy', 'Grilled'],
      'Kenyan': ['Nyama Choma', 'BBQ', 'Charcoal Grill'],
      'Congolese': ['Fufu', 'Fish Stew', 'Comfort Food'],
      'Egyptian': ['Koshari', 'Street Food', 'Vegetarian'],
      'South African': ['Braai', 'Game Meat', 'Modern Twist']
    };
    return tagMap[category] || ['African', 'Traditional', 'Authentic'];
  };

  const category = outlet.category_name?.split(' ')[0] || 'African';
  const tags = getTags(category);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Outlet Image */}
      <div className="relative h-48 w-full">
        <img
          src={imageSrc}
          alt={outlet.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x300/cccccc/666666?text=Outlet+Image';
          }}
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${outlet.isOpen
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
            }`}>
            {outlet.isOpen ? 'Open Now' : 'Closed'}
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
              <span className="font-bold">{outlet.rating > 0 ? outlet.rating.toFixed(1) : 'New'}</span>
              <span className="text-gray-500 text-sm">({outlet.reviews || 0})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{outlet.category_name || 'African Cuisine'}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {outlet.description || `Authentic ${category} cuisine prepared by expert chefs.`}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats - Only for Owners */}
        {isOwner && (
          <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-200 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <p className="text-lg font-bold text-gray-900">{outlet.today_orders || 0}</p>
              </div>
              <p className="text-xs text-gray-600">Today's Orders</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-lg font-bold text-gray-900">
                  {outlet.rating > 0 ? `${outlet.rating.toFixed(1)}★` : 'New'}
                </p>
              </div>
              <p className="text-xs text-gray-600">Rating</p>
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{outlet.total_orders || 0}</p>
              <p className="text-xs text-gray-600">Total Orders</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
          {isOwner && (
            <div className="pt-4 border-t border-gray-200 flex justify-center">
              <Link
                href={outlet?.id ? `/dashboard/owner/outlets/${outlet.id}/manage` : '#'}
                onClick={(e) => {
                  if (!outlet?.id) {
                    e.preventDefault();
                    console.error('Cannot navigate: no outlet ID');
                  }
                }}
                className="py-2 px-6 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis text-center"
              >
                Manage
              </Link>
            </div>
          )}
        </div>
      </div>
  );
}