import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Explore() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q') || '';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Explore Destinations</h1>
          {searchQuery && (
            <p className="text-xl text-slate-600 mb-8">
              Searching for: <span className="font-semibold text-primary">{searchQuery}</span>
            </p>
          )}
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <p className="text-slate-600">
              Map and location details page is under development by your teammate.
            </p>
            <p className="text-slate-600 mt-2">
              This page will display interactive maps and detailed location information.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}