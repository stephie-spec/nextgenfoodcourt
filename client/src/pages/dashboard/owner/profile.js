'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import { User, Mail, Store, TrendingUp, Edit, DollarSign, Users, Package } from 'lucide-react';

export default function OwnerProfile() {
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: ''
  });
  const [stats, setStats] = useState({
    totalOutlets: 0,
    monthlyRevenue: 0,
    totalStaff: 0,
    activeItems: 0
  });

  useEffect(() => {
    // Get data from localStorage first
    const token = localStorage.getItem('auth_token');
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    
    if (!token) {
      setError('Not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    // Try to fetch from API
    fetch('http://localhost:5555/api/owner/details', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          setError('Session expired. Please log in again.');
          // Fallback to localStorage
          if (storedName || storedEmail) {
            setOwnerData({
              name: storedName || 'Owner',
              email: storedEmail || 'owner@example.com'
            });
            setFormData({
              name: storedName || 'Owner',
              email: storedEmail || 'owner@example.com',
              phone: '+254 722 000 000',
              businessName: 'Food Court Business'
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
          setOwnerData(data);
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: '+254 722 000 000',
            businessName: 'Food Court Business'
          });
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
          setOwnerData({
            name: storedName || 'Owner',
            email: storedEmail || 'owner@example.com'
          });
          setFormData({
            name: storedName || 'Owner',
            email: storedEmail || 'owner@example.com',
            phone: '+254 722 000 000',
            businessName: 'Food Court Business'
          });
        }
        setLoading(false);
      });

    // Set mock stats (since API endpoints might not exist yet)
    setStats({
      totalOutlets: 3,
      monthlyRevenue: 125000,
      totalStaff: 12,
      activeItems: 45
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      alert('Please log in to update your profile');
      return;
    }

    fetch('http://localhost:5555/api/owner/details', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email
        // Note: Your API might not accept phone or businessName
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
        setOwnerData(data);
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
      <AuthGuard requiredRole="owner">
        <DashboardLayout title="Profile">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading profile...</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="owner">
      <DashboardLayout title="Owner Profile">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
              <p>{error}</p>
              <p className="text-sm mt-1">Using stored information</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{ownerData?.name || 'Owner'}</h1>
                  <p className="text-purple-100">{ownerData?.email || 'owner@example.com'}</p>
                  <p className="text-sm text-purple-100">Food Court Owner</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-6">Account Information</h2>
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
                        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                          {ownerData?.name || 'Not set'}
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
                        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                          {ownerData?.email || 'Not set'}
                        </div>
                      )}
                    </div>

                    {/* Phone (Local only) */}
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
                        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                          {formData.phone}
                        </div>
                      )}
                    </div>

                    {/* Business Name (Local only) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Business Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      ) : (
                        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                          {formData.businessName}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* Business Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold mb-4">Business Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Outlets</p>
                        <p className="text-lg font-bold">{stats.totalOutlets}</p>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                        <p className="text-lg font-bold">Ksh {stats.monthlyRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Staff Members</p>
                        <p className="text-lg font-bold">{stats.totalStaff}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Menu Items</p>
                        <p className="text-lg font-bold">{stats.activeItems}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    View Business Reports
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Manage Subscription
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}