import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { clerkMiddleware, requireAuth, getAuth, clerkClient } from '@clerk/express';
import admin from 'firebase-admin';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
