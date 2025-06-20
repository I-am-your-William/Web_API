import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { clerkMiddleware, requireAuth, getAuth, clerkClient } from '@clerk/express';
import { db } from './lib/firebase.js';
import bookingsRouter from './routes/bookings.js';
import myplanRouter from './routes/myplan.js';
import placesRouter from './routes/places.js';
import axios from 'axios';

dotenv.config();

// Environment variables validation
const requiredEnvVars = [
  'AMADEUS_CLIENT_ID',
  'AMADEUS_CLIENT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`  - ${envVar}`));
  console.error('Please add these to your .env file or hosting platform environment variables');
  process.exit(1);
}

// Amadeus API configuration
let amadeusAccessToken = null;
const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

// Rate limiting variables
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
const RATE_LIMIT_DELAY = 5000; // 5 seconds delay on rate limit

// Function to ensure minimum delay between requests
const enforceRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏱️ Rate limiting: waiting ${delay}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
};

// Function to authenticate with Amadeus API
const authenticateAmadeus = async () => {
  if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
    throw new Error('Missing Amadeus API credentials');
  }

  try {
    const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', {
      grant_type: 'client_credentials',
      client_id: AMADEUS_CLIENT_ID,
      client_secret: AMADEUS_CLIENT_SECRET,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    amadeusAccessToken = response.data.access_token;
    console.log('🔑 Amadeus authentication successful');
    return amadeusAccessToken;
  } catch (error) {
    console.error('❌ Amadeus authentication failed:', error.response?.data || error.message);
    amadeusAccessToken = null;
    throw new Error('Failed to authenticate with Amadeus API: ' + (error.response?.data?.error_description || error.message));
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for both development and production
const allowedOrigins = [
  'http://localhost:5173', // Development
  'http://localhost:3000', // Alternative development port
  process.env.FRONTEND_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/bookings', bookingsRouter);
app.use('/api/myplan', myplanRouter);
app.use('/api/places', placesRouter);
//app.use('/api/flights', flightsRouter); // Old flights router
//app.use('/api/flights', flights2Router); // Using inline endpoint instead for better rate limiting


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

// ✅ Flights search endpoint with rate limiting
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
    // Ensure we have authentication token
    if (!amadeusAccessToken) {
      console.log('🔄 No access token available, authenticating...');
      await authenticateAmadeus();
    }

    if (!amadeusAccessToken) {
      throw new Error('Failed to obtain Amadeus access token');
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
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        // Enforce rate limiting before making the request
        await enforceRateLimit();

        response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
          headers: {
            Authorization: `Bearer ${amadeusAccessToken}`,
          },
          params,
        });
        
        // If successful, break out of the retry loop
        break;
        
      } catch (error) {
        // Handle rate limiting (429 error)
        if (error.response?.status === 429) {
          console.log(`⚠️ Amadeus API Rate Limit hit (attempt ${retryCount + 1}/${maxRetries + 1})`);
          console.log('Rate limit details:', error.response?.data);
          
          if (retryCount < maxRetries) {
            const delay = RATE_LIMIT_DELAY * (retryCount + 1); // Exponential backoff
            console.log(`⏱️ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retryCount++;
            continue;
          } else {
            console.log('❌ Max retries reached for rate limit');
            return res.status(429).json({ 
              error: 'Rate limit exceeded. Please try again later.',
              retryAfter: 30 // suggest 30 seconds
            });
          }
        }
        
        // If token expired, re-authenticate and retry
        if (error.response?.status === 401) {
          console.log('🔄 Access token expired, re-authenticating...');
          await authenticateAmadeus();
          retryCount++;
          continue;
        }
        
        // For other errors, throw immediately
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
    });

    res.json({ data: enrichedFlights });
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

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Authenticate with Amadeus API on startup
  try {
    await authenticateAmadeus();
  } catch (error) {
    console.error('⚠️ Failed to authenticate with Amadeus API on startup:', error.message);
  }
});
