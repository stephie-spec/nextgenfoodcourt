'use client';

import { Users, ShoppingBag, DollarSign, Clock, Package, TrendingUp, Star, ChefHat, Store, Heart } from 'lucide-react';

const iconMap = {
  users: Users,
  orders: ShoppingBag,
  revenue: DollarSign,
  pending: Clock,
  total: Package,
  trend: TrendingUp,
  star: Star,
  menu: ChefHat,
  outlet: Store,
  heart: Heart,
};

export default function StatCard({ title, value, icon, trend, description, color = 'primary', className = '' }) {
  const Icon = iconMap[icon] || ShoppingBag;
  
  const colorSchemes = {
    primary: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    orange: 'text-amber-600 bg-amber-50',
    purple: 'text-purple-600 bg-purple-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    pink: 'text-pink-600 bg-pink-50'
  };

  const iconColor = colorSchemes[color] || colorSchemes.primary;

  return (
    <div className={`bg-white rounded-lg border border-gray-100 p-3 hover:shadow-sm transition-shadow overflow-hidden ${className}`}>
      {/* Title row */}
      <div className="flex items-center justify-between mb-1 overflow-hidden">
        <span className="text-xs font-medium text-gray-500 truncate">{title}</span>
        <div className={`${iconColor} p-1 rounded-md flex-shrink-0 ml-2`}>
          <Icon className="w-3 h-3" />
        </div>
      </div>
      
      {/* Value and description */}
      <div className="overflow-hidden">
        <span className="text-base font-bold text-gray-900 mr-1 truncate block">{value}</span>
        <div className="truncate">
          {trend ? (
            <span className="text-xs text-gray-400 truncate">
              <TrendingUp className="w-3 h-3 inline mr-0.5 text-emerald-500 align-text-bottom" />
              <span className="text-emerald-600 font-medium mr-1">{trend}</span>
              {description}
            </span>
          ) : (
            <span className="text-xs text-gray-400 truncate">{description}</span>
          )}
        </div>
      </div>
    </div>
  );
}