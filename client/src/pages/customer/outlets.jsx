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
      image: "",
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
      image: "",
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
      image: "",
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
      <div className="container text-center mt-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
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

      <div className="container py-4">
        <div className="row">
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
            <div className="col-12 text-center py-5">
              <div className="text-muted mb-3">
                <i className="bi bi-emoji-frown display-1"></i>
              </div>
              <h3 className="text-muted">No outlets found</h3>
              <button 
                className="btn btn-outline-primary mt-3"
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

      <footer className="bg-light py-4 mt-4 border-top">
        <div className="container text-center">
          <p className="mb-0 text-muted">
            © 2024 Food Court. Enjoy your meal!
          </p>
        </div>
      </footer>
    </Layout>
  );
}