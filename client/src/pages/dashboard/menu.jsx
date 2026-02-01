'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Flame, Clock, Star, ChevronRight, Search, Filter } from 'lucide-react';
import Link from 'next/link';

/* ---------------- MOCK DATA ---------------- */

const outletsData = [
  {
    outletId: 1,
    outletName: 'Addis Kitchen',
    cuisine: 'Ethiopian',
    location: 'Level 2 - Court A',
    rating: 4.8,
    deliveryTime: '20-30 min',
    image: '/outlet-showcase-1.jpg',
    coverImage: '/img/ethiopian-food.jpg',
    items: [
      { name: 'Doro Wat', price: 14.99, image: '/food-1.jpg', description: 'Spicy chicken stew simmered in berbere sauce with boiled eggs', calories: 450 },
      { name: 'Injera Platter', price: 12.50, image: '/food-2.jpg', description: 'Assorted lentils and vegetables served on traditional injera', calories: 320 },
      { name: 'Kitfo', price: 16.99, image: '/food-3.jpg', description: 'Minced beef seasoned with butter and spices', calories: 380 },
      { name: 'Tibs', price: 15.99, image: '/food-4.jpg', description: 'Sautéed beef with onions and peppers', calories: 410 },
    ],
  },
  {
    outletId: 2,
    outletName: 'Lagos Grill',
    cuisine: 'Nigerian',
    location: 'Level 2 - Court B',
    rating: 4.6,
    deliveryTime: '15-25 min',
    image: '/outlet-showcase-2.jpg',
    coverImage: '/img/nigerian-food.jpg',
    items: [
      { name: 'Jollof Rice & Chicken', price: 11.99, image: '/food-3.jpg', description: 'Smoky Nigerian jollof with grilled chicken and plantains', calories: 680 },
      { name: 'Suya Skewers', price: 9.50, image: '/food-4.jpg', description: 'Spiced grilled beef with peanut seasoning and onions', calories: 290 },
      { name: 'Egusi Soup', price: 10.99, image: '/food-1.jpg', description: 'Melon seed soup with assorted meat and fish', calories: 350 },
      { name: 'Pounded Yam & Afang', price: 12.99, image: '/food-2.jpg', description: 'Smooth pounded yam with rich vegetable soup', calories: 420 },
    ],
  },
  {
    outletId: 3,
    outletName: 'Cairo Eats',
    cuisine: 'Egyptian',
    location: 'Level 1 - Court C',
    rating: 4.7,
    deliveryTime: '18-28 min',
    image: '/outlet-showcase-3.jpg',
    coverImage: '/img/egyptian-food.jpg',
    items: [
      { name: 'Koshari', price: 8.99, image: '/food-1.jpg', description: 'Egyptian comfort food with rice, lentils, and pasta', calories: 520 },
      { name: 'Shawarma', price: 10.50, image: '/food-2.jpg', description: 'Slow-roasted meat with tahini and pickles in pita', calories: 480 },
      { name: 'Molokhia', price: 11.99, image: '/food-3.jpg', description: 'Jute leaf soup with rabbit and rice', calories: 380 },
      { name: 'Falafel Platter', price: 9.99, image: '/food-4.jpg', description: 'Crispy chickpea fritters with tahini sauce', calories: 420 },
    ],
  },
  {
    outletId: 4,
    outletName: 'Nairobi Bites',
    cuisine: 'Kenyan',
    location: 'Level 3 - Court A',
    rating: 4.5,
    deliveryTime: '22-32 min',
    image: '/outlet-showcase-4.jpg',
    coverImage: '/img/kenyan-food.jpg',
    items: [
      { name: 'Nyama Choma', price: 18.99, image: '/food-1.jpg', description: 'Roasted goat meat with ugali and kachumbari', calories: 550 },
      { name: 'Githeri', price: 9.99, image: '/food-2.jpg', description: 'Boiled maize and beans with vegetables', calories: 380 },
      { name: 'Sukuma Wiki', price: 7.99, image: '/food-3.jpg', description: 'Collard greens sautéed with onions and tomatoes', calories: 180 },
      { name: 'Mandazi', price: 4.99, image: '/food-4.jpg', description: 'Fried dough bread with coconut and spices', calories: 280 },
    ],
  },
  {
    outletId: 5,
    outletName: 'Cape Town Kitchen',
    cuisine: 'South African',
    location: 'Level 1 - Court B',
    rating: 4.9,
    deliveryTime: '20-30 min',
    image: '/outlet-showcase-1.jpg',
    coverImage: '/img/south-african-food.jpg',
    items: [
      { name: 'Bobotie', price: 13.99, image: '/food-2.jpg', description: 'Spiced minced meat topped with egg custard', calories: 520 },
      { name: 'Bunny Chow', price: 10.99, image: '/food-3.jpg', description: 'Curry served in a hollowed loaf of bread', calories: 620 },
      { name: 'Boerewors', price: 12.99, image: '/food-4.jpg', description: 'Traditional South African farmer\'s sausage', calories: 480 },
      { name: 'Malva Pudding', price: 6.99, image: '/food-1.jpg', description: 'Sweet caramelized pudding with custard', calories: 450 },
    ],
  },
  {
    outletId: 6,
    outletName: 'Kinshasa Flavors',
    cuisine: 'Congolese',
    location: 'Level 3 - Court B',
    rating: 4.6,
    deliveryTime: '25-35 min',
    image: '/outlet-showcase-2.jpg',
    coverImage: '/img/congolese-food.jpg',
    items: [
      { name: 'Fufu & Soup', price: 11.99, image: '/food-3.jpg', description: 'Cassava fufu with palm nut soup and fish', calories: 480 },
      { name: 'Moambe Chicken', price: 14.99, image: '/food-4.jpg', description: 'Chicken in palm butter sauce with rice', calories: 550 },
      { name: 'Grilled Fish', price: 13.99, image: '/food-1.jpg', description: 'Fresh tilapia grilled with spices and lemon', calories: 380 },
      { name: 'Kwanga', price: 5.99, image: '/food-2.jpg', description: 'Fermented cassava bread with savory stew', calories: 320 },
    ],
  },
];

