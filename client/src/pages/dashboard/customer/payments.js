'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import { CreditCard, Smartphone, Banknote, Building2, Plus, Clock, CheckCircle, XCircle, Download, Calendar, ArrowUpRight } from 'lucide-react';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('methods');

  const paymentMethods = [
    {
      id: 1,
      type: 'visa',
      cardNumber: '**** **** **** 4242',
      cardHolder: 'John Doe',
      expiry: '12/25',
      isDefault: true,
      icon: CreditCard
    },
    {
      id: 2,
      type: 'mastercard',
      cardNumber: '**** **** **** 5555',
      cardHolder: 'John Doe',
      expiry: '08/24',
      isDefault: false,
      icon: CreditCard
    },
    {
      id: 3,
      type: 'mpesa',
      phoneNumber: '+254 712 345 678',
      isDefault: false,
      icon: Smartphone
    }
  ];

  const transactions = [
    {
      id: 'ORD-1234',
      date: '2024-03-15T18:30:00',
      outlet: 'Lagos Grill',
      amount: 45.50,
      status: 'completed',
      paymentMethod: 'Visa ••4242'
    },
    {
      id: 'ORD-1235',
      date: '2024-03-14T12:15:00',
      outlet: 'Zanzibari Spice House',
      amount: 32.80,
      status: 'completed',
      paymentMethod: 'M-Pesa'
    },
    {
      id: 'ORD-1236',
      date: '2024-03-12T19:45:00',
      outlet: 'Cape Town Kitchen',
      amount: 67.20,
      status: 'completed',
      paymentMethod: 'Mastercard ••5555'
    },
    {
      id: 'ORD-1237',
      date: '2024-03-10T13:20:00',
      outlet: 'Lagos Grill',
      amount: 28.90,
      status: 'refunded',
      paymentMethod: 'Visa ••4242'
    },
    {
      id: 'ORD-1238',
      date: '2024-03-08T20:00:00',
      outlet: 'Zanzibari Spice House',
      amount: 54.30,
      status: 'pending',
      paymentMethod: 'Cash on Delivery'
    }
  ];

  const payouts = [
    {
      id: 'PAY-001',
      date: '2024-03-15',
      amount: 1250.00,
      status: 'completed',
      method: 'Bank Transfer',
      account: '••••1234'
    },
    {
      id: 'PAY-002',
      date: '2024-03-08',
      amount: 980.50,
      status: 'completed',
      method: 'Bank Transfer',
      account: '••••1234'
    },
    {
      id: 'PAY-003',
      date: '2024-03-01',
      amount: 1430.25,
      status: 'completed',
      method: 'Bank Transfer',
      account: '••••1234'
    }
  ];

  const balance = {
    available: 1250.00,
    pending: 320.50,
    total: 1570.50
  };

  const statusColors = {
    completed: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    refunded: 'text-orange-600 bg-orange-100',
    failed: 'text-red-600 bg-red-100'
  };

  const statusIcons = {
    completed: CheckCircle,
    pending: Clock,
    refunded: ArrowUpRight,
    failed: XCircle
  };

  return (
    <AuthGuard requiredRole="customer">
      <DashboardLayout title="Payments & Billing">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <p className="text-blue-100 text-sm mb-1">Available Balance</p>
            <p className="text-3xl font-bold">Ksh {balance.available.toFixed(2)}</p>
            <p className="text-blue-100 text-xs mt-2">Ready for withdrawal</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-gray-900">Ksh {balance.pending.toFixed(2)}</p>
            <p className="text-gray-500 text-xs mt-2">Processing</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">Ksh {balance.total.toFixed(2)}</p>
            <p className="text-gray-500 text-xs mt-2">All time</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('methods')}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'methods'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment Methods
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Transaction History
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'payouts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payouts
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {/* Payment Methods Tab */}
          {activeTab === 'methods' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Saved Payment Methods</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {method.cardNumber || method.phoneNumber}
                            </p>
                            {method.isDefault && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {method.cardHolder || 'M-Pesa'} • Expires {method.expiry || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">💳 Secure Payment</h3>
                <p className="text-sm text-blue-800">
                  Your payment information is encrypted with 256-bit SSL security. We never store your full card details.
                </p>
              </div>
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const StatusIcon = statusIcons[transaction.status] || Clock;
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${statusColors[transaction.status]} bg-opacity-20 flex items-center justify-center`}>
                          <StatusIcon className={`w-5 h-5 ${statusColors[transaction.status].split(' ')[0]}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{transaction.outlet}</p>
                            <span className="text-xs text-gray-500">#{transaction.id}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{transaction.paymentMethod}</span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">Ksh {transaction.amount.toFixed(2)}</p>
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[transaction.status]}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Payout History</h2>
                  <p className="text-sm text-gray-500 mt-1">Withdrawals to your bank account</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
                  Request Payout
                </button>
              </div>

              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{payout.method}</p>
                          <span className="text-xs text-gray-500">{payout.account}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(payout.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">#{payout.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">Ksh {payout.amount.toFixed(2)}</p>
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Bank Account</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Equity Bank •••• 1234</p>
                      <p className="text-xs text-gray-500">John Doe • Current Account</p>
                    </div>
                  </div>
                  <button className="text-sm text-primary hover:text-primary/80 font-medium">
                    Change
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Having payment issues? <button className="text-primary font-medium hover:underline">Contact Support</button>
          </p>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}