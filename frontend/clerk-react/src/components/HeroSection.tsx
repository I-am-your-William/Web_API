import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plane } from "lucide-react";
import { useLocation } from "wouter";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFlightSearch = () => {
    setLocation('/flight');
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/10 to-orange-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
            Discover Your Next <span className="text-primary">Adventure</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore amazing destinations and create unforgettable travel experiences. Create memories that last a lifetime.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 animate-slide-up">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Where do you want to go?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 text-lg border-slate-200 focus-visible:ring-primary"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleFlightSearch}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              <Plane className="w-5 h-5 mr-2" />
              Search Flights
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}