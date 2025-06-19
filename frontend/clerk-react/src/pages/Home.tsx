import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { PopularDestinations } from "@/components/PopularDestinations";
import { PlanSmarterPanel } from "@/components/PlanSmarterPanel";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PopularDestinations />
          <PlanSmarterPanel />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
