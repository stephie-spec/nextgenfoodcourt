'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import { Settings, Bell, Shield, CreditCard, Globe, FileText, Users, Store } from 'lucide-react';

export default function OwnerSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      businessName: 'Food Court Group',
      timezone: 'Africa/Nairobi',
      currency: 'Ksh',
      taxRate: 16
    },
    notifications: {
      newOrders: true,
      lowStock: true,
      staffAlerts: true,
      performanceReports: false,
      emailReports: true
    },
    billing: {
      plan: 'premium',
      billingCycle: 'monthly',
      autoRenew: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      ipWhitelist: false
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
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <AuthGuard requiredRole="owner">
      <DashboardLayout title="Settings">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <nav className="space-y-1">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${activeTab === tab.id ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'hover:bg-gray-50'}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === 'general' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">General Settings</h2>
                      <p className="text-gray-600">Manage your business preferences</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-medium">Business Name</label>
                        <input
                          type="text"
                          value={settings.general.businessName}
                          onChange={(e) => handleSettingChange('general', 'businessName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-medium">Timezone</label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="Africa/Nairobi">East Africa Time (Nairobi)</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time (New York)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="font-medium">Currency</label>
                        <select
                          value={settings.general.currency}
                          onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="Ksh">Kenyan Shilling (Ksh)</option>
                          <option value="$">US Dollar ($)</option>
                          <option value="€">Euro (€)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="font-medium">Tax Rate (%)</label>
                        <input
                          type="number"
                          value={settings.general.taxRate}
                          onChange={(e) => handleSettingChange('general', 'taxRate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium">Business Address</label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        rows="3"
                        placeholder="Enter your business address"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium">Business Description</label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        rows="4"
                        placeholder="Describe your food court business"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Notification Settings</h2>
                      <p className="text-gray-600">Configure how you receive alerts</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div>
                          <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-sm text-gray-500">
                            {key === 'newOrders' && 'Receive alerts for new orders'}
                            {key === 'lowStock' && 'Get notified when items run low'}
                            {key === 'staffAlerts' && 'Receive staff-related notifications'}
                            {key === 'performanceReports' && 'Daily performance reports'}
                            {key === 'emailReports' && 'Weekly email summaries'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('notifications', key, !value)}
                          className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-green-600' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Billing & Subscription</h2>
                      <p className="text-gray-600">Manage your subscription plan</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-bold text-lg">Premium Plan</h3>
                          <p className="text-purple-600">Ksh 5,000 / month</p>
                        </div>
                        <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-gray-600">All features included: 5 outlets, unlimited staff, advanced analytics</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <p className="font-medium">Billing Cycle</p>
                          <p className="text-sm text-gray-500">How often you are billed</p>
                        </div>
                        <select
                          value={settings.billing.billingCycle}
                          onChange={(e) => handleSettingChange('billing', 'billingCycle', e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly (Save 20%)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <p className="font-medium">Auto Renew</p>
                          <p className="text-sm text-gray-500">Automatically renew subscription</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('billing', 'autoRenew', !settings.billing.autoRenew)}
                          className={`w-12 h-6 rounded-full transition-colors ${settings.billing.autoRenew ? 'bg-green-600' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.billing.autoRenew ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                        Update Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Security Settings</h2>
                      <p className="text-gray-600">Manage your account security</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                        className={`w-12 h-6 rounded-full transition-colors ${settings.security.twoFactorAuth ? 'bg-green-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.security.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        min="5"
                        max="120"
                      />
                      <p className="text-sm text-gray-500">How long before you're automatically logged out</p>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div>
                        <p className="font-medium">IP Address Whitelist</p>
                        <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('security', 'ipWhitelist', !settings.security.ipWhitelist)}
                        className={`w-12 h-6 rounded-full transition-colors ${settings.security.ipWhitelist ? 'bg-green-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.security.ipWhitelist ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="font-medium mb-3">Password</h3>
                      <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}