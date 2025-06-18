// SearchPlace.tsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Review {
  author: string;
  text: string;
  rating: number;
  time: string;
}

interface Place {
  name: string;
  rating: number;
  userRatingsTotal: number;
  address: string;
  placeId: string;
  location: {
    lat: number;
    lng: number;
  };
  reviews: Review[];
}

export default function SearchPlace() {
  const [location, setLocation] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 3.139, lng: 101.6869 });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLIFrameElement | null>(null);
  const loc = useLocation();

  useEffect(() => {
    // Restore previous search state
    if (loc.state?.prevQuery && loc.state?.prevResults) {
        setLocation(loc.state.prevQuery);
        setPlaces(loc.state.prevResults);
    } else {
        // If no previous state, try geolocation
        navigator.geolocation.getCurrentPosition(
        (position) => {
            setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            });
        },
        () => console.warn('Geolocation not allowed or failed.')
        );
    }
    }, []);

  const fetchPlaces = async () => {
    try {
      const res = await axios.get('/api/places', { params: { location } });
      setPlaces(res.data.places);
      if (res.data.places.length > 0) {
        const first = res.data.places[0];
        setMapCenter(first.location);
        setSelectedPlace(first);
        updateMap(first.location);
      }
    } catch (err) {
      console.error('Failed to fetch places', err);
    }
  };

  const updateMap = (center: { lat: number; lng: number }) => {
    const mapUrl = `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=15&output=embed`;
    if (mapRef.current) {
      mapRef.current.src = mapUrl;
    }
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setMapCenter(place.location);
    updateMap(place.location);
  };

  const goToDetails = (place: Place) => {
    navigate(`/details/${place.placeId}`, { state: { place } });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#fdf5f7', minHeight: '100vh' }}>
      {/* Search */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Enter city or place name"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            width: '300px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={fetchPlaces}
          style={{
            padding: '0.6rem 1.5rem',
            backgroundColor: '#fbe5ec',
            border: 'none',
            borderRadius: '8px',
            color: '#c96077',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>

      {/* Layout */}
      <div style={{ display: 'flex', gap: '2rem', height: '90vh', alignItems: 'stretch' }}>
        {/* Map */}
        <div style={{ flex: 1, height: '100%' }}>
          <iframe
            ref={mapRef}
            width="100%"
            height="100%"
            style={{ border: '1px solid #ccc', borderRadius: '12px' }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=15&output=embed`}
          ></iframe>
        </div>

        {/* Info Panel */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff8fa',
          borderRadius: '12px',
          border: '1px solid #eee',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          padding: '1rem',
          overflow: 'hidden',
          height: '100%'
        }}>
          {/* Selected Details */}
        

          {/* List */}
          <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '0.5rem' }}>
            {places.length === 0 ? (
              <p>No places found.</p>
            ) : (
              places.map((place) => (
                <div
                  key={place.placeId}
                  onClick={() => handlePlaceClick(place)}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: selectedPlace?.placeId === place.placeId ? '#fde4ec' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff0f5')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedPlace?.placeId === place.placeId ? '#fde4ec' : '#fff')}
                >
                  <h4 style={{ color: '#c96077', margin: '0 0 0.5rem' }}>{place.name}</h4>
                  <p style={{ margin: '0.2rem 0' }}>📍 {place.address}</p>
                  <p style={{ margin: '0.2rem 0' }}>⭐ {place.rating} ({place.userRatingsTotal} reviews)</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToDetails(place);
                    }}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.4rem 1rem',
                      backgroundColor: '#c96077',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
