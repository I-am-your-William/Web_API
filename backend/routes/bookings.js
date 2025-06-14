import express from 'express';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import { db } from '../lib/firebase.js';

const router = express.Router();
router.use(clerkMiddleware()); 


// CREATE Route
router.post('/', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { locationName, bookingDate, startDate, endDate } = req.body;

  try {
    // Duplicate check
    const duplicateCheck = await db.collection('bookings')
      .where('userId', '==', userId)
      .where('locationName', '==', locationName)
      .where('startDate', '==', startDate)
      .get();

    if (!duplicateCheck.empty) {
      res.status(409).json({ error: 'Booking already exists for this location and date.' });
      return; // <- valid here
    }

    const newBooking = { userId, locationName, bookingDate, startDate, endDate };
    const docRef = await db.collection('bookings').add(newBooking);

    res.status(201).json({ id: docRef.id, ...newBooking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});



// READ ROUTE
router.get('/', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const snapshot = await db.collection('bookings').where('userId', '==', userId).get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// UPDATE ROUTE
router.put('/:id', requireAuth(), async (req, res) => {
  const { id } = req.params;
  const { locationName, bookingDate, startDate, endDate } = req.body;
  const { userId } = getAuth(req);

  try {
    const docRef = db.collection('bookings').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (docSnap.data().userId !== userId) {
      return res.status(403).json({ error: 'Not authorised to update this booking.' });
    }

    // Duplicate check excluding current doc
    const duplicateCheck = await db.collection('bookings')
      .where('userId', '==', userId)
      .where('locationName', '==', locationName)
      .where('startDate', '==', startDate)
      .get();

    const isDuplicate = duplicateCheck.docs.some(doc => doc.id !== id);
    if (isDuplicate) {
      return res.status(409).json({ error: 'Booking already exists for this location and date.' });
    }

    await docRef.update({ locationName, bookingDate, startDate, endDate });
    res.json({ message: 'Booking updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking.' });
  }
});


// DELETE ROUTE
router.delete('/:id', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { id } = req.params;

  try {
    const docRef = db.collection('bookings').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists || docSnap.data().userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized or booking not found.' });
    }

    await docRef.delete();
    res.json({ message: 'Booking deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking.' });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Bookings router works!' });
});





export default router;