const cuisineTypes = ['All', 'Ethiopian', 'Nigerian', 'Egyptian', 'Kenyan', 'South African', 'Congolese'];

/* ---------------- PAGE ---------------- */

export default function MenuPage() {
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const filteredOutlets = outletsData.filter((outlet) => {
    const matchesCuisine = selectedCuisine === 'All' || outlet.cuisine === selectedCuisine;
    const matchesSearch = outlet.outletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         outlet.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCuisine && matchesSearch;
  });
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background pt-28 pb-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                {outletsData.length} Outlets • {outletsData.reduce((acc, o) => acc + o.items.length, 0)} Items
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
                Our <span className="text-primary">Menu</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Discover authentic African cuisine from {outletsData.length} unique outlets. 
                From Ethiopian injera to South African bobotie, taste the continent's finest flavors.
              </p>
            </div>
            
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search dishes or outlets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-72 pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-8 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  {cuisineTypes.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Cuisine Filter Pills */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border py-4 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {cuisineTypes.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCuisine === cuisine
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Outlets Grid */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto space-y-16">
          {filteredOutlets.map((outlet) => (
            <section key={outlet.outletId} className="relative">
              {/* Outlet Header Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card to-card/50 border border-border mb-8">
                {/* Cover Image */}
                <div className="absolute inset-0 h-48 lg:h-64">
                  <Image
                    src={outlet.coverImage}
                    alt={outlet.outletName}
                    fill
                    className="object-cover opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent"></div>
                </div>
                
                <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row lg:items-end gap-6">
                  {/* Outlet Info */}
                  <div className="flex items-start gap-4 lg:gap-6">
                    <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 border-primary shadow-xl">
                      <Image
                        src={outlet.image}
                        alt={outlet.outletName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                        {outlet.outletName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          {outlet.location}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-semibold">{outlet.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          {outlet.deliveryTime}
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          <Flame className="w-3 h-3" />
                          {outlet.cuisine}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* View Outlet Button */}
                  <div className="lg:ml-auto">
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25">
                      View Outlet
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>


