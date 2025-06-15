import { useLocation, useNavigate, useParams } from "react-router-dom";
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

export default function ViewBookingPage() {
  const { state } = useLocation();
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(state?.booking ?? null);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (booking || !id) return;

    const fetchSingleBooking = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json"
          }
        });

        const raw = await response.json();
        setBooking({
          bookingId: raw.bookingId,
          createdAt: raw.createdAt,
          price: raw.flightDetails.price,
          baggageAllowances: raw.flightDetails.baggageAllowances,
          itineraries: raw.flightDetails.itineraries,
          airlineCodes: raw.flightDetails.airlineCodes,
          passengers: raw.passengers
        });
      } catch (err: any) {
        console.error("Error fetching single booking:", err.message);
      }
    };

    fetchSingleBooking();
  }, [booking, id, getToken]);

  if (!booking) return <div className="p-6 text-center">Loading booking...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
      >
        ← Back to Bookings
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Booking Summary</h1>
        <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Booking ID:</strong> {booking.bookingId}</p>
          <p><strong>Airline:</strong> {booking.airlineCodes.join(", ")}</p>
          <p><strong>Total Price:</strong> {booking.price.currency} {booking.price.total}</p>
          <p><strong>Created At:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Itineraries Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Flight Itinerary</h2>
          {booking.itineraries.map((it, idx) => {
            const first = it.segments[0];
            const last = it.segments[it.segments.length - 1];
            return (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                <h3 className="text-lg font-medium mb-3 text-gray-700">
                  {idx === 0 ? "Outbound" : "Return"} Flight
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><strong>From:</strong> {first.departure.iataCode} — {new Date(first.departure.at).toLocaleString()}</li>
                  <li><strong>To:</strong> {last.arrival.iataCode} — {new Date(last.arrival.at).toLocaleString()}</li>
                  <li><strong>Flight No:</strong> {first.number}</li>
                  <li><strong>Duration:</strong> {it.duration.replace("PT", "").toLowerCase()}</li>
                  <li><strong>Baggage:</strong> {booking.baggageAllowances[idx] ?? "N/A"} kg</li>
                </ul>
              </div>
            );
          })}
        </div>

        {/* Passengers Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Passenger(s)</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm">
            {booking.passengers.map((p, i) => (
              <div
                key={i}
                className="mb-4 pb-4 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0 text-sm text-gray-700"
              >
                <p><strong>Name:</strong> {p.name}</p>
                <p><strong>Gender:</strong> {p.gender}</p>
                <p><strong>Birthday:</strong> {new Date(p.birthday).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

