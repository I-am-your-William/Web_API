import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { API_BASE_URL } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Heart, User, ArrowLeft } from "lucide-react";

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

interface PlaceDetailsModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
}

function PlaceDetailsModal({ place, isOpen, onClose }: PlaceDetailsModalProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!place || !isOpen) return;

    // If we already have detailed place data, use it
    if (place.reviews && place.location) {
      setPlaceDetails(place);
      return;
    }

    // Otherwise, fetch place details from API
    setLoading(true);
    fetch(`${API_BASE_URL}/api/places/details/${place.placeId}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch place details');
        return response.json();
      })
      .then(data => {
        // The API returns { place: {...} }
        setPlaceDetails({ ...place, ...data.place });
      })
      .catch(err => {
        console.error('Failed to load place details:', err);
        // Use the basic place data we have
        setPlaceDetails(place);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [place, isOpen]);

  if (!place) return null;

  const displayPlace = placeDetails || place;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{displayPlace.name}</DialogTitle>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{displayPlace.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{displayPlace.rating} ({displayPlace.userRatingsTotal} reviews)</span>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-600">Loading place details...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Map */}
            {displayPlace.location && (
              <Card>
                <CardContent className="p-0">
                  <iframe
                    src={`https://maps.google.com/maps?q=${displayPlace.location.lat},${displayPlace.location.lng}&z=15&output=embed`}
                    width="100%"
                    height="300px"
                    style={{ borderRadius: '12px' }}
                    loading="lazy"
                  />
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {displayPlace.reviews && displayPlace.reviews.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Star className="w-5 h-5" />
                    Reviews
                  </h3>
                  <div className="space-y-4">
                    {(showAllReviews ? displayPlace.reviews : displayPlace.reviews.slice(0, 2)).map((review: any, idx: number) => (
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
                    {displayPlace.reviews.length > 2 && (
                      <Button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        variant="outline"
                        className="w-full"
                      >
                        {showAllReviews ? 'Show Less Reviews' : 'Show More Reviews'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Place Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Place Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{displayPlace.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Reviews</span>
                    <span>{displayPlace.userRatingsTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Country</span>
                    <span>{displayPlace.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Place ID</span>
                    <span className="text-xs font-mono">{displayPlace.placeId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PopularDestinations() {
  const [wishlist, setWishlist] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        console.log('🎯 Fetching wishlist for PopularDestinations...');
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/api/myplan`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch wishlist: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Wishlist data:', data);
        const allPlans: Place[] = data.plans || [];
        setWishlist(allPlans.slice(0, 4)); // Show only first 4 items
      } catch (err) {
        console.error('❌ Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isSignedIn, getToken]);

  const handleDestinationClick = (place: Place) => {
    setSelectedPlace(place);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPlace(null);
  };

  if (loading) {
    return (
      <div className="lg:col-span-2">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Your Wishlist Places</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-slate-600">Loading your saved places...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="lg:col-span-2">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Your Wishlist Places</h2>
        </div>
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-400" />
          <p className="text-slate-600">Sign in to see your saved places</p>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="lg:col-span-2">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Your Wishlist Places</h2>
        </div>
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-400" />
          <p className="text-slate-600">No saved places yet. Start exploring to add places to your wishlist!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Your Wishlist Places</h2>
        <p className="text-slate-600 mt-2">Your saved destinations from around the world</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {wishlist.map((place) => (
          <Card
            key={place.placeId}
            onClick={() => handleDestinationClick(place)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
          >
            <div className="overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 h-48 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <MapPin className="w-5 h-5 mb-1" />
                <p className="text-sm opacity-90">{place.country}</p>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {place.name}
              </h3>
              <p className="text-slate-600 mb-4 text-sm">{place.address}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-slate-900">
                    {place.rating}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({place.userRatingsTotal?.toLocaleString() || 0})
                  </span>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-red-400 text-red-400" />
                  Saved
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PlaceDetailsModal 
        place={selectedPlace}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
