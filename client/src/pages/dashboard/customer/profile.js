'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import { User, Mail, Phone, MapPin, Calendar, Edit } from 'lucide-react';

export default function CustomerProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: ''
  });

  useEffect(() => {
    // Get data from localStorage first (since API might fail)
    const token = localStorage.getItem('auth_token');
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    
    if (!token) {
      setError('Not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    // Try to fetch from API
    fetch('http://localhost:5555/api/customer/details', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          // Token expired or invalid
          setError('Session expired. Please log in again.');
          // Fallback to localStorage data
          if (storedName || storedEmail) {
            setUserData({
              name: storedName || 'Customer',
              email: storedEmail || 'customer@example.com'
            });
            setFormData({
              name: storedName || 'Customer',
              email: storedEmail || 'customer@example.com',
              phone: '+254 700 000 000',
              address: 'Nairobi, Kenya',
              birthDate: '1990-01-01'
            });
          }
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        return res.json();
      })
      .then(data => {
        if (data) {
          setUserData(data);
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: '+254 700 000 000',
            address: 'Nairobi, Kenya',
            birthDate: '1990-01-01'
          });
          // Store in localStorage for fallback
          localStorage.setItem('user_name', data.name || '');
          localStorage.setItem('user_email', data.email || '');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        setError('Unable to fetch profile data');
        // Fallback to localStorage
        if (storedName || storedEmail) {
          setUserData({
            name: storedName || 'Customer',
            email: storedEmail || 'customer@example.com'
          });
          setFormData({
            name: storedName || 'Customer',
            email: storedEmail || 'customer@example.com',
            phone: '+254 700 000 000',
            address: 'Nairobi, Kenya',
            birthDate: '1990-01-01'
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      alert('Please log in to update your profile');
      return;
    }

    fetch('http://localhost:5555/api/customer/details', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        // Note: Your API might not accept phone, address, birthDate
        // Only send fields that the API expects
      })
    })
      .then(res => {
        if (res.status === 401) {
          throw new Error('Session expired');
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setUserData(data);
        localStorage.setItem('user_name', data.name || '');
        localStorage.setItem('user_email', data.email || '');
        setIsEditing(false);
        alert('Profile updated successfully!');
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. ' + error.message);
      });
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="customer">
        <DashboardLayout title="Profile">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading profile...</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="customer">
      <DashboardLayout title="My Profile">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
              <p>{error}</p>
              <p className="text-sm mt-1">Using stored information</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{userData?.name || 'Customer'}</h1>
                  <p className="text-blue-100">{userData?.email || 'customer@example.com'}</p>
                  <p className="text-sm text-blue-100">Food Court Customer</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{userData?.name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{userData?.email || 'Not set'}</span>
                    </div>
                  )}
                </div>

                {/* Phone (Local only - not sent to API) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{formData.phone}</span>
                    </div>
                  )}
                </div>

                {/* Birth Date (Local only - not sent to API) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formData.birthDate}</span>
                    </div>
                  )}
                </div>

                {/* Address (Local only - not sent to API) */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows="3"
                    />
                  ) : (
                    <div className="flex items-start gap-2 p-2 border border-gray-200 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <span>{formData.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Order Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">4.7★</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">Favorites</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}