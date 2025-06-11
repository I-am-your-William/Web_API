// routes/bookings.js
import express from 'express';
import { db } from '../lib/firebase.js'; 
import { requireAuth, getAuth } from '@clerk/express';

const router = express.Router();

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const booking = { ...req.body, userId };
    const docRef = await db.collection('bookings').add(booking);
    res.status(201).send({ message: 'Booking added', id: docRef.id });
  } catch (error) {
    res.status(500).send({ error: 'Failed to add booking', details: error.message });
  }
});

export default router;
