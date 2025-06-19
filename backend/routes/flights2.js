// routes/flights2.js

import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

let amadeusAccessToken = '';

// Authenticate with Amadeus API
async function authenticateAmadeus() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", process.env.AMADEUS_CLIENT_ID);
  params.append("client_secret", process.env.AMADEUS_CLIENT_SECRET);

  const response = await axios.post("https://test.api.amadeus.com/v1/security/oauth2/token", params);
  amadeusAccessToken = response.data.access_token;
}

// GET /api/flights
router.get('/', async (req, res) => {
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
      max: 10,
    };

    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });

    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: {
        Authorization: `Bearer ${amadeusAccessToken}`,
      },
      params,
    });

    const rawFlights = response.data.data;

    const uniqueFlights = Array.from(new Map(rawFlights.map(f => [f.id, f])).values());

    const enrichedFlights = uniqueFlights.map((flight) => {
      const airlineCodes = new Set();
      const layovers = [];

      flight.itineraries.forEach((itinerary) => {
        itinerary.segments.forEach((segment, index, arr) => {
          airlineCodes.add(segment.carrierCode);

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
    console.error('❌ Amadeus API Error:', message);
    res.status(status).json({ error: message });
  }
});

export default router;
