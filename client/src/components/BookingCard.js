'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Store, Users, Calendar, MapPin, Phone, AlertCircle, ChevronRight, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { showToast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

export default function BookingCard({ booking, isOwner = false, onBookingUpdate }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    booking_date: '',
    booking_time: '',
    duration_hours: 2
  });

  // Status configuration
  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Pending Confirmation' },
    confirmed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Confirmed' },
    completed: { icon: CheckCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Cancelled' },
    'checked-in': { icon: Users, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Checked In' },
    'no-show': { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100', label: 'No Show' }
  };

  const StatusIcon = statusConfig[booking.status]?.icon || Clock;
  const statusColor = statusConfig[booking.status]?.color || 'text-yellow-500';
  const statusBg = statusConfig[booking.status]?.bg || 'bg-yellow-100';
  const statusLabel = statusConfig[booking.status]?.label || booking.status;

  // Format booking time
  const bookingDateTime = booking.created_at
    ? new Date(booking.created_at).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    })
    : 'Recently';

  // Get menu item image if available
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/400';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `http://localhost:5555${imagePath}`;
    return `http://localhost:5555/uploads/${imagePath}`;
  };

  const imageSrc = getImageUrl(booking.outlet_image || booking.image_path);

  // Handle status update
  const handleStatusUpdate = async (newStatus, data = {}) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`http://localhost:5555/api/table-bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status: newStatus, ...data }),
      });

      if (!response.ok) throw new Error('Failed to update booking');

      const updatedBooking = await response.json();
      showToast(`Booking ${newStatus} successfully!`, 'success');

      if (onBookingUpdate) {
        onBookingUpdate(updatedBooking);
      }

      setShowCancelModal(false);
      setShowRescheduleModal(false);

    } catch (err) {
      console.error(err);
      showToast('Failed to update booking', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle reschedule
  const handleReschedule = async () => {
    if (!rescheduleData.booking_date || !rescheduleData.booking_time) {
      showToast('Please select date and time', 'error');
      return;
    }

    const bookingDateTime = `${rescheduleData.booking_date}T${rescheduleData.booking_time}`;

    await handleStatusUpdate(booking.status, {
      booking_time: bookingDateTime,
      duration_hours: rescheduleData.duration_hours
    });
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    await handleStatusUpdate('cancelled');
  };

  // Handle rebook (for completed/cancelled)
  const handleRebook = () => {
    router.push(`/book-table?outlet=${booking.outlet_id}&table=${booking.table_number}`);
    showToast('Start a new booking', 'success');
  };

  // Handle check-in (for owner)
  const handleCheckIn = async () => {
    await handleStatusUpdate('checked-in');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-primary/50 transition-all duration-200">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">

          {/* Image */}
          <div className="flex justify-center mb-4 sm:mb-0 sm:flex-shrink-0">
            <div className="relative w-40 h-40 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
              <Image
                src={imageSrc}
                alt={booking.outlet_name || 'Restaurant'}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => (e.target.src = '/default-table.jpg')}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top row: status + booking ID */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`px-2.5 py-1 rounded-full ${statusBg} flex items-center gap-1.5 text-xs font-medium`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${statusColor}`} />
                    <span>{statusLabel}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Booking #{booking.id}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-base">
                  {booking.outlet_name || 'Restaurant Booking'}
                </h3>
              </div>

              {booking.total && (
                <p className="text-xl font-bold text-gray-900 sm:text-right">
                  Ksh {booking.total?.toFixed(2)}
                </p>
              )}
            </div>

            {/* Booking Details */}
            <div className="mt-3 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg">
              <div className="flex items-center gap-2 mb-3 text-indigo-800 font-medium">
                <Users className="w-4 h-4" />
                <span>Table Reservation</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Table Number */}
                <div className="flex items-center gap-2 text-indigo-700">
                  <Store className="w-4 h-4 text-indigo-600" />
                  <span>
                    Table <strong className="text-indigo-900">#{booking.table_number}</strong>
                  </span>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-2 text-indigo-700">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>
                    <strong className="text-indigo-900">{booking.capacity || 4}</strong> people
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-indigo-700">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>
                    {booking.booking_date
                      ? new Date(booking.booking_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                      : bookingDateTime}
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-indigo-700">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>
                    {booking.booking_time
                      ? new Date(booking.booking_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                      : '—'}
                  </span>
                </div>

                {/* Duration */}
                {booking.duration && (
                  <div className="flex items-center gap-2 text-indigo-700 col-span-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>
                      Duration: <strong className="text-indigo-900">{booking.duration}</strong>
                    </span>
                  </div>
                )}

                {/* Pre-ordered Items */}
                {booking.items && booking.items.length > 0 && (
                  <div className="col-span-2 mt-2 pt-2 border-t border-indigo-200">
                    <p className="text-xs font-medium text-indigo-800 mb-1">Pre-ordered items:</p>
                    {booking.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-indigo-700">
                        <span className="font-bold">{item.quantity}x</span>
                        <span className="truncate">{item.name}</span>
                        <span className="ml-auto">Ksh {item.price * item.quantity}</span>
                      </div>
                    ))}
                    {booking.items.length > 2 && (
                      <div className="text-xs text-indigo-600 flex items-center gap-1 mt-1">
                        <ChevronRight className="w-3 h-3" />
                        +{booking.items.length - 2} more items
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2 justify-end">

              {/* OWNER ACTIONS */}
              {isOwner && (
                <>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Confirm Booking
                    </button>
                  )}

                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={handleCheckIn}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Check In
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('completed')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                      >
                        Mark Completed
                      </button>
                    </>
                  )}

                  {booking.status === 'checked-in' && (
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      Complete Booking
                    </button>
                  )}
                </>
              )}

              {/* CUSTOMER ACTIONS */}
              {!isOwner && (
                <div className="flex flex-wrap gap-2">
                  {/* Pending bookings - can cancel */}
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => setShowRescheduleModal(true)}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}

                  {/* Confirmed bookings - can cancel */}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {/* Checked in / Completed - can view details */}
                  {['checked-in', 'completed'].includes(booking.status) && (
                    <button
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      View Details
                    </button>
                  )}

                  {/* History bookings - can rebook */}
                  {['completed', 'cancelled', 'no-show'].includes(booking.status) && (
                    <button
                      onClick={handleRebook}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Book Again
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancel Booking?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this table reservation?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Table #{booking.table_number} • {booking.capacity} guests
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
              >
                {isUpdating ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRescheduleModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Reschedule Booking</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleData.booking_date}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, booking_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  value={rescheduleData.booking_time}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, booking_time: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <select
                  value={rescheduleData.duration_hours}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300"
                >
                  {[1, 2, 3, 4].map(hours => (
                    <option key={hours} value={hours}>{hours} hour{hours > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}