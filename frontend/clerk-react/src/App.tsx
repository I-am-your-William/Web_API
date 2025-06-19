import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import FlightSearch from "@/pages/FlightSearch";
import FlightDetails from "@/pages/FlightDetails";
import MyBooking from "@/pages/MyBooking";
import ViewBooking from "@/pages/ViewBooking";
import SearchPlace from "@/pages/SearchPlace";
import PlaceDetails from "@/pages/PlaceDetails";

import Wishlist from "@/pages/Wishlist";
import WishlistDetails from "@/pages/WishlistDetails";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={SearchPlace} />
      <Route path="/flight" component={FlightSearch} />
      <Route path="/flight-details/:id" component={FlightDetails} />
      <Route path="/my-bookings" component={MyBooking} />
      <Route path="/view-booking/:id" component={ViewBooking} />
      <Route path="/search-place" component={SearchPlace} />
      <Route path="/place-details/:id" component={PlaceDetails} />
      <Route path="/details/:id" component={PlaceDetails} />

      <Route path="/wishlist" component={Wishlist} />
      <Route path="/wishlist-details/:id" component={WishlistDetails} />
      <Route component={NotFound} />
    </Switch>
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
