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
  })
