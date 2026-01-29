export default function OutletCard({ outlet }) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="font-bold text-lg">{outlet.name}</h3>
      <p className="text-gray-600">{outlet.category}</p>
      <div className="mt-4">
        <span className={`px-3 py-1 rounded-full text-sm ${
          outlet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {outlet.status}
        </span>
      </div>
    </div>
  );
}