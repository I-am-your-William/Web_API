import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";

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

export default function MyBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { userId, isLoaded, getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchBookings = async () => {
      try {
        const token = await getToken();
        const response = await fetch("http://localhost:5000/api/bookings", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          }
        });

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
      }
    };

    fetchBookings();
  }, [isLoaded, userId, getToken]);

  const incomingBookings = bookings.filter(isIncomingBooking);
  const passedBookings = bookings.filter(b => !isIncomingBooking(b));

  const renderBookings = (bookingList: Booking[]) => {
    if (!bookingList.length) {
      return <p className="text-muted-foreground text-sm">No bookings found.</p>;
    }

    return bookingList.map(booking => (
      <Card key={booking.bookingId} className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Booking ID: {booking.bookingId}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {booking.airlineCodes?.join(", ") || "Unknown Airline"} &mdash; {booking.price.currency} {booking.price.total}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/view-booking/${booking.bookingId}`, { state: { booking } })}
          >
            View Details
          </Button>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            {booking.passengers.length} Passenger{booking.passengers.length > 1 ? "s" : ""} | 
            Created at: {new Date(booking.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        <Tabs defaultValue="incoming">
          <TabsList className="mb-6">
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="passed">History</TabsTrigger>
          </TabsList>

          <TabsContent value="incoming">
            {renderBookings(incomingBookings)}
          </TabsContent>

          <TabsContent value="passed">
            {renderBookings(passedBookings)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
