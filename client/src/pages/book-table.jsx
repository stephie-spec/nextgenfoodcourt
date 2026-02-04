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
          duration_hours: parseInt(formData.duration_hours)
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

  if (success) 