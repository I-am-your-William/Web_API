import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">TravelHub</div>
            <p className="text-slate-400 mb-4">
              Discover amazing places and create unforgettable memories with our travel platform.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="text-slate-400 hover:text-white transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-400 hover:text-white transition-colors">
                  Places
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Flight</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/flight" className="text-slate-400 hover:text-white transition-colors">
                  Book Flights
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="text-slate-400 hover:text-white transition-colors">
                  View Bookings
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-slate-400">© 2024 TravelHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
