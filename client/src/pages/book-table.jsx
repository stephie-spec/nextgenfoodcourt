'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';

export default function BookTablePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [availableTables, setAvailableTables] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: 1, // TODO: Get from auth context
    outlet_id: '',
    menu_outlet_item_id: '',
    table_number: '',
    capacity: 2,
    quantity: 1,
    duration_hours: 2,
    booking_date: new Date().toISOString().split('T')[0],
    booking_time: '18:00'
  });

  // Fetch available tables
  useEffect(() => {
    fetchAvailableTables();
    fetchOutlets();
  }, []);

  const fetchAvailableTables = async () => {
    try {
      const response = await fetch('http://localhost:5555/api/table-bookings/available-tables');
      const data = await response.json();
      setAvailableTables(data.available_tables || []);
    } catch (error) {
      console.error('Error fetching available tables:', error);
    }
  };

  const fetchOutlets = async () => {
    try {
      const response = await fetch('http://localhost:5555/api/outlets');
      const data = await response.json();
      const outletList = Array.isArray(data)
        ? data
        : Array.isArray(data?.outlets)
          ? data.outlets
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setOutlets(outletList);
    } catch (error) {
      console.error('Error fetching outlets:', error);
      setOutlets([]);
    }
  };

  const fetchMenuItems = async (outletId) => {
    try {
      const response = await fetch(`http://localhost:5555/api/outlet/${outletId}/menu`);
      const data = await response.json();
      const menuList = Array.isArray(data)
        ? data
        : Array.isArray(data?.menu)
          ? data.menu
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.menu_items)
              ? data.menu_items
              : [];
      setMenuItems(menuList);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'outlet_id' && value) {
      fetchMenuItems(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5555/api/table-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: formData.customer_id,
          menu_outlet_item_id: parseInt(formData.menu_outlet_item_id),
          table_number: parseInt(formData.table_number),
          capacity: parseInt(formData.capacity),
          quantity: parseInt(formData.quantity),
          duration_hours: parseInt(formData.duration_hours),
          booking_date: formData.booking_date,
          booking_time: formData.booking_time,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        alert(data.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.table_number) {
      alert('Please select a table');
      return;
    }
    if (step === 2 && (!formData.outlet_id || !formData.menu_outlet_item_id)) {
      alert('Please select an outlet and menu item');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Sidebar />
        <div className="flex w-full pt-16">
          <div className="hidden md:block w-20 flex-shrink-0" />
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center space-y-6 p-8">
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
                <h1 className="text-4xl font-bold text-foreground">Booking Confirmed!</h1>
                <p className="text-lg text-muted-foreground">
                  Your table has been successfully booked. <br />
                  Table Number: <span className="font-bold text-primary">{formData.table_number}</span>
                </p>
                <p className="text-sm text-muted-foreground">Redirecting to home...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <div className="flex w-full pt-16">
        <div className="hidden md:block w-20 flex-shrink-0" />
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Reserve a Table</h1>
              <p className="text-lg text-muted-foreground">Book your spot and pre-order your favorite dishes</p>
            </div>

            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      }`}>
                      {s}
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-secondary'
                        }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">Select Table</span>
                <span className="text-xs text-muted-foreground">Choose Food</span>
                <span className="text-xs text-muted-foreground">Confirm</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Select Table */}
              {step === 1 && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-primary" />
                    Select Your Table
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Number of Guests
                      </label>
                      <select
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground"
                      >
                        {[2, 4, 6, 8, 10].map(num => (
                          <option key={num} value={num}>{num} guests</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Duration (hours)
                      </label>
                      <select
                        name="duration_hours"
                        value={formData.duration_hours}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground"
                      >
                        {[1, 2, 3, 4].map(hours => (
                          <option key={hours} value={hours}>{hours} hour{hours > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date
                      </label>
                      <input
                        type="date"
                        name="booking_date"
                        value={formData.booking_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Time
                      </label>
                      <input
                        type="time"
                        name="booking_time"
                        value={formData.booking_time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Available Tables
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                      {availableTables.map(table => (
                        <button
                          key={table}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, table_number: table.toString() }))}
                          className={`p-4 rounded-lg border-2 font-semibold transition-all ${formData.table_number === table.toString()
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-foreground hover:border-primary'
                            }`}
                        >
                          {table}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Choose Food */}
              {step === 2 && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    Pre-order Your Meal
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Select Outlet
                      </label>
                      <select
                        name="outlet_id"
                        value={formData.outlet_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground"
                        required
                      >
                        <option value="">Choose an outlet...</option>
                        {outlets.map(outlet => (
                          <option key={outlet.id} value={outlet.id}>
                            {outlet.name} - {outlet.category_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.outlet_id && (
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Select Dish
                        </label>
                        <select
                          name="menu_outlet_item_id"
                          value={formData.menu_outlet_item_id}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground"
                          required
                        >
                          <option value="">Choose a dish...</option>
                          {menuItems.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.item_name} - ${item.price}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        max="20"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    Confirm Your Booking
                  </h2>

                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-muted-foreground">Booking Status:</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      Pending Confirmation
                    </span>
                  </div>

                  <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Table Number:</span>
                      <span className="font-bold text-foreground">{formData.table_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="font-bold text-foreground">{formData.capacity} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-bold text-foreground">{formData.duration_hours} hour{formData.duration_hours > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time:</span>
                      <span className="font-bold text-foreground">{formData.booking_date} at {formData.booking_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-bold text-foreground">{formData.quantity}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/10 transition-colors"
                  >
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
