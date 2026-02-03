'use client';

import React from 'react';
import { Star, TrendingUp, Zap, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RightSidebar() {
  const advertisements = [
    {
      id: 1,
      title: '20% Off',
      subtitle: 'Ethiopian Platters',
      description: 'Limited time offer on all Ethiopian dishes',
      icon: '🌶️',
      color: 'from-red-500/20 to-orange-500/20',
      borderColor: 'border-red-500/30',
      link: '/special-offers',
      badge: 'Hot Deal',
    },
    {
      id: 2,
      title: 'Free Delivery',
      subtitle: 'Orders Over $25',
      description: 'Use code: FREEDEL25',
      icon: '🚚',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      link: '/special-offers',
      badge: 'Save More',
    },
    {
      id: 3,
      title: 'New Outlet',
      subtitle: 'Moroccan Express',
      description: 'Now open with authentic Moroccan cuisine',
      icon: '🍵',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      link: '/outlets',
      badge: 'New',
    },
  ];

  const quickStats = [
    { label: 'Top Rated', value: '4.8★', icon: Star },
    { label: 'Trending', value: '1.2K+', icon: TrendingUp },
    { label: 'Fast', value: '20 mins', icon: Clock },
  ];

  return (
    <aside className="w-80 sticky top-16 h-fit px-6 py-6 space-y-6 flex-shrink-0">
      {/* Quick Stats */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Why Choose Us</h3>
        <div className="grid grid-cols-1 gap-2">
          {quickStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border hover:border-primary transition-colors cursor-default"
              >
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advertisements */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Special Offers</h3>
        <div className="space-y-3">
          {advertisements.map((ad) => (
            <Link key={ad.id} href={ad.link} className="block">
              <div
                className={`group relative p-4 rounded-lg border ${ad.borderColor} bg-gradient-to-br ${ad.color} hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden`}
              >
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-300" />

                {/* Badge */}
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="text-2xl">{ad.icon}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-primary/20 text-primary rounded-full">
                    {ad.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h4 className="font-bold text-foreground text-lg">{ad.title}</h4>
                  <p className="text-sm font-semibold text-primary mb-1">{ad.subtitle}</p>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{ad.description}</p>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                    Claim Now
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 bg-secondary/50 rounded-lg border border-border">
        <h3 className="text-sm font-bold text-foreground mb-3">Need Help?</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="break-words">📞 (555) 123-4567</p>
          <p className="break-words">📧 support@nextgenfood.com</p>
          <p>🕐 24/7 Support</p>
        </div>
      </div>

      {/* Newsletter */}
      <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-border">
        <h3 className="text-sm font-bold text-foreground mb-2">Stay Updated</h3>
        <p className="text-xs text-muted-foreground mb-3">Get exclusive deals and new menu items</p>
        <button className="w-full px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          Subscribe
        </button>
      </div>
    </aside>
  );
}
