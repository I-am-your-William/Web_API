import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

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
  // If any segment's departure is in the future, consider as incoming
  return booking.itineraries.some(itinerary =>
    itinerary.segments.some(seg => new Date(seg.departure.at) > new Date())
  );
}

export default function MyBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { userId, isLoaded, getToken } = useAuth();
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"incoming" | "passed">("incoming");

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
        const normalizedBookings: Booking[] = rawBookings.map((b: any) => ({
          bookingId: b.bookingId,
          createdAt: b.createdAt,
          price: b.flightDetails.price,
          baggageAllowances: b.flightDetails.baggageAllowances,
          itineraries: b.flightDetails.itineraries,
          airlineCodes: b.flightDetails.airlineCodes,
          passengers: b.passengers
        }));

        setBookings(normalizedBookings);
      } catch (err: any) {
        console.error("Error fetching bookings:", err.message);
      }
    };

    fetchBookings();
  }, [isLoaded, userId, getToken]);

  const incomingBookings = bookings.filter(isIncomingBooking);
  const passedBookings = bookings.filter(b => !isIncomingBooking(b));
  const bookingsToShow = activeTab === "incoming" ? incomingBookings : passedBookings;

  return (
    <div className="min-h-screen bg-gray-100 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        {/* Tabs */}
        <div className="flex mb-6">
          <button
            className={`px-4 py-2 rounded-t-lg border-b-2 ${activeTab === "incoming" ? "border-blue-600 text-blue-600 font-semibold bg-white" : "border-transparent text-gray-500 bg-gray-200"}`}
            onClick={() => setActiveTab("incoming")}
          >
            Incoming Bookings
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg border-b-2 ml-2 ${activeTab === "passed" ? "border-blue-600 text-blue-600 font-semibold bg-white" : "border-transparent text-gray-500 bg-gray-200"}`}
            onClick={() => setActiveTab("passed")}
          >
            Bookings History
          </button>
        </div>
        {/* Bookings */}
        {!bookingsToShow.length ? (
          <div>No bookings found.</div>
        ) : (
          bookingsToShow.map((booking: Booking) => {
            const isExpanded = expandedTicket === booking.bookingId;
            return (
              <div
                key={booking.bookingId}
                style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}
                className="mb-8"
              >
                <div className="border-2 border-blue-400 rounded-xl shadow-lg bg-white p-6">
                  {/* --- Collapsed View --- */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Booking: {booking.bookingId}</h3>
                      <p className="text-sm text-gray-600">
                        {booking.airlineCodes.join(", ")} | {booking.price.currency} {booking.price.total}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedTicket(isExpanded ? null : booking.bookingId)}
                      className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition"
                    >
                      {isExpanded ? "Hide Details" : "View Details"}
                    </button>
                  </div>

                  {/* --- Expanded View --- */}
                  {isExpanded && (
                    <div className="mt-6 flex flex-col md:flex-row gap-6 border-t pt-4">
                      {/* Left: Itineraries */}
                      <div className="flex-1">
                        {booking.itineraries.map((itinerary, idx) => {
                          const first = itinerary.segments[0];
                          const last = itinerary.segments[itinerary.segments.length - 1];
                          return (
                            <div key={idx} className="mb-4">
                              <h3 className="text-md font-medium">
                                Itinerary {idx + 1}: {first.departure.iataCode} → {last.arrival.iataCode}
                              </h3>
                              <p><strong>Departure:</strong> {new Date(first.departure.at).toLocaleString()}</p>
                              <p><strong>Arrival:</strong> {new Date(last.arrival.at).toLocaleString()}</p>
                              <p><strong>Flight No:</strong> {first.number}</p>
                              <p><strong>Duration:</strong> {itinerary.duration.replace("PT", "").toLowerCase()}</p>
                              <p><strong>Baggage:</strong> {booking.baggageAllowances[idx] ?? "N/A"} kg</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right: Passengers */}
                      <div className="w-full md:w-1/3 bg-gray-50 rounded-lg p-4 shadow-inner">
                        <h3 className="text-md font-semibold mb-3">Passenger(s)</h3>
                        {booking.passengers.map((p, i) => (
                          <div key={i} className="mb-2 text-sm border-b pb-2">
                            <p><strong>Name:</strong> {p.name}</p>
                            <p><strong>Gender:</strong> {p.gender}</p>
                            <p><strong>Birthday:</strong> {new Date(p.birthday).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
