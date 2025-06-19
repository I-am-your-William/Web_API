import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { API_BASE_URL } from "@/lib/api";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, Plane, Calendar, MapPin, Users, Luggage, User, CreditCard, Mail, Phone, Shield, Plus, Coffee, Clock,
} from "lucide-react";

type Segment = {
  departure: { iataCode: string; at: string; terminal?: string };
  arrival: { iataCode: string; at: string; terminal?: string };
  carrierCode?: string;
  number: string;
  duration: string;
};

type Passenger = {
  name: string;
  gender: string;
  birthday: string;
};

type Extras = {
  insurance?: boolean;
  meal?: boolean;
  lounge?: boolean;
  extraBaggage?: boolean;
  [key: string]: boolean | undefined;
};

type Contact = {
  email: string;
  phone: string;
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
  contact?: Contact;
  extras?: Extras;
};

export default function ViewBooking() {
  const [, params] = useRoute("/view-booking/:id");
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const bookingId = params?.id;

  // New state for contacts and extras
  const [primaryContact, setPrimaryContact] = useState<Contact | null>(null);
  const [emergencyContact, setEmergencyContact] = useState<any>(null);
  const [extras, setExtras] = useState<Extras | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

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
    const fetchBookingFromList = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/api/bookings/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) throw new Error('Failed to fetch bookings');
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
            passengers: foundBooking.passengers,
            contact: foundBooking.contact,
            extras: foundBooking.extras,
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

  // Fetch contacts and extras
  useEffect(() => {
    if (!bookingId) return;
    const fetchContactsAndExtras = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/contacts`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPrimaryContact(data.primaryContact);
          setEmergencyContact(data.emergencyContact);
          setExtras(data.extras);
          if (data.totalPrice !== undefined) {
            setTotalPrice(data.totalPrice);
          }
        }
      } catch (err) {
        console.error("Error fetching contacts and extras:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContactsAndExtras();
  }, [bookingId, getToken]);

  const handleBack = () => setLocation('/my-bookings');

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

  // Helper for dynamic extras rendering
  const renderExtras = (extrasObj: any) => {
    if (!extrasObj || !Object.values(extrasObj).some(Boolean)) return null;
    return (
      <div>
        <h4 className="text-l font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} />
          Additional Services
        </h4>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
          <div className="space-y-3">
            {extrasObj.extraBaggage && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Luggage size={16} className="text-gray-500" />
                  <span>Extra Baggage (23kg)</span>
                </div>
                <span className="text-green-600 font-medium">✓ Added</span>
              </div>
            )}
            {extrasObj.seatSelection && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <span>Seat Selection</span>
                </div>
                <span className="text-green-600 font-medium">✓ Added</span>
              </div>
            )}
            {extrasObj.mealPreference && extrasObj.mealPreference !== "standard" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee size={16} className="text-gray-500" />
                  <span>Special Meal ({extrasObj.mealPreference})</span>
                </div>
                <span className="text-green-600 font-medium">✓ Added</span>
              </div>
            )}
            {extrasObj.insurance && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-gray-500" />
                  <span>Travel Insurance</span>
                </div>
                <span className="text-green-600 font-medium">✓ Added</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
          <div className="lg:col-span-2 space-y-8">
            <div>
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
                          {itinerary.segments.map((segment, segIdx) => {
                            const departure = segment.departure;
                            const arrival = segment.arrival;
                            const nextSegment = itinerary.segments[segIdx + 1];
                            // Layover calculation
                            let layover = null;
                            if (nextSegment) {
                              const arrTime = new Date(arrival.at);
                              const depTime = new Date(nextSegment.departure.at);
                              const diff = (depTime.getTime() - arrTime.getTime()) / 60000;
                              const hours = Math.floor(diff / 60);
                              const minutes = diff % 60;
                              layover = `${hours}h ${minutes}m`;
                            }
                            return (
                              <div key={segIdx} className="relative mb-6">
                                {/* Flight number and duration */}
                                <div className="flex justify-between items-center mb-4">
                                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                                    Flight Code:  {segment.carrierCode ?? ""}{segment.number}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock size={14} />
                                    {segment.duration.replace("PT", "").toLowerCase()}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-center">
                                    <div className="font-bold text-xl text-slate-900">{departure.iataCode}</div>
                                    <div className="text-sm text-slate-600">{new Date(departure.at).toLocaleDateString()}</div>
                                    <div className="text-sm text-slate-600">{new Date(departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    {departure.terminal && (
                                      <div className="text-xs text-slate-500">Terminal {departure.terminal}</div>
                                    )}
                                  </div>
                                  <div className="flex-1 text-center mx-8">
                                    <div className="h-px bg-slate-300 relative">
                                      <Plane className="w-4 h-4 text-slate-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
                                    </div>
                                    <div className="text-sm text-slate-500 mt-2">
                                      Duration: {segment.duration.replace("PT", "").toLowerCase()}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-bold text-xl text-slate-900">{arrival.iataCode}</div>
                                    <div className="text-sm text-slate-600">{new Date(arrival.at).toLocaleDateString()}</div>
                                    <div className="text-sm text-slate-600">{new Date(arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    {arrival.terminal && (
                                      <div className="text-xs text-slate-500">Terminal {arrival.terminal}</div>
                                    )}
                                  </div>
                                </div>
                                {/* Layover display */}
                                {layover && (
                                  <div className="mt-2 mb-2 flex items-center justify-center">
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1 text-amber-700 text-xs flex items-center gap-2">
                                      <span>Layover: {layover} at {arrival.iataCode}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {/* Summary for flight number, baggage, etc. */}
                        <div className="flex items-center justify-between text-sm text-slate-600 pt-4 border-t">
                          
                          <div className="flex items-center space-x-1">
                            <Luggage className="w-4 h-4" />
                            <span>{(booking.baggageAllowances[idx] ?? 0) > 0 ? "Yes" : "No"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            
          </div>
          {/* Passengers & Contact */}
          <div className="space-y-8">
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
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="font-medium text-slate-800">Email:</span>
                    <span className="text-slate-700">{primaryContact?.email || booking.contact?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="font-medium text-slate-800">Phone:</span>
                    <span className="text-slate-700">{primaryContact?.phone || booking.contact?.phone || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Payment Summary */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment Summary</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="font-medium text-slate-800">Base Price:</span>
                    <span className="text-slate-700">{booking.price.currency} {booking.price.base}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Plus className="w-5 h-5 text-primary" />
                    <span className="font-medium text-slate-800">Extras:</span>
                    <span className="text-slate-700">{booking.price.currency} {(+booking.price.total - +booking.price.base).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-slate-800">Grand Total:</span>
                    <span className="text-primary font-bold text-lg">{booking.price.currency} {totalPrice ?? booking.price.grandTotal ?? booking.price.total}</span>
                  </div>
                  {renderExtras(extras ?? booking.extras)}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}