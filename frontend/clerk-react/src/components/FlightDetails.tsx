import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const FlightDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [flight, setFlight] = useState<any>(location.state?.flight || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!flight && id) {
      setLoading(true);
      fetch(`http://localhost:5000/api/flights/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch flight data');
          return res.json();
        })
        .then((data) => {
          setFlight(data);
          setError('');
        })
        .catch((err) => {
          console.error(err);
          setError('Flight not found or error fetching details.');
        })
        .finally(() => setLoading(false));
    }
  }, [id, flight]);

  if (loading) return <p>Loading flight details...</p>;
  if (error || !flight) return <p>{error || 'Flight details not available.'}</p>;

  const renderItinerary = (itinerary: any, index: number, type: 'Departure' | 'Return') => {
    return (
      <div key={index} style={{ marginBottom: '2rem' }}>
        <h3>{type} Flight</h3>
        {itinerary.segments.map((seg: any, i: number) => {
          const departureTime = new Date(seg.departure.at);
          const arrivalTime = new Date(seg.arrival.at);

          return (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <p>
                <strong>From:</strong> {seg.departure.iataCode} at {departureTime.toLocaleString()}<br />
                <strong>To:</strong> {seg.arrival.iataCode} at {arrivalTime.toLocaleString()}<br />
                <strong>Flight Duration:</strong> {seg.duration.replace('PT', '').toLowerCase()}<br />
                <strong>Carrier:</strong> {seg.carrierCode}<br />
                {seg.aircraft && <strong>Aircraft:</strong>} {seg.aircraft?.code}
              </p>

              {/* Layover time */}
              {i > 0 && (() => {
                const prevArrival = new Date(itinerary.segments[i - 1].arrival.at);
                const layoverMinutes = Math.floor((departureTime.getTime() - prevArrival.getTime()) / 60000);
                const hours = Math.floor(layoverMinutes / 60);
                const minutes = layoverMinutes % 60;
                return (
                  <p style={{ color: 'gray' }}>
                    🕓 Layover: {hours}h {minutes}m at {itinerary.segments[i - 1].arrival.iataCode}
                  </p>
                );
              })()}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Flight Details (ID: {id})</h2>

      <button onClick={() => navigate(-1)} style={{ marginTop: '2rem' }}>← Back to Results</button>

      {/* Render Departure and Return Flights */}
      {flight.itineraries?.map((itinerary: any, idx: number) =>
        renderItinerary(itinerary, idx, idx === 0 ? 'Departure' : 'Return')
      )}

      {/* Baggage and Additional Info */}
      {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags && (
        <div style={{ marginTop: '1rem' }}>
          <p>
            🧳 <strong>Baggage Allowance:</strong>{' '}
            {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weight} kg
          </p>
        </div>
      )}

      {/* Total Flight Duration */}
      {flight.itineraries?.map((itinerary: any, idx: number) => (
        <div key={`duration-${idx}`}>
          <p>
            ⏱️ <strong>{idx === 0 ? 'Departure' : 'Return'} Total Duration:</strong>{' '}
            {itinerary.duration.replace('PT', '').toLowerCase()}
          </p>
        </div>
      ))}

      <p><strong>Airline:</strong> {flight.validatingAirlineCodes?.[0]}</p>
      <p><strong>Total Price:</strong> MYR {flight.price?.total}</p>

      
      <button style={{ marginTop: '2rem' }}>Add to Wishlist</button>
      <button style={{ marginTop: '2rem' }}> Book now</button>
    </div>
  );
};

export default FlightDetails;
