import express from 'express';
import { db } from '../lib/firebase.js';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';


const router = express.Router();
router.use(clerkMiddleware()); 
router.use(requireAuth());

// CREATE ROUTE
router.post('/', requireAuth(), async (req, res) => {
  try {
    const { locationName, locationId } = req.body;
    const { userId } = getAuth(req);

    // Check for duplicate
    const duplicateCheck = await db.collection('wishlist')
      .where('userId', '==', userId)
      .where('locationId', '==', locationId)
      .get();

    if (!duplicateCheck.empty) {
      res.status(409).json({ error: 'Item already in wishlist.' });
      return; // <- valid here
    }

    const newWishlistRef = db.collection('wishlist').doc();
    await newWishlistRef.set({ userId, locationName, locationId });

    res.status(201).json({ id: newWishlistRef.id, message: 'Wishlist item added.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// READ ROUTE
router.get('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const snapshot = await db.collection('wishlist')
      .where('userId', '==', userId)
      .get();

    const wishlistItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(wishlistItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE ROUTE
router.put('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { locationName, locationId } = req.body;
    const { userId } = getAuth(req);

    const docRef = db.collection('wishlist').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (docSnap.data().userId !== userId) {
      return res.status(403).json({ error: 'Not authorised to update this item.' });
    }

    // Duplicate check excluding current doc
    const duplicateCheck = await db.collection('wishlist')
      .where('userId', '==', userId)
      .where('locationId', '==', locationId)
      .get();

    const isDuplicate = duplicateCheck.docs.some(doc => doc.id !== id);
    if (isDuplicate) {
      return res.status(409).json({ error: 'Item already in wishlist.' });
    }

    await docRef.update({ locationName, locationId });
    res.status(200).json({ message: 'Wishlist item updated.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DELETE ROUTE
router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = getAuth(req);

    const docRef = db.collection('wishlist').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (docSnap.data().userId !== userId) {
      return res.status(403).json({ error: 'Not authorised to delete this item.' });
    }

    await docRef.delete();
    res.status(200).json({ message: 'Wishlist item deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




export default router;