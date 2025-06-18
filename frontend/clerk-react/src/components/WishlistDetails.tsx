import { useLocation, useNavigate } from 'react-router-dom';
import { AiFillStar } from 'react-icons/ai';

export default function WishlistDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const place = state?.place;

  if (!place) {
    return <div>Place details not found.</div>;
  }

  const {
    name,
    address,
    rating,
    userRatingsTotal,
    location,
    reviews = [],
    country,
  } = place;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fdf5f7' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/plans', { state: { showWishlist: true } })}
        style={{
          backgroundColor: '#fbe5ec',
          color: '#c96077',
          border: 'none',
          padding: '0.5rem 1.2rem',
          borderRadius: '30px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}
      >
        ← Back
      </button>

      <h2 style={{ fontSize: '2rem', color: '#c96077' }}>{name}</h2>
      <p style={{ fontSize: '1.1rem' }}>📍 {address}</p>
      <p>
        <AiFillStar color="#f4c542" /> {rating} ({userRatingsTotal} reviews)
      </p>
      <p>🌍 Country: {country || 'Unknown'}</p>

      {/* Google Map iframe */}
      {location?.lat && location?.lng && (
        <iframe
          src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
          width="100%"
          height="300px"
          style={{ border: '1px solid #ddd', borderRadius: '12px', marginBottom: '2rem' }}
          loading="lazy"
        ></iframe>
      )}

      {/* Reviews */}
      <h3 style={{ marginTop: '1.5rem', color: '#c96077' }}>Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews available.</p>
      ) : (
        <ul style={{ paddingLeft: '1rem' }}>
          {reviews.map((review: any, index: number) => (
            <li
              key={index}
              style={{
                marginBottom: '1rem',
                background: '#fff',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <p>
                <strong>{review.author_name || review.author || 'Anonymous'}</strong> ({review.rating}⭐)
              </p>
              <p>{review.text || 'No review text available.'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
