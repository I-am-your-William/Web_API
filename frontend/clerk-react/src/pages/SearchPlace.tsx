import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useUser } from '@clerk/clerk-react';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star } from "lucide-react";

interface Review {
  author: string;
  text: string;
  rating: number;
  time: string;
}

interface Place {
  name: string;
  rating: number;
  userRatingsTotal: number;
  address: string;
  placeId: string;
  location: {
    lat: number;
    lng: number;
  };
  reviews: Review[];
}

export default function SearchPlace() {
  const [location, setLocation] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 3.139, lng: 101.6869 });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [, setRoute] = useLocation();
  const mapRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    // Try geolocation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => console.warn('Geolocation not allowed or failed.')
    );
  }, []);

  const fetchPlaces = async () => {
    if (!location.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/places?location=${encodeURIComponent(location)}`);
      if (response.ok) {
        const data = await response.json();
        setPlaces(data.places || []);
        if (data.places && data.places.length > 0) {
          const first = data.places[0];
          setMapCenter(first.location);
          setSelectedPlace(first);
          updateMap(first.location);
        }
      } else {
        console.warn('Places API not available, showing demo data');
        // Only use demo data if API is not available
        const demoPlaces: Place[] = [
          {
            name: "Kuala Lumpur Tower",
            rating: 4.2,
            userRatingsTotal: 1532,
            address: "No. 2, Jalan Punchak, Off, Jalan P. Ramlee, 50250 Kuala Lumpur",
            placeId: "ChIJzwzA0PrHzDERRGAiNtf3YJo",
            location: { lat: 3.1527, lng: 101.7030 },
            reviews: [
              { author: "John Doe", text: "Amazing view of the city!", rating: 5, time: "2 weeks ago" },
              { author: "Jane Smith", text: "Great experience, worth visiting", rating: 4, time: "1 month ago" }
            ]
          }
        ];
        setPlaces(demoPlaces);
      }
    } catch (err) {
      console.error('Failed to fetch places', err);
    } finally {
      setLoading(false);
    }
  };

  const updateMap = (center: { lat: number; lng: number }) => {
    const mapUrl = `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=15&output=embed`;
    if (mapRef.current) {
      mapRef.current.src = mapUrl;
    }
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setMapCenter(place.location);
    updateMap(place.location);
  };

  const goToDetails = (place: Place) => {
    setRoute(`/details/${place.placeId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Explore Amazing Places</h1>
          <p className="text-xl text-slate-600">Discover beautiful destinations around the world</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter city or place name"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchPlaces()}
                  className="w-full px-4 py-3 text-lg border-slate-200 focus-visible:ring-primary"
                />
              </div>
              <Button 
                onClick={fetchPlaces}
                disabled={loading}
                className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                <Search className="w-5 h-5 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-300px)]">
          {/* Map */}
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <iframe
                ref={mapRef}
                width="100%"
                height="100%"
                style={{ borderRadius: '12px' }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=15&output=embed`}
              />
            </CardContent>
          </Card>

          {/* Places List */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {places.length > 0 ? `Found ${places.length} places` : 'Search Results'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full overflow-y-auto">
              {places.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No places found. Try searching for a city or landmark.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {places.map((place) => (
                    <Card
                      key={place.placeId}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPlace?.placeId === place.placeId ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handlePlaceClick(place)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-slate-900 text-lg">{place.name}</h3>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {place.rating}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-sm mb-2 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {place.address}
                        </p>
                        <p className="text-slate-500 text-xs mb-3">
                          {place.userRatingsTotal} reviews
                        </p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToDetails(place);
                          }}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}