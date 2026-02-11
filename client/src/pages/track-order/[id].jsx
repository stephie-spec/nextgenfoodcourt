import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import { Clock, Package, CheckCircle2, Truck, AlertCircle, CreditCard, MapPin, Receipt } from 'lucide-react';

export default function TrackOrder() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5555/api/orders/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error('Failed to fetch order');
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Status progression mapping
  const statusSteps = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'preparing', label: 'Preparing', icon: Package },
    { key: 'ready', label: 'Ready', icon: CheckCircle2 },
    { key: 'completed', label: 'Completed', icon: Truck }
  ];

  const getStatusIndex = (status) => {
    const index = statusSteps.findIndex(step => step.key === status?.toLowerCase());
    return index !== -1 ? index : 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      preparing: 'bg-blue-500',
      ready: 'bg-green-500',
      completed: 'bg-purple-500'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-500';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      preparing: 'bg-blue-100 text-blue-800 border-blue-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const calculateEstimatedTime = (createdAt, status) => {
    if (status === 'completed') {
      return 'Delivered';
    }
    
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - created) / (1000 * 60));
    
    // Estimated times based on status
    const estimations = {
      pending: 5,
      preparing: 15,
      ready: 5,
    };
    
    const totalEstimatedMinutes = estimations[status?.toLowerCase()] || 10;
    const remainingMinutes = Math.max(0, totalEstimatedMinutes - diffMinutes);
    
    if (remainingMinutes === 0) {
      return 'Almost ready!';
    }
    
    return `~${remainingMinutes} minutes`;
  };

  // Payment status (derived from order status for now)
  const getPaymentStatus = (orderStatus) => {
    return orderStatus === 'completed' ? 'Paid' : 'Pending';
  };

  // Table number (check if order has table_booking)
  const hasTableBooking = (order) => {
    return order?.table_number || null;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/dashboard/customer')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              View All Orders
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!order) return null;

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <Receipt className="h-8 w-8 text-orange-500" />
                  Order #{order.id}
                </h1>
                <p className="text-gray-500 mt-1">
                  Placed on {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full border-2 font-semibold ${getStatusBadgeColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>

            {/* Estimated Time */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Estimated Time</p>
                <p className="text-xl font-bold text-orange-600">
                  {calculateEstimatedTime(order.created_at, order.status)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package className="h-6 w-6 text-orange-500" />
              Order Progress
            </h2>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 h-full w-1 bg-gray-200">
                <div 
                  className="bg-orange-500 transition-all duration-500 w-full"
                  style={{ 
                    height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` 
                  }}
                />
              </div>

              {/* Status Steps */}
              <div className="space-y-8 relative">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className={`
                        relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                        transition-all duration-300 border-4 border-white shadow-lg
                        ${isCompleted ? getStatusColor(step.key) : 'bg-gray-300'}
                        ${isCurrent ? 'scale-110 ring-4 ring-orange-200' : ''}
                      `}>
                        <Icon className={`h-6 w-6 ${isCompleted ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className={`text-lg font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.label}
                        </h3>
                        {isCurrent && (
                          <p className="text-sm text-orange-600 font-medium mt-1">
                            Current Status
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Receipt className="h-6 w-6 text-orange-500" />
              Order Summary
            </h2>
            
            <div className="space-y-4">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <img 
                    src={`http://localhost:5555/uploads/${item.image_path?.replace(/^\/+/, '')}`}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80?text=Food';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">KES {item.price}</p>
                  </div>
                </div>
              ))}

              {/* Outlet Info */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">Outlet:</span>
                  <span>{order.outlet_name}</span>
                  {order.outlet_category && (
                    <span className="text-sm text-gray-500">({order.outlet_category})</span>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-orange-600">KES {order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Table Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Payment Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-orange-500" />
                Payment Status
              </h2>
              <div className={`
                p-4 rounded-xl border-2 font-semibold text-center
                ${getPaymentStatus(order.status) === 'Paid' 
                  ? 'bg-green-50 text-green-700 border-green-300' 
                  : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                }
              `}>
                {getPaymentStatus(order.status)}
              </div>
            </div>

            {/* Table Number (if dine-in) */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-orange-500" />
                Table Information
              </h2>
              {hasTableBooking(order) ? (
                <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-300 text-center">
                  <p className="text-sm text-gray-600">Table Number</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">
                    {order.table_number}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 border-2 border-gray-300 text-center text-gray-500">
                  Takeaway Order
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard/customer')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              View All Orders
            </button>
            <button
              onClick={fetchOrder}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold flex items-center gap-2"
            >
              <Clock className="h-5 w-5" />
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
