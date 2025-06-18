import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { clerkMiddleware, requireAuth, getAuth, clerkClient } from '@clerk/express';
import { db } from './lib/firebase.js';
import bookingsRouter from './routes/bookings.js';
import wishlistRouter from './routes/wishlist.js';
import flightsRouter from './routes/flights.js';
import flights2Router from './routes/flights2.js';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/bookings', bookingsRouter);
app.use('/api/wishlist', wishlistRouter);
//app.use('/api/flights', flightsRouter);
app.use('/api/flights', flights2Router);


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





app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
