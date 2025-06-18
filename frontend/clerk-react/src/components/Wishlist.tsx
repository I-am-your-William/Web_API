import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { AiFillHeart } from 'react-icons/ai';

interface Place {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  country: string;
}

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<Place[]>([]);
  const [filteredWishlist, setFilteredWishlist] = useState<Place[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [countries, setCountries] = useState<string[]>([]);
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isSignedIn) return;

      try {
        const token = await getToken();

        const response = await fetch('http://localhost:5000/api/myplan', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }

        const data = await response.json();
        const allPlans: Place[] = data.plans || [];
        setWishlist(allPlans);

        const uniqueCountries = Array.from(new Set(allPlans.map((p: Place) => p.country).filter(Boolean)));
        setCountries(['All', ...uniqueCountries]);
        setFilteredWishlist(allPlans);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      }
    };

    fetchWishlist();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (selectedCountry === 'All') {
      setFilteredWishlist(wishlist);
    } else {
      setFilteredWishlist(wishlist.filter((p: Place) => p.country === selectedCountry));
    }
  }, [selectedCountry, wishlist]);

  const handleViewDetails = (place: Place) => {
    if (!place || !place.placeId) return;
    navigate(`/wishlist-details/${place.placeId}`, { state: { place } });
  };

  const handleRemove = async (placeId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this place from your wishlist?');
    if (!confirmDelete) return;

    try {
      const token = await getToken();
      await fetch(`http://localhost:5000/api/myplan/${placeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedList = wishlist.filter((p: Place) => p.placeId !== placeId);
      setWishlist(updatedList);
    } catch (err) {
      console.error('Failed to delete place from wishlist:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fdf5f7' }}>
      <h2 style={{ color: '#c96077', fontSize: '1.8rem', marginBottom: '1rem' }}>My Wishlist</h2>

      <label htmlFor="country-filter" style={{ marginBottom: '1rem', display: 'block' }}>
        Filter by country:
      </label>
      <select
        id="country-filter"
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '2rem' }}
      >
        {countries.map((country, idx) => (
          <option key={idx} value={country}>{country}</option>
        ))}
      </select>

      {filteredWishlist.length === 0 ? (
        <p>Your wishlist is empty. Start saving places from the Search tab!</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredWishlist.map((place: Place) => {
            const {
              placeId = '',
              name = 'Unknown Place',
              address = 'No address',
              rating = 0,
              userRatingsTotal = 0,
            } = place;

            return (
              <div
                key={placeId}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '1rem',
                  position: 'relative',
                }}
              >
                <span
                  onClick={() => handleRemove(placeId)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    color: '#c96077',
                    cursor: 'pointer',
                  }}
                >
                  <AiFillHeart size={24} />
                </span>
                <h3 style={{ color: '#c96077', marginBottom: '0.3rem' }}>{name}</h3>
                <p>📍 {address}</p>
                <p>⭐ {rating} ({userRatingsTotal} reviews)</p>

                <button
                  onClick={() => handleViewDetails(place)}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
