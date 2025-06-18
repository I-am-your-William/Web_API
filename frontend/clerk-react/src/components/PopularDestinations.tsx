import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useLocation } from "wouter";

const destinations = [
  {
    id: 1,
    name: "Santorini, Greece",
    description: "Iconic white-washed buildings and stunning sunsets",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    rating: 4.8,
    reviewCount: 2847,
    pricePerNight: 89,
  },
  {
    id: 2,
    name: "Tokyo, Japan",
    description: "Modern metropolis with rich culture and cuisine",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    rating: 4.9,
    reviewCount: 1923,
    pricePerNight: 124,
  },
  {
    id: 3,
    name: "Swiss Alps",
    description: "Majestic mountains perfect for adventure seekers",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    rating: 4.7,
    reviewCount: 956,
    pricePerNight: 156,
  },
  {
    id: 4,
    name: "Bali, Indonesia",
    description: "Tropical paradise with pristine beaches",
    imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    rating: 4.6,
    reviewCount: 1472,
    pricePerNight: 67,
  },
];

export function PopularDestinations() {
  const [, setLocation] = useLocation();

  const handleDestinationClick = (destinationName: string) => {
    setLocation(`/explore?q=${encodeURIComponent(destinationName)}`);
  };

  return (
    <div className="lg:col-span-2">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Recommended Places</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {destinations.map((destination) => (
          <Card
            key={destination.id}
            onClick={() => handleDestinationClick(destination.name)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
          >
            <div className="overflow-hidden">
              <img
                src={destination.imageUrl}
                alt={destination.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {destination.name}
              </h3>
              <p className="text-slate-600 mb-4">{destination.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-slate-900">
                    {destination.rating}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({destination.reviewCount.toLocaleString()})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900">
                    ${destination.pricePerNight}
                  </span>
                  <span className="text-sm text-slate-500">/ night</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
