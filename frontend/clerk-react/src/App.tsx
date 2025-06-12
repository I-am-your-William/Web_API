// src/App.tsx
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import FirebaseTest from './components/firebasetest';

export default function App() {
  return (
    <>
      <header className="header">
        <h1>Travel Planner</h1>
        <div>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main>
        <SignedIn>
          <FirebaseTest />
        </SignedIn>
      </main>
    </>
  );
}
