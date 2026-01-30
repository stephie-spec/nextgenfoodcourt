'use client';

import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-card border-t border-border">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 sm:w-10 h-9 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-base sm:text-lg">🍽️</span>
              </div>
              <span className="font-bold text-sm sm:text-lg text-foreground">
                Nextgen Food Court
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Experience the best of African cuisines in one vibrant space. 20+ outlets serving authentic flavors from across the continent.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a href="#" className="p-1.5 sm:p-2 bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground rounded-lg transition-colors">
                <Facebook className="w-4 sm:w-5 h-4 sm:h-5" />
              </a>
              <a href="#" className="p-1.5 sm:p-2 bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground rounded-lg transition-colors">
                <Twitter className="w-4 sm:w-5 h-4 sm:h-5" />
              </a>
              <a href="#" className="p-1.5 sm:p-2 bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground rounded-lg transition-colors">
                <Instagram className="w-4 sm:w-5 h-4 sm:h-5" />
              </a>
              <a href="#" className="p-1.5 sm:p-2 bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground rounded-lg transition-colors">
                <Linkedin className="w-4 sm:w-5 h-4 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm sm:text-base text-foreground mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#popular" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Popular Items
                </a>
              </li>
              <li>
                <a href="#outlets" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Our Outlets
                </a>
              </li>
              <li>
                <a href="#menu" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Full Menu
                </a>
              </li>
              <li>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Special Offers
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Information</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Delivery Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Main Location</p>
                  <p className="text-muted-foreground">123 Food Court Way, City Center, State 12345</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+15551234567" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:info@nextgenfoodcourt.com" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  info@nextgenfoodcourt.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Hours</p>
                  <p className="text-muted-foreground">Daily: 10:00 AM - 10:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Stay Updated
              </h3>
              <p className="text-muted-foreground">
                Subscribe to our newsletter for special offers, new dishes, and outlet updates.
              </p>
            </div>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Copyright */}
        <div className="pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} Nextgen Food Court. All rights reserved. | Made with ❤️ for food lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
