import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@clerk/clerk-react';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plane, Clock, MapPin, Luggage, Users, CreditCard } from "lucide-react";

interface FlightOffer {
  id: string;
  price: { total: string };
  itineraries: {
    segments: {
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carriers?: string;
      aircraft?: { code: string };
      duration?: string;
    }[];
  }[];
  travelerPricings?: {
    fareDetailsBySegment?: {
      includedCheckedBags?: { weight?: number };
    }[];
  }[];
}

export default function FlightDetails() {
  const [, params] = useRoute('/flight-details/:id');
  const [, setLocation] = useLocation();
  const { userId, getToken } = useAuth();
  const [flight, setFlight] = useState<FlightOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [numPassengers, setNumPassengers] = useState(1);
  const [passengerDetails, setPassengerDetails] = useState([
    { name: '', gender: '', birthday: '' }
  ]);

  useEffect(() => {
    // Get flight data from sessionStorage or location state
    const flightId = params?.id;
    if (!flightId) {
      setLocation('/flight');
      return;
    }

    // Try to get flight from cached search results
    const cachedResults = sessionStorage.getItem('flightSearchResults');
    if (cachedResults) {
      const flights = JSON.parse(cachedResults);
      const selectedFlight = flights.find((f: FlightOffer) => f.id === flightId);
      if (selectedFlight) {
        setFlight(selectedFlight);
      }
    }
    
    setLoading(false);
  }, [params?.id, setLocation]);

  const handleBookFlight = async () => {
    if (!userId) {
      alert('Please log in to book a flight.');
      return;
    }

    if (passengerDetails.some(p => !p.name.trim() || !p.gender || !p.birthday)) {
      alert('Please complete all passenger information.');
      return;
    }

    if (!flight) {
      alert('Flight information is missing.');
      return;
    }

    setBooking(true);

    try {
      const token = await getToken();
      
      const bookingPayload = {
        userId,
        flightId: flight.id,
        passengerDetails,
        flightDetails: flight,
      };

      const res = await fetch('/api/bookings/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload),
      });

      const data = await res.json();
      console.log('📦 Booking API response:', res.status, data);

      if (!res.ok) {
        const errorMsg = data?.message || data?.error || 'Booking failed';
        alert(`Booking failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      alert('Flight booked successfully!');
      setLocation('/my-bookings');
    } catch (error: any) {
      console.error('Booking failed:', error);
      alert(`Booking failed. ${error?.message || 'Please try again.'}`);
    } finally {
      setBooking(false);
    }
  };

  const handlePassengerCountChange = (count: number) => {
    const validCount = Math.min(count, 9);
    setNumPassengers(validCount);
    const newDetails = Array.from({ length: validCount }, (_, i) => 
      passengerDetails[i] || { name: '', gender: '', birthday: '' }
    );
    setPassengerDetails(newDetails);
  };

  const handlePassengerDetailChange = (index: number, field: 'name' | 'gender' | 'birthday', value: string) => {
    const updatedDetails = [...passengerDetails];
    updatedDetails[index][field] = value;
    setPassengerDetails(updatedDetails);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      })
    };
  };

  const formatDuration = (duration: string) => {
    return duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || '';
  };

  const getAirlineName = (code: string) => {
    const airlines: { [key: string]: string } = {
      'MH': 'Malaysia Airlines',
      'AK': 'AirAsia',
      'SQ': 'Singapore Airlines',
      'TG': 'Thai Airways'
    };
    return airlines[code] || code;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-slate-600">Loading flight details...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-slate-600 mb-4">Flight not found</div>
            <Button onClick={() => setLocation('/flight')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => setLocation('/flight')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Flight Details</h1>
          <p className="text-xl text-slate-600">Review your selected flight</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Information */}
          <div className="lg:col-span-2 space-y-6">
            {flight.itineraries.map((itinerary, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plane className="w-5 h-5 text-primary" />
                    <span>{idx === 0 ? 'Outbound Flight' : 'Return Flight'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {itinerary.segments.map((segment, segIdx) => {
                    const departure = formatDateTime(segment.departure.at);
                    const arrival = formatDateTime(segment.arrival.at);
                    
                    return (
                      <div key={segIdx}>
                        {segIdx > 0 && <Separator className="my-4" />}
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold text-lg">{segment.departure.iataCode}</span>
                            </div>
                            <div className="text-sm text-slate-600">{departure.date}</div>
                            <div className="text-lg font-medium">{departure.time}</div>
                          </div>
                          
                          <div className="flex-1 text-center px-4">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                              <div className="h-px bg-slate-300 flex-1"></div>
                              <Clock className="w-4 h-4 text-slate-400" />
                              <div className="h-px bg-slate-300 flex-1"></div>
                            </div>
                            <div className="text-sm text-slate-500">
                              {formatDuration(segment.duration || '')}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {getAirlineName(segment.carriers || '')} • {segment.aircraft?.code}
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-right">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-lg">{segment.arrival.iataCode}</span>
                              <MapPin className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="text-sm text-slate-600">{arrival.date}</div>
                            <div className="text-lg font-medium">{arrival.time}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            {/* Flight Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Included Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Luggage className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">
                      {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight || 20}kg checked baggage
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">Seat selection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">Refundable</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Plane className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">In-flight meal</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Passenger Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Passengers</label>
                  <Select value={numPassengers.toString()} onValueChange={(value) => handlePassengerCountChange(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 9 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} Passenger{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {passengerDetails.map((passenger, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-medium">Passenger {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                          value={passenger.name}
                          onChange={(e) => handlePassengerDetailChange(index, 'name', e.target.value)}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Gender</label>
                        <Select value={passenger.gender} onValueChange={(value) => handlePassengerDetailChange(index, 'gender', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date of Birth</label>
                        <Input
                          type="date"
                          value={passenger.birthday}
                          onChange={(e) => handlePassengerDetailChange(index, 'birthday', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base fare</span>
                  <span>MYR {(parseFloat(flight.price.total) * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Taxes & fees</span>
                  <span>MYR {(parseFloat(flight.price.total) * 0.15).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">MYR {parseFloat(flight.price.total).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flight Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Route</span>
                  <span>{flight.itineraries[0].segments[0].departure.iataCode} → {flight.itineraries[0].segments[0].arrival.iataCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Type</span>
                  <span>{flight.itineraries.length > 1 ? 'Round-trip' : 'One-way'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Passengers</span>
                  <span>{numPassengers} Adult{numPassengers > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Class</span>
                  <span>Economy</span>
                </div>
              </CardContent>
            </Card>

            {/* Price Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Price</span>
                  <span className="text-2xl font-bold text-primary">
                    MYR {(parseFloat(flight.price.total) * numPassengers).toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  MYR {parseFloat(flight.price.total).toFixed(2)} × {numPassengers} passenger{numPassengers > 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleBookFlight}
              disabled={booking}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-semibold"
              size="lg"
            >
              {booking ? 'Booking...' : 'Book This Flight'}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}