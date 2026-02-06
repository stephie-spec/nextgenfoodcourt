import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight, Utensils, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
// State to track which image is currently being shown
const [currentImageIndex, setCurrentImageIndex] = useState(0);
const router = useRouter();

//  Array of image paths used in the hero section slideshow
const heroImages = ['/food-1.jpg', '/food-2.jpg', '/food-3.jpg', '/food-4.jpg'];

useEffect(() => {
  // Set up an interval to change the image every 5 seconds
  const interval = setInterval(() => {
    // Update the image index, looping back to the start when reaching the end
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  }, 5000);

  // Clear the interval when the component unmounts to prevent memory leaks
  return () => clearInterval(interval);
}, [heroImages.length]); // Re-run effect only if the number of images changes

  return (
    <section className="relative w-full pt-20 overflow-hidden">
      {/* Hero Background - Kitchen Setting */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/kitchen.jpg"
          alt="Professional kitchen with fresh ingredients"
          fill
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
          {/* Left - Image Carousel */}
          <div className="relative h-96 md:h-[500px] order-2 lg:order-1">
            {/* Main Image */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
              {heroImages.map((image, index) => (
                <Image
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`Delicious dish ${index + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={index === 0}
                />
              ))}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-primary w-8'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>

            {/* Floating Food Info */}
            <div className="absolute top-6 right-6 bg-white/95 dark:bg-card/95 backdrop-blur px-4 py-3 rounded-xl shadow-lg">
              <p className="text-sm font-semibold text-foreground">Featured</p>
              <p className="text-xs text-muted-foreground">African cuisines</p>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">African</span> Flavors
              </h1>
              <p className="text-lg text-muted-foreground">
                Experience authentic cuisines from 20+ premium outlets. Ethiopian, Nigerian, Congolese, Kenyan and more, all in one vibrant space.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
              <div>
                <div className="text-3xl font-bold text-primary">20+</div>
                <p className="text-sm text-muted-foreground">Outlets</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">100+</div>
                <p className="text-sm text-muted-foreground">Dishes</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">24/7</div>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => router.push('/orders')}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                <Utensils className="w-5 h-5" />
                Order Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => router.push('/book-table')}
                className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/10 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Book a Table
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
