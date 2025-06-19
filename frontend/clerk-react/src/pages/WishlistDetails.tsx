import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useAuth } from '@clerk/clerk-react';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, MapPin, Globe } from "lucide-react";

interface Place {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  country: string;
  location?: {
    lat: number;
    lng: number;
  };
  reviews?: any[];
}

export default function WishlistDetails() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { getToken, isSignedIn } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get placeId from URL params
  const placeId = params.id;

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!isSignedIn || !placeId) return;

      try {
        setLoading(true);
        const token = await getToken();

        // Fetch all places from myplan and find the one we need
        const response = await fetch('http://localhost:5000/api/myplan', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch place details');
        }

        const data = await response.json();
        const foundPlace = data.plans?.find((p: Place) => p.placeId === placeId);

        if (foundPlace) {
          setPlace(foundPlace);
        } else {
          setError('Place not found in your wishlist');
        }
      } catch (err) {
        console.error('Error fetching place details:', err);
        setError('Failed to load place details');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [isSignedIn, placeId, getToken]);

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

  if (!place || error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-slate-600">Place details not found.</p>
            <Button onClick={() => setLocation('/wishlist')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wishlist
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const {
    name,
    address,
    rating,
    userRatingsTotal,
    location: placeLocation,
    reviews = [],
    country,
  } = place;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => setLocation('/wishlist')}
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wishlist
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{name}</h1>
          <div className="flex items-center gap-4 text-slate-600 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{rating} ({userRatingsTotal} reviews)</span>
            </div>
            {country && (
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>{country}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            {placeLocation?.lat && placeLocation?.lng && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <iframe
                    src={`https://maps.google.com/maps?q=${placeLocation.lat},${placeLocation.lng}&z=15&output=embed`}
                    width="100%"
                    height="300px"
                    style={{ borderRadius: '0 0 12px 12px' }}
                    loading="lazy"
                  />
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No reviews available.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review: any, index: number) => (
                      <div key={index}>
                        {index > 0 && <Separator />}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {review.author_name || review.author || 'Anonymous'}
                            </span>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {review.rating}
                            </Badge>
                          </div>
                          <p className="text-slate-600">
                            {review.text || 'No review text available.'}
                          </p>
                          {review.relative_time_description && (
                            <p className="text-xs text-slate-500">{review.relative_time_description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Place Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{rating}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Reviews</span>
                  <span>{userRatingsTotal}</span>
                </div>
                {country && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Country</span>
                    <span>{country}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Status</span>
                  <Badge variant="secondary">Saved</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setLocation('/explore')}
                  variant="outline" 
                  className="w-full"
                >
                  Find Similar Places
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}