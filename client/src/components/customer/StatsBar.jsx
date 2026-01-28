export default function StatsBar({ outlets }) {
  const openOutlets = outlets.filter(o => o.isOpen).length;
  const offersCount = outlets.filter(o => o.specialOffer).length;

  return (
    <div className="container py-3">
      <div className="row g-2">
        <div className="col-6 col-md-3">
          <div className="card text-center py-2">
            <div className="h4 mb-0 text-primary">{outlets.length}</div>
            <small className="text-muted">Outlets</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center py-2">
            <div className="h4 mb-0 text-success">{openOutlets}</div>
            <small className="text-muted">Open Now</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center py-2">
            <div className="h4 mb-0 text-warning">{offersCount}</div>
            <small className="text-muted">Offers</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center py-2">
            <div className="h4 mb-0 text-info">4.5+</div>
            <small className="text-muted">Avg Rating</small>
          </div>
        </div>
      </div>
    </div>
  );
}