'use client';

import React, { useState } from 'react';
import Navbar from '@/components/navbar';

export default function TrackOrderPage() {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!code) return setError('Enter a tracking code');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5555/api/orders/track/${encodeURIComponent(code)}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error || `HTTP ${res.status}`);
        setOrder(null);
      } else {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold mb-4">Track Your Order</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter the tracking code you received after checkout</p>

        <form onSubmit={handleTrack} className="mb-6">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter tracking code"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button className="px-4 py-2 bg-primary text-white rounded-lg">Track</button>
          </div>
        </form>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {order && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Order #{order.id}</h2>
            <p className="text-sm text-muted-foreground">Status: <strong>{order.status}</strong></p>
            <p className="text-sm text-muted-foreground">Outlet: {order.outlet_name}</p>
            <p className="text-sm text-muted-foreground">Customer: {order.customer_name || order.guest_name || 'Guest'}</p>

            <div className="mt-4">
              <h3 className="font-semibold">Items</h3>
              <ul className="mt-2 space-y-2">
                {order.items && order.items.map((it, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <img src={`http://localhost:5555/uploads/${it.image_path}`} alt={it.name} className="w-12 h-12 rounded-md object-cover" />
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {it.quantity} • Ksh {it.price}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex justify-between">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="font-semibold">Ksh {order.total}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
