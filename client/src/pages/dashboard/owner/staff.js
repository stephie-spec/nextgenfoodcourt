'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AuthGuard from '@/components/AuthGuard';
import { Users, Plus, Search, Edit, Trash2, Mail, Phone, Briefcase, Clock } from 'lucide-react';

export default function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState([
    {
      id: 1,
      name: 'Michael Chen',
      email: 'michael@example.com',
      phone: '+254 712 345 678',
      role: 'Head Chef',
      outlet: 'Taj Express',
      status: 'active',
      joinDate: '2023-03-15',
      shifts: 'Morning (8 AM - 4 PM)'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+254 723 456 789',
      role: 'Manager',
      outlet: 'Lagos Grill',
      status: 'active',
      joinDate: '2023-05-20',
      shifts: 'Evening (4 PM - 12 AM)'
    },
    {
      id: 3,
      name: 'David Kimani',
      email: 'david@example.com',
      phone: '+254 734 567 890',
      role: 'Waiter',
      outlet: 'Addis Kitchen',
      status: 'active',
      joinDate: '2024-01-10',
      shifts: 'Flexible'
    },
    {
      id: 4,
      name: 'Fatima Ahmed',
      email: 'fatima@example.com',
      phone: '+254 745 678 901',
      role: 'Cashier',
      outlet: 'Dragon Palace',
      status: 'on-leave',
      joinDate: '2023-11-05',
      shifts: 'Morning (8 AM - 4 PM)'
    },
    {
      id: 5,
      name: 'James Omondi',
      email: 'james@example.com',
      phone: '+254 756 789 012',
      role: 'Cook',
      outlet: 'Lagos Grill',
      status: 'inactive',
      joinDate: '2023-08-12',
      shifts: 'Evening (4 PM - 12 AM)'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOutlet, setFilterOutlet] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    outlet: '',
    shifts: ''
  });

  const outlets = ['All Outlets', 'Taj Express', 'Lagos Grill', 'Addis Kitchen', 'Dragon Palace'];
  const statuses = ['All Status', 'active', 'on-leave', 'inactive'];
  const roles = ['Select Role', 'Manager', 'Head Chef', 'Chef', 'Cook', 'Waiter', 'Cashier', 'Cleaner'];

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOutlet = filterOutlet === 'all' || staff.outlet === filterOutlet;
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    
    return matchesSearch && matchesOutlet && matchesStatus;
  });

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email || !newStaff.role || !newStaff.outlet) {
      alert('Please fill in all required fields');
      return;
    }

    const newStaffMember = {
      id: staffMembers.length + 1,
      ...newStaff,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };

    setStaffMembers([...staffMembers, newStaffMember]);
    setNewStaff({ name: '', email: '', phone: '', role: '', outlet: '', shifts: '' });
    setIsAddingStaff(false);
    alert('Staff member added successfully!');
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      setStaffMembers(staffMembers.filter(staff => staff.id !== id));
      alert('Staff member removed successfully!');
    }
  };

  return (
    <AuthGuard requiredRole="owner">
      <DashboardLayout title="Staff Management">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Staff Management</h1>
                  <p className="text-purple-100">Manage your food court staff members</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingStaff(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Staff Member
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search staff by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <select
                value={filterOutlet}
                onChange={(e) => setFilterOutlet(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {outlets.map(outlet => (
                  <option key={outlet} value={outlet === 'All Outlets' ? 'all' : outlet}>
                    {outlet}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {statuses.map(status => (
                  <option key={status} value={status === 'All Status' ? 'all' : status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Staff Modal */}
          {isAddingStaff && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add New Staff Member</h2>
                <form onSubmit={handleAddStaff}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      {roles.map(role => (
                        <option key={role} value={role === 'Select Role' ? '' : role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newStaff.outlet}
                      onChange={(e) => setNewStaff({...newStaff, outlet: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Select Outlet *</option>
                      {outlets.filter(o => o !== 'All Outlets').map(outlet => (
                        <option key={outlet} value={outlet}>{outlet}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Shift Schedule"
                      value={newStaff.shifts}
                      onChange={(e) => setNewStaff({...newStaff, shifts: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingStaff(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add Staff
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map(staff => (
              <div key={staff.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Staff Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{staff.name}</h3>
                      <p className="text-gray-600">{staff.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Staff Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{staff.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{staff.outlet}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{staff.shifts}</span>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        staff.status === 'active' ? 'bg-green-100 text-green-800' :
                        staff.status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">Joined: {staff.joinDate}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 px-3 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50">
                        View Schedule
                      </button>
                      <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Assign Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredStaff.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No Staff Members Found</h3>
              <p className="text-gray-500 mt-2 mb-4">Try adjusting your filters or add new staff members</p>
              <button
                onClick={() => setIsAddingStaff(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Your First Staff Member
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">{staffMembers.length}</div>
              <div className="text-sm text-gray-600">Total Staff</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">
                {staffMembers.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {staffMembers.filter(s => s.status === 'on-leave').length}
              </div>
              <div className="text-sm text-gray-600">On Leave</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(staffMembers.map(s => s.outlet)).size}
              </div>
              <div className="text-sm text-gray-600">Outlets Covered</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}