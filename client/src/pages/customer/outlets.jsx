import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";

import CustomerHeader from "@/components/customer/Header";
import StatsBar from "@/components/customer/StatsBar";
import SearchBar from "@/components/customer/SearchBar";
import CategoryFilter from "@/components/customer/CategoryFilter";
import SpecialOffer from "@/components/customer/SpecialOffer";
import OutletCard from "@/components/customer/OutletCard";
import { FaFrown } from "react-icons/fa";

export default function CustomerOutlets() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const sampleOutlets = [
    { 
      id: 1, 
      name: "Burger Paradise", 
      category_name: "Fast Food", 
      location: "Food Court Level 1",
      opening_time: "10:00",
      closing_time: "22:00",
      rating: 4.5,
      reviewCount: 245,
      delivery_time: "20-30 min",
      image: "🍔",
      isOpen: true,
      specialOffer: "20% OFF",
      minOrder: "Ksh 199",
      deliveryFee: "Ksh 40",
      tags: ["Burgers", "Shakes", "Fries"]
    },
    { 
      id: 2, 
      name: "Mozzie Pizzeria", 
      category_name: "Italian", 
      location: "Food Court Level 1",
      opening_time: "11:00",
      closing_time: "23:00",
      rating: 4.7,
      reviewCount: 189,
      delivery_time: "25-35 min",
      image: "🍕",
      isOpen: true,
      specialOffer: "Buy 1 Get 1 Free",
      minOrder: "299",
      deliveryFee: "Ksh 50",
      tags: ["Pizza", "Pasta"]
    },
    { 
      id: 3, 
      name: "Noodle Frenzy", 
      category_name: "Chinese", 
      location: "Food Court Level 2",
      opening_time: "10:30",
      closing_time: "22:30",
      rating: 4.3,
      reviewCount: 167,
      delivery_time: "15-25 min",
      image: "🍜",
      isOpen: true,
      specialOffer: null,
      minOrder: "Ksh 249",
      deliveryFee: "Ksh 35",
      tags: ["Noodles", "Rice"]
    }
  ];

  const categories = ["All", "Fast Food", "Italian", "Chinese", "Vegan", "Ethiopian"];
  const customerStats = {
    totalOrders: 24,
    favoriteOutlet: "Burger Paradise",
    totalSpent: "Ksh 8,540"
  };

  // State
  const [outlets] = useState(sampleOutlets);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([1, 3]);
  const [loading, setLoading] = useState(true);

  // Initialize
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    
    if (user && user.role !== "customer") {
      router.push("/owner/outlets");
      return;
    }

    setLoading(false);
  }, [user, authLoading, router]);

  const filteredOutlets = selectedCategory === "All" 
    ? outlets 
    : outlets.filter(outlet => outlet.category_name === selectedCategory);

  const searchedOutlets = searchQuery 
    ? filteredOutlets.filter(outlet => 
        outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outlet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : filteredOutlets;

  const toggleFavorite = (outletId) => {
    if (favorites.includes(outletId)) {
      setFavorites(favorites.filter(id => id !== outletId));
    } else {
      setFavorites([...favorites, outletId]);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <CustomerHeader stats={customerStats} />

      <StatsBar outlets={outlets} />

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <SpecialOffer />

      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap -mx-2">
            {searchedOutlets.length > 0 ? (
              searchedOutlets.map(outlet => (
                <OutletCard
                  key={outlet.id}
                  outlet={outlet}
                  isFavorite={favorites.includes(outlet.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))
            ) : (
              <div className="w-full text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <FaFrown className="text-6xl mx-auto opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-muted-foreground mb-4">No outlets found</h3>
                <button 
                  className="px-6 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Show All Outlets
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2026 Food Court. Enjoy your meal!
          </p>
        </div>
      </footer>
    </Layout>
  );
}