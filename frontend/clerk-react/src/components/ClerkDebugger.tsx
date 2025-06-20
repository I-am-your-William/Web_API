import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';

export function ClerkDebugger() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    console.log('🔍 Clerk Auth Debug:', {
      isLoaded,
      isSignedIn,
      userId,
      userEmail: user?.emailAddresses?.[0]?.emailAddress || 'N/A',
      sessionId: user?.id || 'N/A',
      currentURL: window.location.href,
      origin: window.location.origin,
      hostname: window.location.hostname,
      publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 
        `${import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET'
    });
  }, [isLoaded, isSignedIn, userId, user]);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50 max-w-xs">
      <div>🔍 Debug:</div>
      <div>Loaded: {isLoaded ? '✅' : '❌'}</div>
      <div>Signed In: {isSignedIn ? '✅' : '❌'}</div>
      <div>User ID: {userId || 'None'}</div>
      <div>Email: {user?.emailAddresses?.[0]?.emailAddress || 'None'}</div>
    </div>
  );
}
