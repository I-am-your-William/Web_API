import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

export default function PlaceDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const place = location.state?.place;
  const prevQuery = location.state?.prevQuery;
  const prevResults = location.state?.prevResults;

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [countryInput, setCountryInput] = useState('');
  const { isSignedIn, getToken } = useAuth();

  if (!place) {
    return <p>Place not found. Please go back.</p>;
  }

  const toggleReviews = () => {
    setShowAllReviews((prev) => !prev);
  };

  const handleSaveToWishlist = async () => {
    if (isSaved) return;

    if (!countryInput.trim()) {
      alert('Please enter the country of this place.');
      return;
    }

    try {
      if (!isSignedIn) {
        alert('Please log in to save to wishlist.');
        return;
      }

      const token = await getToken();

      const response = await fetch('http://localhost:5000/api/myplan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: place.name,
          address: place.formatted_address || place.address || '',
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total || place.userRatingsTotal || 0,
          location: {
            lat: place.geometry?.location?.lat || place.location?.lat,
            lng: place.geometry?.location?.lng || place.location?.lng,
          },
          reviews: place.reviews || [],
          placeId: place.place_id || place.placeId,
          country: countryInput.trim(),
        }),
      });

      const responseText = await response.text();
      console.log('Server responded with:', response.status, responseText);

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setIsSaved(true);
      alert(`${place.name} added to your wishlist!`);
      navigate('/plans', { state: { showWishlist: true } });
    } catch (error) {
      console.error('Error saving to wishlist:', error);
      alert('Failed to save to wishlist.');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff0f5',
      minHeight: '100vh',
      color: '#333'
    }}>
      <button
        onClick={handleBack}
        style={{
          backgroundColor: '#fbe5ec',
          color: '#c96077',
          border: 'none',
          padding: '0.5rem 1.2rem',
          borderRadius: '30px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}
      >
        ← Back
      </button>

      <div style={{
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#c96077', fontSize: '1.8rem', marginBottom: '0.5rem' }}>{place.name}</h2>
        <p style={{ margin: '0.2rem 0' }}>📍 {place.formatted_address || place.address}</p>
        <p style={{ margin: '0.2rem 0' }}>⭐ {place.rating} ({place.user_ratings_total || place.userRatingsTotal} reviews)</p>

        <input
          type="text"
          placeholder="Enter country of this place"
          value={countryInput}
          onChange={(e) => setCountryInput(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            marginTop: '1rem',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />

        <button
          onClick={handleSaveToWishlist}
          disabled={isSaved}
          style={{
            marginTop: '1rem',
            backgroundColor: isSaved ? '#ccc' : '#c96077',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            cursor: isSaved ? 'default' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isSaved ? '✓ Added to Wishlist' : '+ Add to Wishlist'}
        </button>
      </div>

      <iframe
        src={`https://maps.google.com/maps?q=${place.geometry?.location?.lat || place.location?.lat},${place.geometry?.location?.lng || place.location?.lng}&z=15&output=embed`}
        width="100%"
        height="300px"
        style={{ border: '1px solid #ddd', borderRadius: '12px', marginBottom: '2rem' }}
      ></iframe>

      {place.reviews && place.reviews.length > 0 && (
        <div style={{
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ color: '#c96077', marginBottom: '1rem' }}>Reviews:</h3>
          {(showAllReviews ? place.reviews : place.reviews.slice(0, 2)).map((review: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>
              <p><strong>{review.author_name || review.author}</strong> ({review.rating}★)</p>
              <p>{review.text}</p>
              <small>{review.relative_time_description || review.time}</small>
            </div>
          ))}
          {place.reviews.length > 2 && (
            <button
              onClick={toggleReviews}
              style={{
                marginTop: '1rem',
                backgroundColor: '#fbe5ec',
                color: '#c96077',
                border: 'none',
                padding: '0.5rem 1.2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {showAllReviews ? '▲ Hide Reviews' : '▼ Show More Reviews'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
