import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, Users } from "lucide-react";

type Segment = {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  number: string;
  duration: string;
};

type Passenger = {
  name: string;
  gender: string;
  birthday: string;
};

type Booking = {
  bookingId: string;
  createdAt: string;
  price: {
    base: string;
    total: string;
    grandTotal: string;
    currency: string;
  };
  baggageAllowances: number[];
  itineraries: {
    segments: Segment[];
    duration: string;
  }[];
  airlineCodes: string[];
  passengers: Passenger[];
};

function isIncomingBooking(booking: Booking) {
  return booking.itineraries.some(itinerary =>
    itinerary.segments.some(seg => new Date(seg.departure.at) > new Date())
  );
}

export default function MyBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { userId, isLoaded, getToken } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"incoming" | "passed">("incoming");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const token = await getToken();
        const response = await fetch("/api/bookings", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const rawBookings = await response.json();
        const normalized: Booking[] = rawBookings.map((b: any) => ({
          bookingId: b.bookingId,
          createdAt: b.createdAt,
          price: b.flightDetails.price,
          baggageAllowances: b.flightDetails.baggageAllowances,
          itineraries: b.flightDetails.itineraries,
          airlineCodes: b.flightDetails.airlineCodes,
          passengers: b.passengers
        }));
        setBookings(normalized);
      } catch (err: any) {
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isLoaded, userId, getToken]);

  const handleViewDetails = (booking: Booking) => {
    setLocation(`/view-booking/${booking.bookingId}`, { state: { booking } });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">Loading your bookings...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Sign In Required</h2>
              <p className="text-slate-600 mb-6">Please sign in to view your bookings.</p>
              <Button onClick={() => setLocation('/flight')}>
                Search Flights Instead
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const incomingBookings = bookings.filter(isIncomingBooking);
  const passedBookings = bookings.filter(b => !isIncomingBooking(b));
  const bookingsToShow = activeTab === "incoming" ? incomingBookings : passedBookings;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Bookings</h1>
          <p className="text-xl text-slate-600">Manage and view your flight reservations</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8">
          <button
            className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
              activeTab === "incoming"
                ? "bg-white border-b-2 border-primary text-primary shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("incoming")}
          >
            <div className="flex items-center space-x-2">
              <Plane className="w-4 h-4" />
              <span>Upcoming Flights</span>
              {incomingBookings.length > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {incomingBookings.length}
                </span>
              )}
            </div>
          </button>
          <button
            className={`px-6 py-3 rounded-t-lg font-medium transition-colors ml-2 ${
              activeTab === "passed"
                ? "bg-white border-b-2 border-primary text-primary shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("passed")}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Flight History</span>
              {passedBookings.length > 0 && (
                <span className="bg-slate-400 text-white text-xs px-2 py-1 rounded-full">
                  {passedBookings.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Bookings List */}
        {bookingsToShow.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No {activeTab === "incoming" ? "upcoming flights" : "flight history"}
              </h3>
              <p className="text-slate-600 mb-6">
                {activeTab === "incoming" 
                  ? "You don't have any upcoming flights. Ready to plan your next adventure?"
                  : "You don't have any past flights in your history."
                }
              </p>
              {activeTab === "incoming" && (
                <Button onClick={() => setLocation('/flight')} className="bg-primary hover:bg-primary/90">
                  Search Flights
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookingsToShow.map((booking: Booking) => {
              const firstItinerary = booking.itineraries[0];
              const firstSegment = firstItinerary?.segments[0];
              const lastSegment = firstItinerary?.segments[firstItinerary.segments.length - 1];
              
              return (
                <Card key={booking.bookingId} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Plane className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              Booking #{booking.bookingId}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {booking.airlineCodes.join(", ")} • Booked on {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {firstSegment && lastSegment && (
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="text-center">
                              <div className="font-semibold text-slate-900">{firstSegment.departure.iataCode}</div>
                              <div className="text-sm text-slate-600">
                                {new Date(firstSegment.departure.at).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-slate-600">
                                {new Date(firstSegment.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            
                            <div className="flex-1 text-center">
                              <div className="h-px bg-slate-300 relative">
                                <Plane className="w-4 h-4 text-slate-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-50" />
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {booking.itineraries.length > 1 ? 'Round trip' : 'One way'}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-semibold text-slate-900">{lastSegment.arrival.iataCode}</div>
                              <div className="text-sm text-slate-600">
                                {new Date(lastSegment.arrival.at).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-slate-600">
                                {new Date(lastSegment.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-6 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''}</span>
                          </div>
                          <div className="font-semibold text-slate-900">
                            {booking.price.currency} {booking.price.total}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <Button
                          onClick={() => handleViewDetails(booking)}
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
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