import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SearchPlace from "./SearchPlace";
import Wishlist from "./Wishlist";

export default function MyPlan() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("search");

  useEffect(() => {
    if (location.state?.showWishlist) {
      setActiveTab("wishlist");
    }
  }, [location.state]);

  return (
    <div>
      <h2>My Plan</h2>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => setActiveTab("search")}>Search</button>
        <button onClick={() => setActiveTab("wishlist")}>Wishlist</button>
      </div>
      {activeTab === "search" ? <SearchPlace /> : <Wishlist />}
    </div>
  );
}
