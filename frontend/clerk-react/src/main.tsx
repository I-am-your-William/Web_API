import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2FwYWJsZS1ib3hlci0xNC5jbGVyay5hY2NvdW50cy5kZXYk'

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

// Determine if we're in production
const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production';

// Debug Clerk configuration
console.log('🔍 Clerk Configuration Debug:', {
  publishableKey: PUBLISHABLE_KEY ? `${PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET',
  currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
  isProduction,
  mode: import.meta.env.MODE
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#000000',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
