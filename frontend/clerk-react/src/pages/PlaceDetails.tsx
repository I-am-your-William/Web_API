import { useLocation, useParams, useRouter } from 'wouter';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '@/lib/api';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, MapPin, Heart, Phone, Mail, User } from "lucide-react";

export default function PlaceDetails() {
  const [locationHook, setLocation] = useLocation();
  const params = useParams();
  const placeId = params.id;

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [countryInput, setCountryInput] = useState('');
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, getToken } = useAuth();

  // Load place data if not passed in state
  useEffect(() => {
    // Check if place data was passed via history state
    const statePlace = (window.history.state as any)?.place;
    if (statePlace) {
      console.log('🏢 Using place from navigation state:', statePlace.name);
      setPlace(statePlace);
      setLoading(false);
      return;
    }

    // If no place data and no placeId, we can't show anything
    if (!placeId) {
      setError('Place ID is required');
      setLoading(false);
      return;
    }
    
    console.log('🔍 No place data found, fetching details for placeId:', placeId);
    // Fetch place details using the specific place ID endpoint
    fetch(`${API_BASE_URL}/api/places/details/${encodeURIComponent(placeId)}`)
      .then(response => {
        console.log('📡 Place details API response status:', response.status);
        if (!response.ok) throw new Error('Place not found');
        return response.json();
      })
      .then(data => {
        console.log('📍 Place details result:', data);
        if (data.place) {
          console.log('✅ Found place:', data.place.name);
          setPlace(data.place);
        } else {
          setError('Place not found');
        }
      })
      .catch(err => {
        console.error('❌ Failed to load place details:', err);
        setError('Failed to load place details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [placeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading place details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-slate-600">{error || 'Place details not found.'}</p>
            <Button onClick={() => setLocation('/explore')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const toggleReviews = () => {
    setShowAllReviews((prev) => !prev);
  };

  const handleSaveToWishlist = async () => {
    if (isSaved) return;

    if (!countryInput.trim()) {
      alert('Please enter the country of this place.');
      return;
    }

    try {
      if (!isSignedIn) {
        alert('Please log in to save to wishlist.');
        return;
      }

      const token = await getToken();

      const response = await fetch(`${API_BASE_URL}/api/myplan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: place.name,
          address: place.formatted_address || place.address || '',
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total || place.userRatingsTotal || 0,
          location: {
            lat: place.geometry?.location?.lat || place.location?.lat,
            lng: place.geometry?.location?.lng || place.location?.lng,
          },
          reviews: place.reviews || [],
          placeId: place.place_id || place.placeId,
          country: countryInput.trim(),
        }),
      });

      const responseText = await response.text();
      console.log('Server responded with:', response.status, responseText);

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setIsSaved(true);
      alert(`${place.name} added to your wishlist!`);
      setLocation('/wishlist');
    } catch (error) {
      console.error('Error saving to wishlist:', error);
      alert('Failed to save to wishlist.');
    }
  };

  const handleBack = () => {
    setLocation('/explore');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={handleBack} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{place.name}</h1>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{place.formatted_address || place.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{place.rating} ({place.user_ratings_total || place.userRatingsTotal} reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <Card>
              <CardContent className="p-0">
                <iframe
                  src={`https://maps.google.com/maps?q=${place.geometry?.location?.lat || place.location?.lat},${place.geometry?.location?.lng || place.location?.lng}&z=15&output=embed`}
                  width="100%"
                  height="300px"
                  style={{ borderRadius: '12px' }}
                  loading="lazy"
                />
              </CardContent>
            </Card>

            {/* Reviews */}
            {place.reviews && place.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(showAllReviews ? place.reviews : place.reviews.slice(0, 2)).map((review: any, idx: number) => (
                    <div key={idx}>
                      {idx > 0 && <Separator />}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{review.author_name || review.author}</span>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {review.rating}
                          </Badge>
                        </div>
                        <p className="text-slate-600">{review.text}</p>
                        <p className="text-xs text-slate-500">{review.relative_time_description || review.time}</p>
                      </div>
                    </div>
                  ))}
                  {place.reviews.length > 2 && (
                    <Button
                      onClick={toggleReviews}
                      variant="outline"
                      className="w-full"
                    >
                      {showAllReviews ? 'Show Less Reviews' : 'Show More Reviews'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Save to Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Country
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter country of this place"
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSaveToWishlist}
                  disabled={isSaved}
                  className="w-full"
                  variant={isSaved ? "secondary" : "default"}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {isSaved ? 'Added to Wishlist' : 'Add to Wishlist'}
                </Button>
              </CardContent>
            </Card>

            {/* Place Info */}
            <Card>
              <CardHeader>
                <CardTitle>Place Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{place.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Reviews</span>
                  <span>{place.user_ratings_total || place.userRatingsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Place ID</span>
                  <span className="text-xs font-mono">{place.place_id || place.placeId}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}