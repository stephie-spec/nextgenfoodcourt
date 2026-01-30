'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, MessageCircle, Quote } from 'lucide-react';

export default function Testimonials() {
  /**
   * Mock testimonials grouped by outlet.
   * Each outlet contains metadata + an array of customer reviews.
   * This structure makes it easy to switch outlets dynamically.
   */
  const mockTestimonialsByOutlet = {
    0: {
      outlet: 'Addis Kitchen',
      cuisine: 'Ethiopian',
      testimonials: [
        {
          id: 1,
          name: 'Stephanie Abebe',
          avatar: '👩‍🍳',
          rating: 5,
          text: 'The most authentic Ethiopian food I\'ve had outside of Africa. The injera is perfectly soft and the spices are just right!',
          date: '2 weeks ago',
        },
        {
          id: 2,
          name: 'Abiud Tekle',
          avatar: '👨‍💼',
          rating: 5,
          text: 'Coming here is like traveling to Addis Ababa. Every bite takes me back to my travels. Highly recommend!',
          date: '1 month ago',
        },
      ],
    },
    1: {
      outlet: 'Lagos Grill',
      cuisine: 'Nigerian',
      testimonials: [
        {
          id: 3,
          name: 'Natalie Okoro',
          avatar: '👩‍💻',
          rating: 5,
          text: 'Best jollof rice in the city! The chicken is always juicy and the rice has that perfect balance of spices.',
          date: '1 week ago',
        },
        {
          id: 4,
          name: 'Newton Eze',
          avatar: '👨‍🎓',
          rating: 5,
          text: 'I bring my friends here all the time. They always ask for the jollof rice and nobody complains!',
          date: '3 weeks ago',
        },
      ],
    },
    2: {
      outlet: 'Nairobi Flame',
      cuisine: 'Kenyan',
      testimonials: [
        {
          id: 5,
          name: 'Heebah Mwangi',
          avatar: '👨‍🌾',
          rating: 5,
          text: 'The nyama choma here is cooked to perfection. You can taste the quality of the meat and the charcoal flavor. Asante!',
          date: '2 weeks ago',
        },
        {
          id: 6,
          name: 'Verah Njeri',
          avatar: '👩‍🏫',
          rating: 5,
          text: 'Great service, great food, great prices. This is my go-to place for authentic Kenyan cuisine.',
          date: '1 month ago',
        },
      ],
    },
    3: {
      outlet: 'Kinshasa Kitchen',
      cuisine: 'Congolese',
      testimonials: [
        {
          id: 7,
          name: 'Maria Mbemba',
          avatar: '🧑‍🎤',
          rating: 5,
          text: 'Finally found authentic Congolese food! The saka saka and fufu taste just like home. This place is a gem!',
          date: '3 weeks ago',
        },
        {
          id: 8,
          name: 'Tomashi Mputu',
          avatar: '👩‍⚕️',
          rating: 5,
          text: 'The flavors are incredible. Everything is fresh and cooked with so much love. Definitely worth a visit!',
          date: '2 weeks ago',
        },
      ],
    },
  };

  /** Currently selected outlet index */
  const [selectedOutlet, setSelectedOutlet] = useState(0);

  /** Simulated loading state (useful when replacing mock data with API calls) */
  const [loading, setLoading] = useState(true);

  /**
   * Simulate async data loading.
   * This mirrors real-world API behavior and prevents UI flicker later.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  /** Active outlet data based on selection */
  const current = mockTestimonialsByOutlet[selectedOutlet];

  /** Extract outlet names for the selector buttons */
  const outletList = Object.keys(mockTestimonialsByOutlet).map(
    key => mockTestimonialsByOutlet[key].outlet
  );

  return (
    <section
      id="about"
      className="py-16 sm:py-20 bg-gradient-to-br from-background via-secondary/20 to-background"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ================= Section Header ================= */}
        <div className="mb-10 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
            <h2 className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              What Customers Say
            </h2>
          </div>

          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Testimonials & Reviews
          </h3>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Hear from our satisfied customers about their experience at each of our premium outlets.
          </p>
        </div>

        {/* ================= Outlet Selector ================= */}
        <div className="mb-10 sm:mb-12 flex flex-wrap gap-2 sm:gap-3">
          {outletList.map((outlet, index) => (
            <button
              key={index}
              onClick={() => setSelectedOutlet(index)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                selectedOutlet === index
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {outlet}
            </button>
          ))}
        </div>

        {/* ================= Testimonials Grid ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {current.testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary"
            >
              {/* Decorative quote icon */}
              <Quote className="w-8 h-8 text-primary/30 mb-4" />

              {/* Star rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author details */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= Stats Summary ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              4.8/5
            </div>
            <p className="text-foreground font-semibold">Average Rating</p>
            <p className="text-sm text-muted-foreground mt-1">
              Across all outlets
            </p>
          </div>

          <div className="text-center border-l border-r border-border">
            <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
              10K+
            </div>
            <p className="text-foreground font-semibold">Happy Customers</p>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly visitors
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              95%
            </div>
            <p className="text-foreground font-semibold">Satisfaction Rate</p>
            <p className="text-sm text-muted-foreground mt-1">
              Customer satisfaction
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
