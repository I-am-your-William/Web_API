import { useEffect, useState } from "react"
import { useAuth } from "@clerk/clerk-react"
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

type Segment = {
  departure: { iataCode: string; at: string }
  arrival: { iataCode: string; at: string }
  number: string
  duration: string
}

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
  passengers: Passenger[]; // ✅ Add this line
};

// type Booking = {
//   bookingId: string
//   createdAt: string
//   price: {
//     base: string
//     total: string
//     grandTotal: string
//     currency: string
//   }
//   baggageAllowances: number[]
//   itineraries: {
//     segments: Segment[]
//     duration: string
//   }[]
//   airlineCodes: string[]
// }

export default function MyBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const { userId, isLoaded, getToken } = useAuth()
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);


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

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Fetch failed: ${response.status} - ${errorText}`);
        }

        const rawBookings = await response.json();

        // // Map flightDetails into Booking structure
        // const normalizedBookings: Booking[] = rawBookings.map((b: any) => ({
        //   bookingId: b.bookingId,
        //   createdAt: b.createdAt,
        //   price: b.flightDetails.price,
        //   baggageAllowances: b.flightDetails.baggageAllowances,
        //   itineraries: b.flightDetails.itineraries,
        //   airlineCodes: b.flightDetails.airlineCodes
        // }));

        const normalizedBookings: Booking[] = rawBookings.map((b: any) => ({
          bookingId: b.bookingId,
          createdAt: b.createdAt,
          price: b.flightDetails.price,
          baggageAllowances: b.flightDetails.baggageAllowances,
          itineraries: b.flightDetails.itineraries,
          airlineCodes: b.flightDetails.airlineCodes,
          passengers: b.passengers // ✅ Add this line
        }));

        setBookings(normalizedBookings);
      } catch (err: any) {
        console.error("Error fetching bookings:", err.message);
      }
    };

    fetchBookings();
  }, [isLoaded, userId, getToken]);

  if (!bookings.length) {
    return <div>No bookings found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {bookings.map((booking: Booking) => {
          const firstItinerary = booking.itineraries?.[0];
          const firstSegment = firstItinerary?.segments?.[0];
          const lastItinerary = booking.itineraries?.[booking.itineraries.length - 1];
          const lastSegment = lastItinerary?.segments?.[lastItinerary.segments.length - 1];

          if (!firstSegment || !lastSegment || !booking.price) return null;

          return (
            <div key={booking.bookingId} className="border rounded-lg p-6 shadow-sm bg-white mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Flight Ticket</h2>
                <div className="mb-1 text-xs text-gray-500">Booking ID: {booking.bookingId}</div>
                <p className="text-sm text-gray-600">Airline: {booking.airlineCodes?.join(", ")}</p>
              </div>

              {booking.itineraries.map((itinerary, idx) => {
                const firstSegment = itinerary.segments?.[0];
                const lastSegment = itinerary.segments?.[itinerary.segments.length - 1];
                if (!firstSegment || !lastSegment) return null;

                return (
                  <div key={idx} className="mb-6 border-t pt-4">
                    <h2 className="text-lg font-semibold mb-2">Itinerary {idx + 1}</h2>
                    <h3 className="text-md font-medium mb-2">
                      {firstSegment.departure.iataCode} → {lastSegment.arrival.iataCode}
                    </h3>
                    <p><strong>Departure:</strong> {new Date(firstSegment.departure.at).toLocaleString()}</p>
                    <p><strong>Arrival:</strong> {new Date(lastSegment.arrival.at).toLocaleString()}</p>
                    <p><strong>Flight No:</strong> {firstSegment.number}</p>
                    <p><strong>Duration:</strong> {itinerary.duration?.replace("PT", "").toLowerCase()}</p>
                    <p><strong>Baggage:</strong> {booking.baggageAllowances?.[idx] ?? "N/A"} kg</p>
                  </div>
                );
              })}

              <div className="text-right md:text-left">
                <p className="text-lg font-bold text-blue-600">
                  {booking.price.currency} {booking.price.total}
                </p>
                <p className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  Confirmed
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setExpandedTicket(booking.bookingId === expandedTicket ? null : booking.bookingId)}
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition"
                  >
                    {expandedTicket === booking.bookingId ? "Hide Ticket" : "View Ticket"}
                  </button>

                  {expandedTicket === booking.bookingId && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="text-md font-semibold mb-2">Passenger(s)</h3>
                      {booking.passengers?.map((p, i) => (
                        <div key={i} className="mb-2 text-sm">
                          <p><strong>Name:</strong> {p.name}</p>
                          <p><strong>Gender:</strong> {p.gender}</p>
                          <p><strong>Birthday:</strong> {new Date(p.birthday).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
