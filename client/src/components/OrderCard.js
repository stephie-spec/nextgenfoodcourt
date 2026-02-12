'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Package, Truck, Store, Users, Calendar, ChevronRight, Check, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { showToast } from '@/lib/toast';
import { useCart } from '@/lib/CartContext';
import { useRouter } from 'next/navigation';


export default function OrderCard({ order, isOwner = false, onOrderUpdate }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [updatedQuantity, setUpdatedQuantity] = useState(order.quantity || 1);

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Pending' },
    confirmed: { icon: Check, color: 'text-indigo-500', bg: 'bg-indigo-100', label: 'Confirmed' },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Cancelled' },
  };

  const StatusIcon = statusConfig[order.estimated_status]?.icon || Clock;
  const statusColor = statusConfig[order.estimated_status]?.color || 'text-yellow-500';
  const statusBg = statusConfig[order.estimated_status]?.bg || 'bg-yellow-100';
  const statusLabel = statusConfig[order.estimated_status]?.label || 'Pending';

  const outletName = order.outlet?.name || order.outlet_name;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'http://localhost:5555/uploads/default-food.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `http://localhost:5555${imagePath}`;
    return `http://localhost:5555/uploads/${imagePath}`;
  };

  const firstItemImage = order.items?.[0]?.image || order.items?.[0]?.image_path;
  const imageSrc = getImageUrl(firstItemImage);

  const orderTime = order.created_at
    ? new Date(order.created_at).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    })
    : 'Recently';

  // Owner: Confirm / Complete order
  const handleOwnerAction = async (newStatus) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      // Replace with your actual API call
      const response = await fetch(`http://localhost:5555/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      // Success
      showToast(`Order marked as ${newStatus}!`, 'success');

      // Here you would normally update local state or trigger refetch
      // For demo: simulate state update
      // order.estimated_status = newStatus; // but better to refetch parent
    } catch (err) {
      console.error(err);
      showToast('Failed to update order', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Update local state when order prop changes
  useEffect(() => {
    setUpdatedQuantity(order.quantity || 1);
  }, [order.quantity]);

  // Handle any status update
  const handleStatusUpdate = async (newStatus, data = {}) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`http://localhost:5555/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status: newStatus, ...data }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      const updatedOrder = await response.json();
      showToast(`Order ${newStatus === 'cancelled' ? 'cancelled' : 'updated'} successfully!`, 'success');

      // Call parent callback to update state without refresh
      if (onOrderUpdate) {
        onOrderUpdate(updatedOrder);
      }

      // Close modal if open
      setShowUpdateModal(false);

    } catch (err) {
      console.error(err);
      showToast('Failed to update order', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Update order quantity
  const handleUpdateOrder = async () => {
    if (updatedQuantity === order.quantity) {
      setShowUpdateModal(false);
      return;
    }

    await handleStatusUpdate(order.estimated_status, { quantity: updatedQuantity });
  };

  // Cancel order
  const handleCancelOrder = async () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    setShowCancelModal(false);
    await handleStatusUpdate('cancelled');
  };

  // Mark as received
  const handleMarkReceived = async () => {
    await handleStatusUpdate('completed');
  };

  const handleReorder = () => {
    if (!order?.items?.length) {
      showToast("No items to reorder", "error");
      return;
    }

    order.items.forEach((item) => {
      let compositeKey;

      if (item.menu_outlet_item_id) {
        compositeKey = String(item.menu_outlet_item_id);
      } else {
        const outletId = String(
          item.outlet_id ||
          order.outlet_id ||
          order.outlet?.id ||
          'unknown'
        );

        // Keep original case + trim only (no lowercase)
        const itemName = String(
          item.item_name ||
          item.name ||
          'unknown-item'
        ).trim();

        compositeKey = `${outletId}-${itemName}`;
      }

      console.log('[Reorder] Using original-case key:', compositeKey, 'qty:', item.quantity || 1);

      addToCart(compositeKey, item.quantity || 1);
    });

    showToast("Items added to your cart – review & checkout", "success");
    router.push('/cart');
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
                alt={order.items?.[0]?.name || outletName}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => (e.target.src = '/default-food.jpg')}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top row: status + price */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`px-2.5 py-1 rounded-full ${statusBg} flex items-center gap-1.5 text-xs font-medium`}
                  >
                    <StatusIcon className={`w-3.5 h-3.5 ${statusColor}`} />
                    <span>{statusLabel}</span>
                  </div>
                  <span className="text-xs text-gray-500">{orderTime}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-base">
                  {isOwner ? `Order #${order.id}` : outletName}
                </h3>
              </div>

              <p className="text-xl font-bold text-gray-900 sm:text-right">
                Ksh {order.total?.toFixed(2) || '0.00'}
              </p>
            </div>

            {/* Items summary */}
            <div className="mb-3">
              <div className="space-y-1 text-sm">
                {order.items?.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium text-gray-500">{item.quantity}x</span>
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
                {order.items?.length > 2 && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5" />
                    +{order.items.length - 2} more items
                  </div>
                )}
              </div>
            </div>

            {/* Table Booking */}
            {order.table_booking && (
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-indigo-800 font-medium">
                  <Users className="w-4 h-4" />
                  <span>Table Booking</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-indigo-700">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-indigo-600" />
                    <span>Table <strong>{order.table_booking.table_number}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>For <strong>{order.table_booking.capacity}</strong> people</span>
                  </div>
                  {order.table_booking.duration && (
                    <div className="col-span-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Duration: <strong>{order.table_booking.duration}</strong></span>
                    </div>
                  )}
                  {order.table_booking.created_at && (
                    <div className="col-span-2 flex items-center gap-2 text-xs text-indigo-600">
                      <Calendar className="w-4 h-4" />
                      <span>Booked: {new Date(order.table_booking.created_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              {/* Owner actions */}
              {isOwner && (
                <>
                  {order.estimated_status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isUpdating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                    >
                      {isUpdating ? 'Confirming...' : 'Confirm Order'}
                    </button>
                  )}

                  {order.estimated_status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isUpdating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                      {isUpdating ? 'Completing...' : 'Mark as Completed'}
                    </button>
                  )}
                </>
              )}

              {/* Customer actions */}
              {!isOwner && (
                <div className="flex flex-wrap gap-2">
                  {/* Update Order - only if pending */}
                  {order.estimated_status === 'pending' && (
                    <button
                      onClick={() => setShowUpdateModal(true)}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                    >
                      Update Order
                    </button>
                  )}

                  {/* Cancel Order - only if pending */}
                  {order.estimated_status === 'pending' && (
                    <button
                      onClick={handleCancelOrder}
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isUpdating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                    >
                      {isUpdating ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}

                  {/* Mark as Received - only if confirmed */}
                  {order.estimated_status === 'confirmed' && (
                    <button
                      onClick={handleMarkReceived}
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isUpdating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                    >
                      {isUpdating ? 'Updating...' : 'Mark as Received'}
                    </button>
                  )}

                  {/* Reorder - only for completed/cancelled (history) */}
                  {['completed', 'cancelled'].includes(order.estimated_status) && (
                    <button onClick={handleReorder} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      Reorder
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Order Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Update Order Quantity</h2>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item: {order.items?.[0]?.name || 'Order Item'}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setUpdatedQuantity(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold">{updatedQuantity}</span>
                  <button
                    onClick={() => setUpdatedQuantity(prev => prev + 1)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  New Total: Ksh {(order.items?.[0]?.price * updatedQuantity).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateOrder}
                  disabled={isUpdating}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium ${isUpdating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                >
                  {isUpdating ? 'Updating...' : 'Update Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
            {/* Close button */}
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancel Order?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this order?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                disabled={isUpdating}
                className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors ${isUpdating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {isUpdating ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}