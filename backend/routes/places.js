import express from 'express';
import axios from 'axios';


const router = express.Router();

// Get places by text search
router.get('/', async (req, res) => {
  try {
    const { location } = req.query;
    console.log('🔍 Places search request for:', location);

    if (!location) {
      return res.status(400).json({ error: 'Missing location (search query) in query parameters' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ Missing GOOGLE_API_KEY in environment variables');
      return res.status(500).json({ error: 'Google API key not configured' });
    }

    console.log('🔑 Using Google API key:', process.env.GOOGLE_API_KEY ? 'Present' : 'Missing');

    // 1. Use Text Search API with the user's query
    console.log('📡 Making request to Google Places Text Search API...');
    const textSearchRes = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: location,
        key: process.env.GOOGLE_API_KEY,
      },
    });

    console.log('📊 Google API response status:', textSearchRes.data.status);
    console.log('📍 Found', textSearchRes.data.results?.length || 0, 'results');

    if (textSearchRes.data.status !== 'OK') {
      console.error('❌ Google API error:', textSearchRes.data.error_message || textSearchRes.data.status);
      return res.status(500).json({ 
        error: 'Google Places API error', 
        details: textSearchRes.data.error_message || textSearchRes.data.status 
      });
    }

    const results = textSearchRes.data.results;

    // 2. For each result, fetch place details (rating, reviews, etc.)
    const places = await Promise.all(
      results.slice(0, 5).map(async (place) => {
        const detailsRes = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
          params: {
            place_id: place.place_id,
            fields: 'name,rating,user_ratings_total,formatted_address,geometry,photos,review',
            key: process.env.GOOGLE_API_KEY,
          },
        });

        const details = detailsRes.data.result;

        return {
          name: details.name,
          rating: details.rating,
          userRatingsTotal: details.user_ratings_total,
          address: details.formatted_address,
          placeId: place.place_id,
          location: details.geometry.location,
          photoRef: place.photos?.[0]?.photo_reference ?? null,
          reviews: (details.reviews || []).slice(0, 3).map((review) => ({
            author: review.author_name,
            text: review.text,
            rating: review.rating,
            time: review.relative_time_description,
          })),
        };
      })
    );

    res.json({ places });
  } catch (err) {
    console.error('Google Places API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch places using text search' });
  }
});

// Get place details by place ID
router.get('/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    console.log('🏢 Place details request for ID:', placeId);

    if (!placeId) {
      return res.status(400).json({ error: 'Missing place ID in URL parameters' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ Missing GOOGLE_API_KEY in environment variables');
      return res.status(500).json({ error: 'Google API key not configured' });
    }

    console.log('📡 Making request to Google Places Details API...');
    const detailsRes = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,rating,user_ratings_total,formatted_address,geometry,photos,reviews',
        key: process.env.GOOGLE_API_KEY,
      },
    });

    console.log('📊 Google API response status:', detailsRes.data.status);

    if (detailsRes.data.status !== 'OK') {
      console.error('❌ Google API error:', detailsRes.data.error_message || detailsRes.data.status);
      return res.status(404).json({ 
        error: 'Place not found', 
        details: detailsRes.data.error_message || detailsRes.data.status 
      });
    }

    const details = detailsRes.data.result;
    console.log('✅ Successfully fetched place details for:', details.name);

    const place = {
      name: details.name,
      rating: details.rating,
      userRatingsTotal: details.user_ratings_total,
      address: details.formatted_address,
      placeId: placeId,
      location: details.geometry.location,
      photoRef: details.photos?.[0]?.photo_reference,
      reviews: (details.reviews || []).slice(0, 5).map((review) => ({
        author: review.author_name,
        text: review.text,
        rating: review.rating,
        time: review.relative_time_description,
      })),
    };

    res.json({ place });
  } catch (err) {
    console.error('❌ Google Places Details API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

export default router;
