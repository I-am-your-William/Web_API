import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { clerkMiddleware, requireAuth, getAuth, clerkClient } from '@clerk/express';
import { db } from './lib/firebase.js';
import bookingsRouter from './routes/bookings.js';
import wishlistRouter from './routes/wishlist.js';




dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/bookings', bookingsRouter);
app.use('/api/wishlist', wishlistRouter);
<<<<<<< Updated upstream
=======
//app.use('/api/flights', flightsRouter);

app.get('/api/flights', async (req, res) => {
  let {
    origin,
    destination,
    departureDate,
    returnDate,
    adults = 1,
    travelClass = 'ECONOMY',
  } = req.query;

  try {
    if (!amadeusAccessToken) {
      await authenticateAmadeus();
    }

    const params = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
      adults,
      travelClass,
      currencyCode: 'MYR',
      max: 10, // increase to allow filtering
    };

    // Clean up null/empty values
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });

    let response;
    try {
      response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
        headers: {
          Authorization: `Bearer ${amadeusAccessToken}`,
        },
        params,
      });
    } catch (error) {
      // If token expired, re-authenticate and retry
      if (error.response?.status === 401) {
        console.log('🔄 Access token expired, re-authenticating...');
        await authenticateAmadeus();
        response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
          headers: {
            Authorization: `Bearer ${amadeusAccessToken}`,
          },
          params,
        });
      } else {
        throw error;
      }
    }

    const rawFlights = response.data.data;

    // 🧠 Remove duplicates by flight.id
    const uniqueFlights = Array.from(new Map(rawFlights.map(f => [f.id, f])).values());

    const enrichedFlights = uniqueFlights.map((flight) => {
      const airlineCodes = new Set();
      const layovers = [];

      flight.itineraries.forEach((itinerary) => {
        itinerary.segments.forEach((segment, index, arr) => {
          airlineCodes.add(segment.carrierCode);

          // ✈️ Calculate layover time
          if (index > 0) {
            const prevArrival = new Date(arr[index - 1].arrival.at);
            const currDeparture = new Date(segment.departure.at);
            const layoverMins = (currDeparture.getTime() - prevArrival.getTime()) / (1000 * 60);
            layovers.push(`${Math.floor(layoverMins / 60)}h ${Math.floor(layoverMins % 60)}m`);
          }
        });
      });

      const baggageAllowances = [];
      flight.travelerPricings?.forEach((tp) => {
        tp.fareDetailsBySegment?.forEach((fareSeg) => {
          const qty = fareSeg.includedCheckedBags?.quantity;
          if (qty != null) baggageAllowances.push(qty);
        });
      });

      return {
        id: flight.id,
        price: flight.price,
        itineraries: flight.itineraries,
        airlineCodes: Array.from(airlineCodes),
        layovers,
        baggageAllowances,
      };
    });    res.json({ data: enrichedFlights });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || error.message;
    
    if (status === 429) {
      console.warn('⚠️ Amadeus API Rate Limit:', message);
      // Return empty data instead of error for rate limits
      res.json({ data: [], rateLimited: true });
    } else {
      console.error('❌ Amadeus API Error:', message);
      res.status(status).json({ error: message });
    }
  }
});

// // Location search: airports or cities
// app.get('/api/locations', async (req, res) => {
//   const { keyword } = req.query;

//   if (!keyword || keyword.length < 2) {
//     return res.status(400).json({ error: 'Keyword too short' });
//   }

//   try {
//     if (!amadeusAccessToken) {
//       await authenticateAmadeus();
//     }

//     const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations', {
//       headers: {
//         Authorization: `Bearer ${amadeusAccessToken}`,
//       },
//       params: {
//         keyword,
//         subType: 'AIRPORT,CITY',
//         page: { limit: 10 }
//       },
//     });

//     res.json(response.data.data || []);
//   } catch (error) {
//     console.error('❌ Location search failed:', error.message);
//     res.status(500).json({ error: 'Location search failed' });
//   }
// });
>>>>>>> Stashed changes


// ✅ Public test route (does NOT require login)
app.get('/', (req, res) => {
  res.send('Clerk Auth Backend is running!');
});

// ✅ Protected route (requires login)
app.get('/protected', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const user = await clerkClient.users.getUser(userId);
  res.json({ user });
});

// ✅ Firestore test route (read/write to Firestore)
app.get('/firestore-test', async (req, res) => {
  try {
    const docRef = db.collection('example').doc('example-document');

    await docRef.set(
      { testMessage: 'Hello from the backend!', updatedAt: new Date() },
      { merge: true }
    );

    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.json(docSnap.data());
    } else {
      res.status(404).json({ message: 'Document does not exist' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/firestore-write', async (req, res) => {
  try {
    const data = req.body || { test: 'Writing the backend' };
    const docRef = db.collection('example').doc('example-document');
    await docRef.set(data, { merge: true });
    res.status(200).json({ message: 'Document written successfully' });
  } catch (err) {
    console.error('Error writing to Firestore:', err);
    res.status(500).json({ error: 'Error writing to Firestore' });
  }
});

app.post('/firestore-create', async (req, res) => {
  try {
    const data = req.body || { test: 'Created new document!' };
    const newDocRef = await db.collection('testCollection').add(data);
    res.status(201).json({ message: 'Document created', id: newDocRef.id });
  } catch (err) {
    console.error('Error creating document:', err);
    res.status(500).json({ error: 'Error creating document' });
  }
});

app.delete('/firestore-delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('testCollection').doc(id).delete();
    res.status(200).json({ message: `Document with ID ${id} deleted.` });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: 'Error deleting document' });
  }
});





app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
