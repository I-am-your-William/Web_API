<<<<<<< Updated upstream
// src/App.tsx
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import FirebaseTest from './components/firebasetest';
=======
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import FlightSearch from "@/pages/FlightSearch";
import FlightDetails from "@/pages/FlightDetails";
import MyBooking from "@/pages/MyBooking";
import ViewBooking from "@/pages/ViewBooking";
import NotFound from "@/pages/not-found";
>>>>>>> Stashed changes

function Router() {
  return (
<<<<<<< Updated upstream
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
=======
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/flight" component={FlightSearch} />
      <Route path="/flight-details/:id" component={FlightDetails} />
      <Route path="/my-bookings" component={MyBooking} />
      <Route path="/view-booking/:id" component={ViewBooking} />
      <Route component={NotFound} />
    </Switch>
>>>>>>> Stashed changes
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
