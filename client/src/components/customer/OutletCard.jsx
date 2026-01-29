import { useRouter } from "next/router";
import { FaStar, FaClock, FaPercent } from "react-icons/fa";

export default function OutletCard({ outlet, isFavorite, onToggleFavorite }) {
  const router = useRouter();

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex align-items-center">
              <span className="display-4 me-3">{outlet.image}</span>
              <div>
                <h5 className="card-title mb-1">{outlet.name}</h5>
                <span className="badge bg-primary">{outlet.category_name}</span>
              </div>
            </div>
            <button 
              className={`btn btn-sm ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => onToggleFavorite(outlet.id)}
            >
              <FaStar />
            </button>
          </div>
        </div>
        
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <span className="text-warning me-1">
                <FaStar />
              </span>
              <strong>{outlet.rating}</strong>
              <span className="text-muted ms-1">({outlet.reviewCount})</span>
            </div>
            <div className="d-flex align-items-center text-info">
              <FaClock className="me-1" />
              <span>{outlet.delivery_time}</span>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-1">
              {outlet.tags.map((tag, index) => (
                <span key={index} className="badge bg-light text-dark border">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="mb-2">
              <i className="bi bi-geo-alt me-1"></i>
              {outlet.location}
            </div>
            <div className="d-flex justify-content-between">
              <span>
                <i className="bi bi-clock me-1"></i>
                {outlet.opening_time} - {outlet.closing_time}
              </span>
              <span className="text-primary">
                <i className="bi bi-truck me-1"></i>
                {outlet.deliveryFee}
              </span>
            </div>
          </div>
          
          <div className="d-grid gap-2">
            <button 
              className="btn btn-primary"
              onClick={() => router.push(`/customer/menu?outlet=${outlet.id}`)}
              disabled={!outlet.isOpen}
            >
              {outlet.isOpen ? (
                <>
                  <i className="bi bi-cart-plus me-1"></i> Order Now
                </>
              ) : "Currently Closed"}
            </button>
            <div className="btn-group">
              <button className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-eye me-1"></i> View Menu
              </button>
              <button className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-share me-1"></i> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}