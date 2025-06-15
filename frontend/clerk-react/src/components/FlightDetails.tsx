import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const FlightDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userId, getToken } = useAuth();
  const [flight, setFlight] = useState<any>(location.state?.flight || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [numPassengers, setNumPassengers] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [passengerDetails, setPassengerDetails] = useState([
    { name: '', gender: '', birthday: '' }
  ]);

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

  const handlePassengerCountChange = (count: number) => {
    const validCount = Math.min(count, 9);
    setNumPassengers(validCount);
    const newDetails = Array.from({ length: validCount }, (_, i) => passengerDetails[i] || { name: '', gender: '', birthday: '' });
    setPassengerDetails(newDetails);
  };

  const handlePassengerDetailChange = (index: number, field: 'name' | 'gender' | 'birthday', value: string) => {
    const updatedDetails = [...passengerDetails];
    updatedDetails[index][field] = value;
    setPassengerDetails(updatedDetails);
  };

  const handleBooking = async () => {
    if (!userId) {
      alert('Please log in to book a flight.');
      return;
    }

    if (passengerDetails.some(p => !p.name.trim() || !p.gender || !p.birthday)) {
      alert('Please complete all passenger information.');
      return;
    }

    if (!flight || !(flight.id || id)) {
      alert('Flight information is missing.');
      return;
    }

    const token = await getToken();

    const bookingPayload = {
      userId,
      flightId: flight.id || id,
      passengerDetails,
      flightDetails: flight,
    };

    try {
      const res = await fetch('http://localhost:5000/api/bookings/flights', {
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

      setShowSuccessModal(true);
      setTimeout(() => {
        navigate(`/bookings/${data.bookingId}`);
      }, 3000);
    } catch (error: any) {
      console.error('Booking failed:', error);
      alert(`Booking failed. ${error?.message || 'Please try again.'}`);
    }
  };

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
                <strong>Airline Code:</strong> {seg.carrierCode}<br />
                {seg.aircraft && <><strong>Aircraft:</strong> {seg.aircraft?.code}</>}
              </p>
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

  if (loading) return <p>Loading flight details...</p>;
  if (error || !flight) return <p>{error || 'Flight details not available.'}</p>;

  const perPassengerPrice = parseFloat(flight.price?.total || '0');
  const totalPrice = (perPassengerPrice * numPassengers).toFixed(2);

  return (
    <div style={{ display: 'flex', padding: '2rem', gap: '2rem', alignItems: 'flex-start' }}>
      {/* Left: Flight Details */}
      <div style={{ flex: 2 }}>
        <h2>Flight Details (ID: {id})</h2>
        <button onClick={() => navigate(-1)}>← Back to Results</button>

        {flight.itineraries?.map((itinerary: any, idx: number) =>
          renderItinerary(itinerary, idx, idx === 0 ? 'Departure' : 'Return')
        )}

        {/* Airline Info */}
        {/* <p><strong>Airline:</strong> {flight.validatingAirlineCodes?.[0]}</p> */}
        <p><strong>Price per Passenger:</strong> MYR {perPassengerPrice.toFixed(2)}</p>
        <p><strong>Total Price for {numPassengers} Passenger{numPassengers > 1 ? 's' : ''}:</strong> MYR {totalPrice}</p>
      </div>

      {/* Right: Passenger Booking Panel */}
      <div style={{
        flex: 1,
        border: '1px solid #ccc',
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        position: 'sticky',
        top: '2rem'
      }}>
        <h3>Passenger Details</h3>
        <label><strong>Number of Passengers:</strong></label><br />
        <input
          type="number"
          min={1}
          max={9}
          value={numPassengers}
          onChange={(e) => handlePassengerCountChange(Number(e.target.value))}
          style={{ width: '60px', marginBottom: '0.5rem' }}
        /><br />
        <small style={{ color: 'gray' }}>Max 9 passengers allowed</small>

        {passengerDetails.map((passenger, idx) => (
          <div key={idx} style={{ marginBottom: '1rem' }}>
            <label>Passenger {idx + 1} Name:</label><br />
            <input
              type="text"
              value={passenger.name}
              onChange={(e) => handlePassengerDetailChange(idx, 'name', e.target.value)}
              required
            /><br />

            <label>Gender:</label><br />
            <select
              value={passenger.gender}
              onChange={(e) => handlePassengerDetailChange(idx, 'gender', e.target.value)}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select><br />

            <label>Birthday:</label><br />
            <input
              type="date"
              value={passenger.birthday}
              onChange={(e) => handlePassengerDetailChange(idx, 'birthday', e.target.value)}
              required
            />
          </div>
        ))}

        <button
          style={{
            marginTop: '1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={handleBooking}
        >
          ✈️ Book Now
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '10px',
            textAlign: 'center', maxWidth: '400px', width: '90%'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>🎉 Booking Successful!</h3>
            <p>You will be redirected to your booking shortly.</p>
            <button
              onClick={() => navigate('/bookings')}
              style={{
                marginTop: '1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Go to My Bookings Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightDetails;



// import React, { useEffect, useState } from 'react';
// import { useLocation, useParams, useNavigate } from 'react-router-dom';

// const FlightDetails: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const [flight, setFlight] = useState<any>(location.state?.flight || null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (!flight && id) {
//       setLoading(true);
//       fetch(`http://localhost:5000/api/flights/${id}`)
//         .then((res) => {
//           if (!res.ok) throw new Error('Failed to fetch flight data');
//           return res.json();
//         })
//         .then((data) => {
//           setFlight(data);
//           setError('');
//         })
//         .catch((err) => {
//           console.error(err);
//           setError('Flight not found or error fetching details.');
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [id, flight]);

//   if (loading) return <p>Loading flight details...</p>;
//   if (error || !flight) return <p>{error || 'Flight details not available.'}</p>;

//   const renderItinerary = (itinerary: any, index: number, type: 'Departure' | 'Return') => {
//     return (
//       <div key={index} style={{ marginBottom: '2rem' }}>
//         <h3>{type} Flight</h3>
//         {itinerary.segments.map((seg: any, i: number) => {
//           const departureTime = new Date(seg.departure.at);
//           const arrivalTime = new Date(seg.arrival.at);

//           return (
//             <div key={i} style={{ marginBottom: '1rem' }}>
//               <p>
//                 <strong>From:</strong> {seg.departure.iataCode} at {departureTime.toLocaleString()}<br />
//                 <strong>To:</strong> {seg.arrival.iataCode} at {arrivalTime.toLocaleString()}<br />
//                 <strong>Flight Duration:</strong> {seg.duration.replace('PT', '').toLowerCase()}<br />
//                 <strong>Carrier:</strong> {seg.carrierCode}<br />
//                 {seg.aircraft && <strong>Aircraft:</strong>} {seg.aircraft?.code}
//               </p>

//               {/* Layover time */}
//               {i > 0 && (() => {
//                 const prevArrival = new Date(itinerary.segments[i - 1].arrival.at);
//                 const layoverMinutes = Math.floor((departureTime.getTime() - prevArrival.getTime()) / 60000);
//                 const hours = Math.floor(layoverMinutes / 60);
//                 const minutes = layoverMinutes % 60;
//                 return (
//                   <p style={{ color: 'gray' }}>
//                     🕓 Layover: {hours}h {minutes}m at {itinerary.segments[i - 1].arrival.iataCode}
//                   </p>
//                 );
//               })()}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div style={{ padding: '2rem' }}>
//       <h2>Flight Details (ID: {id})</h2>

//       <button onClick={() => navigate(-1)} style={{ marginTop: '2rem' }}>← Back to Results</button>

//       {/* Render Departure and Return Flights */}
//       {flight.itineraries?.map((itinerary: any, idx: number) =>
//         renderItinerary(itinerary, idx, idx === 0 ? 'Departure' : 'Return')
//       )}

//       {/* Baggage and Additional Info */}
//       {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags && (
//         <div style={{ marginTop: '1rem' }}>
//           <p>
//             🧳 <strong>Baggage Allowance:</strong>{' '}
//             {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weight} kg
//           </p>
//         </div>
//       )}

//       {/* Total Flight Duration */}
//       {flight.itineraries?.map((itinerary: any, idx: number) => (
//         <div key={`duration-${idx}`}>
//           <p>
//             ⏱️ <strong>{idx === 0 ? 'Departure' : 'Return'} Total Duration:</strong>{' '}
//             {itinerary.duration.replace('PT', '').toLowerCase()}
//           </p>
//         </div>
//       ))}

//       <p><strong>Airline:</strong> {flight.validatingAirlineCodes?.[0]}</p>
//       <p><strong>Total Price:</strong> MYR {flight.price?.total}</p>

      
//       <button style={{ marginTop: '2rem' }}>Add to Wishlist</button>
//       <button style={{ marginTop: '2rem' }}> Book now</button>
//     </div>
//   );
// };

// export default FlightDetails;
