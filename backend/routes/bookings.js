import express from 'express';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import { db } from '../lib/firebase.js';


const router = express.Router();
router.use(clerkMiddleware());

// === FLIGHT BOOKING ===
// POST /api/bookings/flights
router.post('/flights', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    console.log('🧾 userId from Clerk:', userId);
    console.log('📨 Request Body:', req.body);

    const { flightId, passengerDetails, flightDetails, contactInfo, selectedExtras,totalPrice } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: userId is missing' });
    }

    if (!flightId || !Array.isArray(passengerDetails) || !flightDetails) {
      return res.status(400).json({ error: 'Missing required flight booking data.' });
    }

    const bookingId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const bookingData = {
      bookingId,
      userId,
      flightId,
      passengers: passengerDetails,
      primaryContact: {
        email: contactInfo.primaryEmail,
        phone: contactInfo.primaryPhone,
      },
      emergencyContact: {
        name: contactInfo.emergencyContactName,
        phone: contactInfo.emergencyContactPhone,
        relation: contactInfo.emergencyContactRelation,
      },
      extras: selectedExtras || [], // Default to an empty array if undefined
      totalPrice: totalPrice || 0, // Default to 0 if undefined
      flightDetails,
      createdAt: new Date().toISOString(),
      type: 'flight'
    };

    console.log('📦 Booking Data:', bookingData);

    await db.collection('users').doc(userId).collection('bookings').doc(bookingId).set(bookingData);
    await db.collection('bookings').doc(bookingId).set(bookingData);

    res.status(201).json({ message: 'Flight booking successful', bookingId });
  } catch (err) {
    console.error('🔥 Booking failed:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to create flight booking.' });
  }
});


// === LOCATION BOOKING (Existing Code) ===
router.post('/', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { locationName, bookingDate, startDate, endDate } = req.body;

  try {
    const duplicateCheck = await db.collection('bookings')
      .where('userId', '==', userId)
      .where('locationName', '==', locationName)
      .where('startDate', '==', startDate)
      .get();

    if (!duplicateCheck.empty) {
      return res.status(409).json({ error: 'Booking already exists for this location and date.' });
    }

    const newBooking = { userId, locationName, bookingDate, startDate, endDate, type: 'location' };
    const docRef = await db.collection('bookings').add(newBooking);

    res.status(201).json({ id: docRef.id, ...newBooking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// === READ ALL USER BOOKINGS ===
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

/**
 * === FETCH PRIMARY CONTACT, EMERGENCY CONTACT, AND EXTRAS FOR A BOOKING ===
 * GET /api/bookings/:id/contacts
 */
router.get('/:id/contacts', requireAuth(), async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('bookings').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const data = doc.data();
    res.json({
      primaryContact: data.primaryContact || null,
      emergencyContact: data.emergencyContact || null,
      extras: data.extras || [],
      totalPrice: data.totalPrice || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts and extras.' });
  }
});

// === UPDATE LOCATION BOOKING ===
router.put('/:id', requireAuth(), async (req, res) => {
  const { id } = req.params;
  const { locationName, bookingDate, startDate, endDate } = req.body;
  const { userId } = getAuth(req);

  try {
    const docRef = db.collection('bookings').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return res.status(404).json({ error: 'Booking not found.' });
    if (docSnap.data().userId !== userId) return res.status(403).json({ error: 'Not authorised to update this booking.' });

    const duplicateCheck = await db.collection('bookings')
      .where('userId', '==', userId)
      .where('locationName', '==', locationName)
      .where('startDate', '==', startDate)
      .get();

    const isDuplicate = duplicateCheck.docs.some(doc => doc.id !== id);
    if (isDuplicate) return res.status(409).json({ error: 'Duplicate booking exists.' });

    await docRef.update({ locationName, bookingDate, startDate, endDate });
    res.json({ message: 'Booking updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking.' });
  }
});

// === DELETE BOOKING ===
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

// === TEST ROUTE ===
router.get('/test', (req, res) => {
  res.json({ message: 'Bookings router works!' });
});

export default router;
