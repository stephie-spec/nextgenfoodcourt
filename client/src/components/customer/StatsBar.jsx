export default function StatsBar({ outlets }) {
  const openOutlets = outlets.filter(o => o.isOpen).length;
  const offersCount = outlets.filter(o => o.specialOffer).length;
  
  const stats = [
    { 
      label: "Outlets", 
      value: outlets.length, 
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      label: "Open Now", 
      value: openOutlets, 
      color: "text-green-600",
      bg: "bg-green-50"
    },
    { 
      label: "Offers", 
      value: offersCount, 
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    },
    { 
      label: "Avg Rating", 
      value: "4.5+", 
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`${stat.bg} rounded-xl p-4 text-center border`}
          >
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}