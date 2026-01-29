export default function OrderCard({ order }) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold">Order #{order.id}</h3>
          <p className="text-sm text-gray-600">{order.date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          order.status === 'completed' ? 'bg-green-100 text-green-800' :
          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status}
        </span>
      </div>
      <p className="mt-2">Total: ${order.total}</p>
    </div>
  );
}