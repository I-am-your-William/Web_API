import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

export default function FirebaseTest() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editLocationName, setEditLocationName] = useState('');

  const fetchWishlist = async () => {
    if (!isLoaded || !isSignedIn) return;
    const token = await getToken();
    const res = await fetch('http://localhost:5000/api/wishlist', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setWishlistItems(data);
  };

  const addWishlistItem = async () => {
    if (!isLoaded || !isSignedIn) return;
    const token = await getToken();
    await fetch('http://localhost:5000/api/wishlist', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName: 'Kyoto',
        locationId: 'kyoto_123',
      }),
    });
    fetchWishlist();
  };

  const deleteItem = async (id: string) => {
    if (!isLoaded || !isSignedIn) return;
    const token = await getToken();
    await fetch(`http://localhost:5000/api/wishlist/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWishlist();
  };

  const updateItem = async (id: string) => {
    if (!isLoaded || !isSignedIn) return;
    const token = await getToken();
    await fetch(`http://localhost:5000/api/wishlist/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName: editLocationName,
        locationId: 'tokyo_123', // Keep same ID for now
      }),
    });
    setEditItemId(null);
    setEditLocationName('');
    fetchWishlist();
  };

  useEffect(() => {
    fetchWishlist();
  }, [isLoaded, isSignedIn]);

  return (
    <div>
      <h2>Test Firebase Wishlist</h2>
      <button onClick={addWishlistItem}>Add Wishlist Item</button>
      <button onClick={fetchWishlist}>Get Firestore Data</button>

      <ul>
        {wishlistItems.map((item) => (
          <li key={item.id}>
            {editItemId === item.id ? (
              <>
                <input
                  value={editLocationName}
                  onChange={(e) => setEditLocationName(e.target.value)}
                />
                <button onClick={() => updateItem(item.id)}>Save</button>
                <button onClick={() => setEditItemId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {item.locationName} ({item.locationId})
                <button onClick={() => {
                  setEditItemId(item.id);
                  setEditLocationName(item.locationName);
                }}>
                  Edit
                </button>
                <button onClick={() => deleteItem(item.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
