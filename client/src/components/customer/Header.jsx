import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { FaReceipt, FaStar, FaWallet, FaStore, FaUser } from "react-icons/fa";

export default function CustomerHeader({ stats }) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, <span className="text-yellow-300">{user?.name || "Food Lover"}!</span>
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
                <FaReceipt className="mr-2" />
                {stats.totalOrders} Orders
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
                <FaStar className="mr-2" />
                Favorite: {stats.favoriteOutlet}
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
                <FaWallet className="mr-2" />
                Spent: {stats.totalSpent}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-white/30 rounded-lg font-medium hover:bg-white/40 transition-colors flex items-center">
              <FaStore className="mr-2" />
              Outlets
            </button>
            <button 
              className="px-4 py-2 border border-white/30 rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center"
              onClick={() => router.push("/customer/my_orders")}
            >
              <FaReceipt className="mr-2" />
              My Orders
            </button>
            <button 
              className="px-4 py-2 border border-white/30 rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center"
              onClick={() => router.push("/customer/profile")}
            >
              <FaUser className="mr-2" />
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}