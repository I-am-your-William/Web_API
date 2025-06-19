// routes/myplan.js
import express from 'express';
import { getAuth } from '@clerk/express';
import { db } from '../lib/firebase.js';

const router = express.Router();

// POST /api/myplan - Save a place to "My Plan"
router.post('/myplan', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Clerk Auth
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name,
      address,
      rating,
      userRatingsTotal,
      location,
      reviews,
      placeId,
      country,
    } = req.body;

    if (!placeId) {
      return res.status(400).json({ error: 'Missing placeId' });
    }

    const data = {
      name,
      address,
      rating,
      userRatingsTotal,
      location,
      reviews,
      placeId,
      country,
      savedAt: new Date(),
    };

    await db.collection('users').doc(userId).collection('myplan').doc(placeId).set(data);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('🔥 Failed to save to MyPlan:', err.message);
    return res.status(500).json({ error: 'Failed to save to MyPlan' });
  }
});


// ✅ NEW: GET /api/myplan - Fetch all saved "My Plan" items for the user
router.get('/myplan', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const snapshot = await db.collection('users').doc(userId).collection('myplan').get();

    const plans = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ plans });
  } catch (err) {
    console.error('🔥 Failed to fetch MyPlan:', err.message);
    return res.status(500).json({ error: 'Failed to fetch MyPlan' });
  }
});

// DELETE /api/myplan/:placeId - Remove a saved place
router.delete('/myplan/:placeId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const placeId = req.params.placeId;
    if (!placeId) {
      return res.status(400).json({ error: 'Missing placeId' });
    }

    await db.collection('users').doc(userId).collection('myplan').doc(placeId).delete();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('🔥 Failed to delete from MyPlan:', err.message);
    return res.status(500).json({ error: 'Failed to delete from MyPlan' });
  }
});

export default router;
