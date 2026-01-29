import { useRouter } from "next/router";
import { FaStar, FaClock, FaMapMarkerAlt, FaTruck, FaEye, FaShareAlt, FaShoppingCart } from "react-icons/fa";
import { IoTime } from "react-icons/io5";

export default function OutletCard({ outlet, isFavorite, onToggleFavorite }) {
  const router = useRouter();

  return (
    <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-6">
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mr-3">
                <span className="text-2xl">{outlet.image || " "}</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{outlet.name}</h3>
                <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {outlet.category_name}
                </span>
              </div>
            </div>
            <button 
              className={`p-2 rounded-full ${isFavorite ? 'bg-yellow-100 text-yellow-600' : 'bg-muted text-muted-foreground hover:bg-yellow-50'}`}
              onClick={() => onToggleFavorite(outlet.id)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FaStar className={isFavorite ? "fill-yellow-500" : ""} />
            </button>
          </div>
        </div>
        
        <div className="p-4 flex-grow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">
                <FaStar />
              </span>
              <span className="font-semibold">{outlet.rating}</span>
              <span className="text-muted-foreground text-sm ml-1">({outlet.reviewCount})</span>
            </div>
            <div className="flex items-center text-blue-500">
              <FaClock className="mr-1" />
              <span className="text-sm font-medium">{outlet.delivery_time}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {outlet.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full border">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-6 space-y-2">
            <div className="flex items-center text-sm">
              <FaMapMarkerAlt className="mr-2 text-muted-foreground" />
              <span>{outlet.location}</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <IoTime className="mr-2 text-muted-foreground" />
                <span>{outlet.opening_time} - {outlet.closing_time}</span>
              </div>
              <div className="flex items-center text-primary">
                <FaTruck className="mr-2" />
                <span className="font-medium">{outlet.deliveryFee}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={() => router.push(`/customer/menu?outlet=${outlet.id}`)}
              disabled={!outlet.isOpen}
            >
              {outlet.isOpen ? (
                <>
                  <FaShoppingCart className="mr-2" />
                  Order Now
                </>
              ) : "Currently Closed"}
            </button>
            <div className="flex gap-2">
              <button className="flex-1 border border-input bg-background py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center">
                <FaEye className="mr-2" />
                View Menu
              </button>
              <button className="flex-1 border border-input bg-background py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center">
                <FaShareAlt className="mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}