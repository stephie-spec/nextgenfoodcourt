'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, MessageCircle, Quote, Plus } from 'lucide-react';

export default function Testimonials() {
  /**
   * Testimonials fetched from backend and grouped by `outlet_id`.
   * Backend testimonial shape (server) includes: id, outlet_id, outlet_name,
   * customer_name, avatar, rating, review_text, created_at, updated_at
   */
  const [testimonialsByOutlet, setTestimonialsByOutlet] = useState({});
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form state
  const [form, setForm] = useState({
    customer_name: '',
    rating: 5,
    review_text: '',
    avatar: '',
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

  // Minimal fallback mock used when the backend is unreachable
  const fallbackMock = {
    0: {
      outlet: 'Demo Outlet',
      testimonials: [
        {
          id: 'fallback-1',
          name: 'Demo User',
          avatar: '👤',
          rating: 5,
          text: 'Demo testimonial — backend unavailable.',
          date: new Date().toLocaleString(),
        },
      ],
    },
  };


  /** Currently selected outlet index */
  const [selectedOutlet, setSelectedOutlet] = useState(0);

  /** Toggle expanded outlet list */
  const [expandOutlets, setExpandOutlets] = useState(false);

  /** Loading state for async fetch */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `${API_BASE}/api/testimonials`;

    let mounted = true;

    async function load() {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Group testimonials by outlet_id
        const grouped = {};
        (data.testimonials || data || []).forEach((t) => {
          const outletId = t.outlet_id || 0;
          if (!grouped[outletId]) {
            grouped[outletId] = {
              outlet: t.outlet_name || `Outlet ${outletId}`,
              testimonials: [],
            };
          }

          grouped[outletId].testimonials.push({
            id: t.id,
            name: t.customer_name,
            avatar: t.avatar || '👤',
            rating: t.rating || 0,
            text: t.review_text || '',
            date: t.created_at ? new Date(t.created_at).toLocaleString() : null,
          });
        });

        if (mounted) {
          setTestimonialsByOutlet(grouped);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load testimonials:', err);
        if (mounted) {
          setError(String(err));
          // Use fallback so UI still renders sensibly during development
          setTestimonialsByOutlet(fallbackMock);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => { mounted = false; };
  }, [API_BASE]);

  /** Active outlet data based on selection */
  const outletKeys = Object.keys(testimonialsByOutlet);
  const current = outletKeys.length ? testimonialsByOutlet[outletKeys[selectedOutlet]] : { testimonials: [] };

  /** Extract outlet names for the selector buttons */
  const outletList = outletKeys.length ? outletKeys.map(k => testimonialsByOutlet[k].outlet) : [];

  /** Number of outlets to show initially */
  const INITIAL_DISPLAY = 2;
  const hasMore = outletList.length > INITIAL_DISPLAY;
  const visibleOutlets = expandOutlets ? outletList : outletList.slice(0, INITIAL_DISPLAY);

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

        {/* ================= Outlet Selector / Status ================= */}
        {loading ? (
          <div className="mb-10 sm:mb-12">
            <p className="text-sm text-muted-foreground">Loading testimonials...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-700">
                Failed to load testimonials: {error}
              </div>
            )}

            {/* Segmented Control with Inline More Expansion */}
            <div className="mb-10 sm:mb-12 flex flex-wrap items-center gap-2 sm:gap-3">
              {outletList.length ? (
                <>
                  {/* Segmented Control Container */}
                  <div className="inline-flex items-center gap-1 p-1 bg-secondary/40 rounded-lg border border-border">
                    {visibleOutlets.map((outlet, idx) => {
                      const actualIndex = outletList.indexOf(outlet);
                      
                      return (
                        <button
                          key={actualIndex}
                          onClick={() => setSelectedOutlet(actualIndex)}
                          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-300 whitespace-nowrap ${
                            selectedOutlet === actualIndex
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          {outlet}
                        </button>
                      );
                    })}
                  </div>

                  {/* More Button - inline expansion */}
                  {hasMore && (
                    <button
                      onClick={() => setExpandOutlets(!expandOutlets)}
                      className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-primary/10"
                    >
                      <span>{expandOutlets ? '−' : '+'}</span>
                      <span className="hidden sm:inline">{expandOutlets ? 'Less' : `More (${outletList.length - INITIAL_DISPLAY})`}</span>
                      <span className="sm:hidden">{expandOutlets ? 'Less' : 'More'}</span>
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No testimonials available.</p>
              )}
              
              {/* Add Review button - placed after segmented control */}
              <button
                onClick={() => { setShowForm((s) => !s); setSuccessMsg(null); setError(null); }}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:scale-105 transform transition"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-semibold">Add Review</span>
              </button>
            </div>

            {/* Optional Add Review form */}
            {showForm && (
              <div className="mb-6 p-6 bg-card border border-border rounded-xl">
                <h4 className="font-semibold text-lg mb-3">Share your experience</h4>
                {successMsg && <div className="mb-2 text-sm text-green-600">{successMsg}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={form.customer_name}
                    onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))}
                    className="input w-full"
                    placeholder="Your name"
                  />
                  <select
                    value={form.rating}
                    onChange={(e) => setForm(f => ({ ...f, rating: parseInt(e.target.value, 10) }))}
                    className="input w-full"
                  >
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}
                  </select>
                </div>

                <textarea
                  value={form.review_text}
                  onChange={(e) => setForm(f => ({ ...f, review_text: e.target.value }))}
                  className="mt-3 textarea w-full"
                  placeholder="Write your review..."
                />

                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">Choose an avatar</label>
                  <div className="flex items-center gap-3">
                    <label
                      className={`flex flex-col items-center gap-1 p-2 rounded-md cursor-pointer border ${form.avatar === '👨' ? 'border-primary bg-primary/10' : 'border-transparent'}`}
                      onClick={() => setForm(f => ({ ...f, avatar: '👨' }))}
                    >
                      <div className="text-2xl">👨</div>
                      <div className="text-xs text-muted-foreground">Male</div>
                    </label>

                    <label
                      className={`flex flex-col items-center gap-1 p-2 rounded-md cursor-pointer border ${form.avatar === '👩' ? 'border-primary bg-primary/10' : 'border-transparent'}`}
                      onClick={() => setForm(f => ({ ...f, avatar: '👩' }))}
                    >
                      <div className="text-2xl">👩</div>
                      <div className="text-xs text-muted-foreground">Female</div>
                    </label>

                    <label
                      className={`flex flex-col items-center gap-1 p-2 rounded-md cursor-pointer border ${!form.avatar ? 'border-primary bg-primary/10' : 'border-transparent'}`}
                      onClick={() => setForm(f => ({ ...f, avatar: '' }))}
                    >
                      <div className="text-2xl">👤</div>
                      <div className="text-xs text-muted-foreground">Default</div>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={async () => {
                      // submit handler
                      setSubmitting(true);
                      setError(null);
                      try {
                        const outletKey = outletKeys[selectedOutlet];
                        const outletIdNum = parseInt(outletKey, 10) || 0;
                        const body = {
                          outlet_id: outletIdNum,
                          customer_name: form.customer_name.trim(),
                          rating: form.rating,
                          review_text: form.review_text.trim(),
                          avatar: form.avatar.trim() || undefined,
                        };

                        // basic validation
                        if (!body.customer_name || !body.review_text) {
                          setError('Name and review are required');
                          setSubmitting(false);
                          return;
                        }

                        const res = await fetch(`${API_BASE}/api/testimonials`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(body),
                        });

                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          throw new Error(err.error || `HTTP ${res.status}`);
                        }

                        const created = await res.json();

                        // update local state to include new testimonial
                        setTestimonialsByOutlet(prev => {
                          const copy = { ...prev };
                          const key = String(outletKey || '0');
                          if (!copy[key]) copy[key] = { outlet: created.outlet_name || `Outlet ${key}`, testimonials: [] };
                          copy[key] = { ...copy[key], testimonials: [ { id: created.id, name: created.customer_name, avatar: created.avatar || '👤', rating: created.rating, text: created.review_text, date: new Date(created.created_at).toLocaleString() }, ...copy[key].testimonials ] };
                          return copy;
                        });

                        setSuccessMsg('Thanks! Your review was submitted.');
                        setShowForm(false);
                        setForm({ customer_name: '', rating: 5, review_text: '', avatar: '' });
                      } catch (err) {
                        console.error('Submit review failed', err);
                        setError(String(err));
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>

                  <button
                    onClick={() => { setShowForm(false); setError(null); setSuccessMsg(null); }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-foreground font-semibold hover:opacity-90"
                  >
                    Cancel
                  </button>
                </div>

                {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
              </div>
            )}

            {/* ================= Testimonials Grid ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {current.testimonials && current.testimonials.length ? (
                current.testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary"
                  >
                    {/* Decorative quote icon */}
                    <Quote className="w-8 h-8 text-primary/30 mb-4" />

                    {/* Star rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating || 0)].map((_, i) => (
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
                        <div>
                          {/**
                           * If avatar looks like a filename (has an extension), render the image
                           * from the backend uploads path. Otherwise render the emoji avatar.
                           * If missing, render the backend default image.
                           */}
                          {testimonial.avatar && /\.[a-zA-Z0-9]+$/.test(testimonial.avatar) ? (
                            <img
                              src={`${API_BASE}/uploads/${testimonial.avatar}`}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : testimonial.avatar ? (
                            <div className="text-3xl">{testimonial.avatar}</div>
                          ) : (
                            <img
                              src={`${API_BASE}/uploads/default-avatar.jpg`}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                        </div>
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No reviews for this outlet yet.</p>
              )}
            </div>
          </>
        )}

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
