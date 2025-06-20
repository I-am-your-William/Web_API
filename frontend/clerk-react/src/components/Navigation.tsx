import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link } from 'wouter';

export function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1">
            <Link href="/" className="text-2xl font-bold text-primary">TravelHub</Link>
            <div className="hidden md:flex flex-1 justify-center space-x-16 ml-8">
              <Link href="/explore" className="text-slate-600 hover:text-primary font-medium transition-colors">
                Explore
              </Link>
              <Link href="/flight" className="text-slate-600 hover:text-primary font-medium transition-colors">
                Flights
              </Link>
              <SignedIn>
                <Link href="/my-bookings" className="text-slate-600 hover:text-primary font-medium transition-colors">
                  My Bookings
                </Link>

                <Link href="/wishlist" className="text-slate-600 hover:text-primary font-medium transition-colors">
                  Wishlist
                </Link>
              </SignedIn>
            </div>
          </div>          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal" fallbackRedirectUrl="/" />
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
