'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Sun, Moon, ShoppingCart, Calendar } from 'lucide-react';

const foodImages = [
  '/food-1.jpg',
  '/food-2.jpg',
  '/food-3.jpg',
  '/food-4.jpg',
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % foodImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToImage = (index) => {
    setCurrentImageIndex(index);
    setIsAutoPlay(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % foodImages.length);
    setIsAutoPlay(false);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + foodImages.length) % foodImages.length);
    setIsAutoPlay(false);
  };

  if (!mounted) return null;
    return (    