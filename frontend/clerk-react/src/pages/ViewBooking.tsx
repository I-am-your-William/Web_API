import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plane, Calendar, MapPin, Users, Luggage } from "lucide-react";

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

export default function ViewBooking() {
  const [, params] = useRoute("/view-booking/:id");
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const bookingId = params?.id;

  useEffect(() => {
    // Check if booking data was passed via location state
    const locationState = (window.history.state as any)?.state;
    if (locationState?.booking) {
      setBooking(locationState.booking);
      setLoading(false);
      return;
    }

    if (!bookingId) {
      setLoading(false);
      return;
    }

    // If no state data, try to fetch all bookings and find the specific one
    const fetchBookingFromList = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/bookings/', {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const bookings = await response.json();
        const foundBooking = bookings.find((b: any) => b.bookingId === bookingId);
        
        if (foundBooking) {
          setBooking({
            bookingId: foundBooking.bookingId,
            createdAt: foundBooking.createdAt,
            price: foundBooking.flightDetails.price,
            baggageAllowances: foundBooking.flightDetails.baggageAllowances || [],
            itineraries: foundBooking.flightDetails.itineraries,
            airlineCodes: foundBooking.flightDetails.airlineCodes || [],
            passengers: foundBooking.passengers
          });
        }
      } catch (err: any) {
        console.error("Error fetching booking:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingFromList();
  }, [bookingId, getToken]);

  const handleBack = () => {
    setLocation('/my-bookings');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">Loading booking details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Booking Not Found</h2>
              <p className="text-slate-600 mb-6">The booking you're looking for could not be found.</p>
              <Button onClick={handleBack}>Back to My Bookings</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-6 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Bookings
        </Button>

        {/* Header Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Details</h1>
                <p className="text-slate-600">Complete information about your flight reservation</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Plane className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-700">
              <div>
                <div className="text-sm text-slate-500 mb-1">Booking ID</div>
                <div className="font-semibold">{booking.bookingId}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Airline</div>
                <div className="font-semibold">{booking.airlineCodes.join(", ")}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Total Price</div>
                <div className="font-semibold text-primary text-lg">
                  {booking.price.currency} {booking.price.total}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Booked On</div>
                <div className="font-semibold">{new Date(booking.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Flight Itinerary */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Flight Itinerary</h2>
            <div className="space-y-6">
              {booking.itineraries.map((itinerary, idx) => {
                const first = itinerary.segments[0];
                const last = itinerary.segments[itinerary.segments.length - 1];
                
                return (
                  <Card key={idx}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Plane className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {idx === 0 ? "Outbound" : "Return"} Flight
                        </h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="font-bold text-xl text-slate-900">{first.departure.iataCode}</div>
                            <div className="text-sm text-slate-600">
                              {new Date(first.departure.at).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-slate-600">
                              {new Date(first.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          
                          <div className="flex-1 text-center mx-8">
                            <div className="h-px bg-slate-300 relative">
                              <Plane className="w-4 h-4 text-slate-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
                            </div>
                            <div className="text-sm text-slate-500 mt-2">
                              Duration: {itinerary.duration.replace("PT", "").toLowerCase()}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-bold text-xl text-slate-900">{last.arrival.iataCode}</div>
                            <div className="text-sm text-slate-600">
                              {new Date(last.arrival.at).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-slate-600">
                              {new Date(last.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-slate-600 pt-4 border-t">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Flight {first.number}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Luggage className="w-4 h-4" />
                            <span>{booking.baggageAllowances[idx] ?? "N/A"} kg baggage</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Passengers */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Passengers</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-slate-900">
                    {booking.passengers.length} Passenger{booking.passengers.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {booking.passengers.map((passenger, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-slate-500">Name</span>
                          <div className="font-semibold text-slate-900">{passenger.name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-slate-500">Gender</span>
                            <div className="font-medium text-slate-700 capitalize">{passenger.gender}</div>
                          </div>
                          <div>
                            <span className="text-sm text-slate-500">Birthday</span>
                            <div className="font-medium text-slate-700">
                              {new Date(passenger.birthday).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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