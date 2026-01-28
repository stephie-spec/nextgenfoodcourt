import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerHeader({ stats }) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="bg-primary text-white">
      <div className="container py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
          <div>
            <h1 className="h2 mb-2">
              Welcome back, <span className="text-warning">{user?.name || "Food Lover"}!</span>
            </h1>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-light text-dark">
                <i className="bi bi-receipt me-1"></i> {stats.totalOrders} Orders
              </span>
              <span className="badge bg-light text-dark">
                <i className="bi bi-star-fill me-1"></i> Favorite: {stats.favoriteOutlet}
              </span>
              <span className="badge bg-light text-dark">
                <i className="bi bi-wallet2 me-1"></i> Spent: {stats.totalSpent}
              </span>
            </div>
          </div>
          
          <div className="mt-3 mt-md-0">
            <div className="btn-group">
              <button className="btn btn-light active">
                <i className="bi bi-shop me-1"></i> Outlets
              </button>
              <button 
                className="btn btn-outline-light"
                onClick={() => router.push("/customer/my_orders")}
              >
                <i className="bi bi-receipt me-1"></i> My Orders
              </button>
              <button 
                className="btn btn-outline-light"
                onClick={() => router.push("/customer/profile")}
              >
                <i className="bi bi-person me-1"></i> Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}