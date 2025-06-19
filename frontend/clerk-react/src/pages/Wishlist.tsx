import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useLocation } from 'wouter';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Star, MapPin, Trash2 } from "lucide-react";

interface Place {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  country: string;
}

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<Place[]>([]);
  const [filteredWishlist, setFilteredWishlist] = useState<Place[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [countries, setCountries] = useState<string[]>([]);
  const { getToken, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isSignedIn) {
        console.log('User not signed in, skipping wishlist fetch');
        return;
      }

      try {
        console.log('Fetching wishlist data...');
        const token = await getToken();
        console.log('Got token:', token ? 'Token exists' : 'No token');

        const response = await fetch('http://localhost:5000/api/myplan', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to fetch wishlist: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data);
        const allPlans: Place[] = data.plans || [];
        console.log('All plans:', allPlans);
        setWishlist(allPlans);

        const uniqueCountries = Array.from(new Set(allPlans.map((p: Place) => p.country).filter(Boolean)));
        setCountries(['All', ...uniqueCountries]);
        setFilteredWishlist(allPlans);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      }
    };

    fetchWishlist();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (selectedCountry === 'All') {
      setFilteredWishlist(wishlist);
    } else {
      setFilteredWishlist(wishlist.filter((p: Place) => p.country === selectedCountry));
    }
  }, [selectedCountry, wishlist]);

  const handleViewDetails = (place: Place) => {
    if (!place || !place.placeId) return;
    setLocation(`/wishlist-details/${place.placeId}`, { state: { place } });
  };

  const handleRemove = async (placeId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this place from your wishlist?');
    if (!confirmDelete) return;

    try {
      const token = await getToken();
      await fetch(`http://localhost:5000/api/myplan/${placeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedList = wishlist.filter((p: Place) => p.placeId !== placeId);
      setWishlist(updatedList);
    } catch (err) {
      console.error('Failed to delete place from wishlist:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            My Wishlist
          </h1>
          <p className="text-xl text-slate-600">Your saved places and dream destinations</p>
        </div>

        {/* Filter Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <label htmlFor="country-filter" className="text-sm font-medium text-slate-700">
                Filter by country:
              </label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country, idx) => (
                    <SelectItem key={idx} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Grid */}
        {filteredWishlist.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Your wishlist is empty</h3>
              <p className="text-slate-600 mb-6">Start saving places from the Search tab!</p>
              <Button onClick={() => setLocation('/explore')} className="bg-primary hover:bg-primary/90">
                Explore Places
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWishlist.map((place: Place) => {
              const {
                placeId = '',
                name = 'Unknown Place',
                address = 'No address',
                rating = 0,
                userRatingsTotal = 0,
                country = 'Unknown',
              } = place;

              return (
                <Card key={placeId} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(placeId)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <CardTitle className="text-lg text-primary pr-8">{name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{address}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {rating}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {userRatingsTotal} reviews
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-600">
                        🌍 {country}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleViewDetails(place)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}