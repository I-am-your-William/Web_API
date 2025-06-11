import express from 'express';
import { db } from '../lib/firebase.js';
import { requireAuth, getAuth } from '@clerk/express';

const router = express.Router();

//Add a location to the wishlist
router.post('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const item = { ...req.body, userId };
    const docRef = await db.collection('wishlist').add(item);
    res.status(201).send({ message: 'Location added', id: docRef.id });
  } catch (error) {
    res.status(500).send({ error: 'Failed to add location', details: error.message });
  }
});

// ✅ Get all locations for the logged-in user
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const snapshot = await db.collection('wishlist').where('userId', '==', userId).get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(items);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch bookmarked locations', details: error.message });
  }
});

export default router;
