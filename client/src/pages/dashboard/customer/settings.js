'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import { Bell, Globe, Shield, CreditCard, Moon, Smartphone, Mail, Lock } from 'lucide-react';

export default function CustomerSettings() {
  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      promotions: true,
      pushNotifications: false,
      emailDigest: true
    },
    privacy: {
      showProfile: true,
      allowTracking: false,
      shareOrderHistory: false
    },
    preferences: {
      theme: 'light',
      language: 'en',
      currency: 'Ksh'
    }
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // In a real app, save to backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <AuthGuard requiredRole="customer">
      <DashboardLayout title="Settings">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Notifications</h2>
                  <p className="text-gray-600">Manage how you receive notifications</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm text-gray-500">
                        {key === 'orderUpdates' && 'Get updates about your orders'}
                        {key === 'promotions' && 'Receive special offers and discounts'}
                        {key === 'pushNotifications' && 'Receive push notifications on your device'}
                        {key === 'emailDigest' && 'Get weekly email summaries'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('notifications', key, !value)}
                      className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Privacy</h2>
                  <p className="text-gray-600">Control your privacy settings</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm text-gray-500">
                        {key === 'showProfile' && 'Allow other users to see your profile'}
                        {key === 'allowTracking' && 'Help improve the app by sharing usage data'}
                        {key === 'shareOrderHistory' && 'Share your order history for recommendations'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('privacy', key, !value)}
                      className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-green-600' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Preferences</h2>
                  <p className="text-gray-600">Customize your experience</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Theme */}
                <div className="space-y-3">
                  <label className="font-medium">Theme</label>
                  <div className="flex gap-4">
                    {['light', 'dark', 'auto'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => handleSettingChange('preferences', 'theme', theme)}
                        className={`px-4 py-2 rounded-lg border ${settings.preferences.theme === theme ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-3">
                  <label className="font-medium">Language</label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                {/* Currency */}
                <div className="space-y-3">
                  <label className="font-medium">Currency</label>
                  <select
                    value={settings.preferences.currency}
                    onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Ksh">Kenyan Shilling (Ksh)</option>
                    <option value="$">US Dollar ($)</option>
                    <option value="€">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}