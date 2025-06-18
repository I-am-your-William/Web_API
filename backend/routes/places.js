import express from 'express';
import axios from 'axios';


const router = express.Router();

router.get('/places', async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ error: 'Missing location (search query) in query parameters' });
    }

    // 1. Use Text Search API with the user's query
    const textSearchRes = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: location,
        key: process.env.GOOGLE_API_KEY,
      },
    });

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

export default router;
