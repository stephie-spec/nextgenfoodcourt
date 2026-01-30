'use client';

import { Users, ShoppingBag, DollarSign, Clock, Package, TrendingUp } from 'lucide-react';

const iconMap = {
  users: Users,
  orders: ShoppingBag,
  revenue: DollarSign,
  pending: Clock,
  total: Package,
  trend: TrendingUp,
};

export default function StatCard({ title, value, icon, trend, description, color = 'primary' }) {
  const Icon = iconMap[icon] || ShoppingBag;
  
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-green-600 font-medium">{trend}</span>
          <span className="text-gray-500 ml-2">{description}</span>
        </div>
      )}
      
      {!trend && description && (
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}