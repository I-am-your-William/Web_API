import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import {
  Search,
  Plane,
  Clock,
  Users,
  Calendar,
  MapPin,
  ArrowRight,
  Luggage,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"


interface FlightOffer {
  id: string
  price: {
    total: string
  }
  itineraries: {
    segments: {
      departure: { iataCode: string; at: string }
      arrival: { iataCode: string; at: string }
      carriers?: string
      carrierCode?: string
      aircraft?: { code: string }
      duration?: string
    }[]
  }[]
  travelerPricings?: {
    fareDetailsBySegment?: {
      includedCheckedBags?: {
        weight?: number
      }
    }[]
  }[]
}

const airports = [
  { code: "KUL", name: "Kuala Lumpur International Airport" },
  { code: "NRT", name: "Narita International Airport" },
  { code: "SIN", name: "Changi Airport" },
  { code: "PEN", name: "Penang International Airport" },
  { code: "HND", name: "Haneda Airport" },
  { code: "BKK", name: "Suvarnabhumi Airport" },
  { code: "HKG", name: "Hong Kong International Airport" },
  { code: "ICN", name: "Incheon International Airport" },
  { code: "MNL", name: "Ninoy Aquino International Airport" },
  { code: "CGK", name: "Soekarno–Hatta International Airport" },
  { code: "DPS", name: "Ngurah Rai International Airport" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport" },
  { code: "DEL", name: "Indira Gandhi International Airport" },
  { code: "DOH", name: "Hamad International Airport" },
  { code: "DXB", name: "Dubai International Airport" },
  { code: "CDG", name: "Charles de Gaulle Airport" },
  { code: "JFK", name: "John F. Kennedy International Airport" },
  { code: "LHR", name: "London Heathrow Airport" },
  { code: "LAX", name: "Los Angeles International Airport" },
  { code: "ORD", name: "O'Hare International Airport" },
  { code: "FRA", name: "Frankfurt Airport" },
  { code: "AMS", name: "Amsterdam Airport Schiphol" },
  { code: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport" },
  { code: "BCN", name: "Barcelona–El Prat Airport" },
  { code: "ZRH", name: "Zurich Airport" },
  { code: "VIE", name: "Vienna International Airport" },
  { code: "IST", name: "Istanbul Airport" },
  { code: "TLV", name: "Ben Gurion Airport" },
  { code: "CAI", name: "Cairo International Airport" },
  { code: "RUH", name: "King Khalid International Airport" },
  { code: "JED", name: "King Abdulaziz International Airport" },
  { code: "KWI", name: "Kuwait International Airport" },
  { code: "MCT", name: "Muscat International Airport" },
  { code: "BAH", name: "Bahrain International Airport" },
  { code: "KTM", name: "Tribhuvan International Airport" },
  { code: "DAC", name: "Hazrat Shahjalal International Airport" },
  { code: "CMB", name: "Bandaranaike International Airport" },
  { code: "MLE", name: "Velana International Airport" },
  { code: "PNH", name: "Phnom Penh International Airport" },
  { code: "REP", name: "Siem Reap International Airport" },
  { code: "SGN", name: "Tan Son Nhat International Airport" },
  { code: "HAN", name: "Noi Bai International Airport" },
  { code: "DAD", name: "Da Nang International Airport" },
  { code: "DMK", name: "Don Mueang International Airport" },
  { code: "CNX", name: "Chiang Mai International Airport" },
  { code: "KBV", name: "Krabi International Airport" },
  { code: "HKT", name: "Phuket International Airport" },
  { code: "KIX", name: "Kansai International Airport" },
  { code: "PVG", name: "Shanghai Pudong International Airport" },
  { code: "PEK", name: "Beijing Capital International Airport" },
  { code: "CAN", name: "Guangzhou Baiyun International Airport" },
  { code: "SYD", name: "Sydney Kingsford Smith Airport" },
  { code: "MEL", name: "Melbourne Airport" },
  { code: "BNE", name: "Brisbane Airport" },
  { code: "AKL", name: "Auckland Airport" },
  { code: "YYZ", name: "Toronto Pearson International Airport" },
  { code: "YVR", name: "Vancouver International Airport" },
  { code: "SFO", name: "San Francisco International Airport" },
  { code: "SEA", name: "Seattle–Tacoma International Airport" },
  { code: "DEN", name: "Denver International Airport" },
  { code: "ATL", name: "Hartsfield–Jackson Atlanta International Airport" },
  { code: "MIA", name: "Miami International Airport" },
  { code: "BOS", name: "Logan International Airport" },
]

const travelClassOptions = [
  { value: "ECONOMY", label: "Economy", icon: "💺" },
  { value: "PREMIUM_ECONOMY", label: "Premium Economy", icon: "🛋️" },
  { value: "BUSINESS", label: "Business", icon: "💼" },
  { value: "FIRST", label: "First Class", icon: "👑" },
]

const passengerOptions = Array.from({ length: 9 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1} Passenger${i > 0 ? "s" : ""}`,
}))

function AirportCombobox({
  value,
  onValueChange,
  placeholder,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? airports.find((airport) => airport.code === value)?.name || value : placeholder}
          <MapPin className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No airport found.</CommandEmpty>
            <CommandGroup>
              {airports.map((airport) => (
                <CommandItem
                  key={airport.code}
                  value={airport.code}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{airport.name}</span>
                    <span className="text-sm text-muted-foreground">{airport.code}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const FlightSearch: React.FC = () => {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [departureDate, setDepartureDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [passengers, setPassengers] = useState("1")
  const [travelClass, setTravelClass] = useState("ECONOMY")
  const [flights, setFlights] = useState<FlightOffer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const searchFlights = async () => {
    if (!origin || !destination || !departureDate) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        origin,
        destination,
        departureDate,
        returnDate,
        passengers,
        travelClass,
      })

      const response = await fetch(`http://localhost:5000/api/flights?${params.toString()}`);
      if (!response.ok) throw new Error('Flight search failed');
      const data = await response.json();
      setFlights(data.data || []);
      sessionStorage.setItem('flightSearchResults', JSON.stringify(data.data || []));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const formatDuration = (duration?: string) => {
    if (!duration) return "N/A"
    return duration.replace("PT", "").replace("H", "h ").replace("M", "m").toLowerCase()
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }
  }

  const calculateLayover = (prevArrival: string, nextDeparture: string) => {
    const layoverMinutes = Math.floor((new Date(nextDeparture).getTime() - new Date(prevArrival).getTime()) / 60000)
    const hours = Math.floor(layoverMinutes / 60)
    const minutes = layoverMinutes % 60
    return `${hours}h ${minutes}m`
  }

  // Load cached values
  useEffect(() => {
    const cached = sessionStorage.getItem('flightSearchResults');
    if (cached) setFlights(JSON.parse(cached));

    const cachedOrigin = sessionStorage.getItem('origin');
    const cachedDestination = sessionStorage.getItem('destination');
    const cachedDepartureDate = sessionStorage.getItem('departureDate');
    const cachedReturnDate = sessionStorage.getItem('returnDate');
    const cachedPassengers = sessionStorage.getItem('passengers');
    const cachedTravelClass = sessionStorage.getItem('travelClass');

    if (cachedOrigin) setOrigin(cachedOrigin);
    if (cachedDestination) setDestination(cachedDestination);
    if (cachedDepartureDate) setDepartureDate(cachedDepartureDate);
    if (cachedReturnDate) setReturnDate(cachedReturnDate);
    if (cachedPassengers) setPassengers(cachedPassengers);
    if (cachedTravelClass) setTravelClass(cachedTravelClass);
  }, []);

  // Sync state with sessionStorage
  useEffect(() => {
    sessionStorage.setItem('origin', origin);
  }, [origin]);

  useEffect(() => {
    sessionStorage.setItem('destination', destination);
  }, [destination]);

  useEffect(() => {
    sessionStorage.setItem('departureDate', departureDate);
  }, [departureDate]);

  useEffect(() => {
    sessionStorage.setItem('returnDate', returnDate);
  }, [returnDate]);

  useEffect(() => {
    sessionStorage.setItem('passengers', passengers);
  }, [passengers]);

  useEffect(() => {
    sessionStorage.setItem('travelClass', travelClass);
  }, [travelClass]);


  // (Removed duplicate searchFlights function to avoid redeclaration error)


  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Find Your Perfect Flight</h1>
        <p className="text-xl text-muted-foreground">Search and compare flights from hundreds of airlines</p>
      </div>

      {/* Search Form */}
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Flight Search
          </CardTitle>
          <CardDescription>Enter your travel details to find the best flights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">From</Label>
              <AirportCombobox value={origin} onValueChange={setOrigin} placeholder="Select departure airport" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">To</Label>
              <AirportCombobox
                value={destination}
                onValueChange={setDestination}
                placeholder="Select destination airport"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Departure
              </Label>
              <Input
                id="departure-date"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Return (Optional)
              </Label>
              <Input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departureDate || new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Passengers
              </Label>
              <Select value={passengers} onValueChange={setPassengers}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {passengerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={travelClass} onValueChange={setTravelClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {travelClassOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={searchFlights}
            disabled={loading}
            className="w-full md:w-auto text-black dark:text-white"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching Flights...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Flights
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {flights.length > 0 && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Flight Results</h2>
            <Badge variant="secondary">{flights.length} flights found</Badge>
          </div>
        )}

        {flights.map((flight) => (
          <Card key={flight.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Flight Info */}
                <div className="flex-1 space-y-4">
                  {flight.itineraries.map((itinerary, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Plane className="h-4 w-4" />
                        <span>{idx === 0 ? "Outbound" : "Return"}</span>
                      </div>

                      {itinerary.segments.map((segment, segIdx) => {
                        const departure = formatDateTime(segment.departure.at)
                        const arrival = formatDateTime(segment.arrival.at)

                        return (
                          <div key={segIdx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold">{departure.time}</div>
                                  <div className="text-sm text-muted-foreground">{segment.departure.iataCode}</div>
                                  <div className="text-xs text-muted-foreground">{departure.date}</div>
                                </div>

                                <div className="flex flex-col items-center gap-1 min-w-[100px]">
                                  <div className="text-xs text-muted-foreground">
                                    {formatDuration(segment.duration)}
                                  </div>
                                  <div className="w-full h-px bg-border relative">
                                    <ArrowRight className="h-4 w-4 absolute -top-2 left-1/2 transform -translate-x-1/2 bg-background" />
                                  </div>
                                  <div className="text-xs text-muted-foreground">Direct</div>
                                </div>

                                <div className="text-center">
                                  <div className="text-2xl font-bold">{arrival.time}</div>
                                  <div className="text-sm text-muted-foreground">{segment.arrival.iataCode}</div>
                                  <div className="text-xs text-muted-foreground">{arrival.date}</div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span>{segment.carrierCode}</span>
                              </div>
                              {segment.aircraft && <div>Aircraft: {segment.aircraft.code}</div>}
                            </div>

                            {/* Layover */}
                            {segIdx < itinerary.segments.length - 1 && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Layover:{" "}
                                  {calculateLayover(segment.arrival.at, itinerary.segments[segIdx + 1].departure.at)}{" "}
                                  at {segment.arrival.iataCode}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>

                  {/* Baggage Info */}
                  {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Luggage className="h-4 w-4" />
                      <span>
                        Baggage: {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weight} kg
                        included
                      </span>
                    </div>
                  )}
                </div>

                {/* Price and Book */}
                <div className="lg:text-right space-y-3">
                  <div>
                    <div className="text-3xl font-bold">MYR {flight.price.total}</div>
                    <div className="text-sm text-muted-foreground">per person</div>
                    <Button
                      size="lg"
                      className="w-full lg:w-auto text-black dark:text-white"
                      onClick={() => navigate(`/flights/${flight.id}`, { state: { flight } })}
                    >
                      Select Flight
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))};

        {!loading && flights.length === 0 && origin && destination && (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No flights found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or dates to find more options.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FlightSearch

// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import CreatableSelect from 'react-select/creatable';
// import { useNavigate } from 'react-router-dom';
// //import airports from './airports.json'; // Make sure you import your airports list

// interface FlightOffer {
//   id: string;
//   price: { total: string };
//   itineraries: {
//     segments: {
//       departure: { iataCode: string; at: string };
//       arrival: { iataCode: string; at: string };
//       carriers?: string;
//       aircraft?: { code: string };
//       duration?: string;
//     }[];
//   }[];
//   travelerPricings?: {
//     fareDetailsBySegment?: {
//       includedCheckedBags?: { weight?: number };
//     }[];
//   }[];
// }

// // interface FlightOffer {
// //   id: string;
// //   price: {
// //     total: string;
// //   };
// //   itineraries: {
// //     segments: {
// //       departure: {
// //         iataCode: string;
// //         at: string;
// //       };
// //       arrival: {
// //         iataCode: string;
// //         at: string;
// //       };
// //       carrierCode: string; // added explicitly if needed
// //       aircraft?: {
// //         code: string;
// //       };
// //       duration?: string;
// //     }[];
// //   }[];
// //   travelerPricings?: {
// //     fareDetailsBySegment?: {
// //       includedCheckedBags?: {
// //         weight?: number;
// //         quantity?: number;
// //       };
// //     }[];
// //   }[];
// //   airlineCodes: {
// //     code: string;
// //     name: string;
// //   }[];
// //   aircraftCodes: {
// //     code: string;
// //     name: string;
// //   }[];
// //   layovers: string[];
// //   baggageAllowances: number[];
// // }


// // const airportOptions = airports.map((airport) => ({
// //   value: airport.code,
// //   label: `${airport.name} (${airport.code})`,
// // }));
// const airportOptions = [
//   { value: 'KUL', label: 'Kuala Lumpur International Airport (KUL)' },
//   { value: 'NRT', label: 'Narita International Airport (NRT)' },
//   { value: 'SIN', label: 'Changi Airport (SIN)' },
//   { value: 'PEN', label: 'Penang International Airport (PEN)' },
//   { value: 'HND', label: 'Haneda Airport (HND)' },
//   { value: 'BKK', label: 'Suvarnabhumi Airport (BKK)' },
//   { value: 'HKG', label: 'Hong Kong International Airport (HKG)' },
//   { value: 'ICN', label: 'Incheon International Airport (ICN)' },
//   { value: 'MNL', label: 'Ninoy Aquino International Airport (MNL)' },
//   { value: 'CGK', label: 'Soekarno–Hatta International Airport (CGK)' },
//   { value: 'DPS', label: 'Ngurah Rai International Airport (DPS)' },
//   { value: 'BOM', label: 'Chhatrapati Shivaji Maharaj International Airport (BOM)' },
//   { value: 'DEL', label: 'Indira Gandhi International Airport (DEL)' },
//   { value: 'DOH', label: 'Hamad International Airport (DOH)' },
//   { value: 'DXB', label: 'Dubai International Airport (DXB)' },
//   { value: 'CDG', label: 'Charles de Gaulle Airport (CDG)' },
//   { value: 'JFK', label: 'John F. Kennedy International Airport (JFK)' },
//   { value: 'LHR', label: 'London Heathrow Airport (LHR)' },
//   { value: 'LAX', label: 'Los Angeles International Airport (LAX)' },
//   { value: 'ORD', label: 'O’Hare International Airport (ORD)' },
//   { value: 'FRA', label: 'Frankfurt Airport (FRA)' },
//   { value: 'AMS', label: 'Amsterdam Airport Schiphol (AMS)' },
//   { value: 'MAD', label: 'Adolfo Suárez Madrid–Barajas Airport (MAD)' },
//   { value: 'BCN', label: 'Barcelona–El Prat Airport (BCN)' },
//   { value: 'ZRH', label: 'Zurich Airport (ZRH)' },
//   { value: 'VIE', label: 'Vienna International Airport (VIE)' },
//   { value: 'IST', label: 'Istanbul Airport (IST)' },
//   { value: 'TLV', label: 'Ben Gurion Airport (TLV)' },
//   { value: 'CAI', label: 'Cairo International Airport (CAI)' },
//   { value: 'RUH', label: 'King Khalid International Airport (RUH)' },
//   { value: 'JED', label: 'King Abdulaziz International Airport (JED)' },
//   { value: 'KWI', label: 'Kuwait International Airport (KWI)' },
//   { value: 'MCT', label: 'Muscat International Airport (MCT)' },
//   { value: 'BAH', label: 'Bahrain International Airport (BAH)' },
//   { value: 'KTM', label: 'Tribhuvan International Airport (KTM)' },
//   { value: 'DAC', label: 'Hazrat Shahjalal International Airport (DAC)' },
//   { value: 'CMB', label: 'Bandaranaike International Airport (CMB)' },
//   { value: 'MLE', label: 'Velana International Airport (MLE)' },
//   { value: 'PNH', label: 'Phnom Penh International Airport (PNH)' },
//   { value: 'REP', label: 'Siem Reap International Airport (REP)' },
//   { value: 'SGN', label: 'Tan Son Nhat International Airport (SGN)' },
//   { value: 'HAN', label: 'Noi Bai International Airport (HAN)' },
//   { value: 'DAD', label: 'Da Nang International Airport (DAD)' },
//   { value: 'HUI', label: 'Phu Bai International Airport (HUI)' },
//   { value: 'KOS', label: 'Sihanoukville International Airport (KOS)' },
//   { value: 'LPQ', label: 'Luang Prabang International Airport (LPQ)' },
//   { value: 'VTE', label: 'Wattay International Airport (VTE)' },
//   { value: 'RNO', label: 'Reno-Tahoe International Airport (RNO)' },
//   { value: 'LAS', label: 'McCarran International Airport (LAS)' },
//   { value: 'PHX', label: 'Phoenix Sky Harbor International Airport (PHX)' },
//   { value: 'SEA', label: 'Seattle–Tacoma International Airport (SEA)' },
//   { value: 'SFO', label: 'San Francisco International Airport (SFO)' },
//   { value: 'DEN', label: 'Denver International Airport (DEN)' },
//   { value: 'ATL', label: 'Hartsfield–Jackson Atlanta International Airport (ATL)' },
//   { value: 'MIA', label: 'Miami International Airport (MIA)' },
//   { value: 'BOS', label: 'Logan International Airport (BOS)' },
//   { value: 'IAD', label: 'Washington Dulles International Airport (IAD)' },
//   { value: 'YYZ', label: 'Toronto Pearson International Airport (YYZ)' },
//   { value: 'YVR', label: 'Vancouver International Airport (YVR)' },
//   { value: 'YUL', label: 'Montréal–Trudeau International Airport (YUL)' },
//   { value: 'SYD', label: 'Sydney Kingsford Smith Airport (SYD)' },
//   { value: 'MEL', label: 'Melbourne Airport (MEL)' },
//   { value: 'BNE', label: 'Brisbane Airport (BNE)' },
//   { value: 'AKL', label: 'Auckland Airport (AKL)' },
//   { value: 'WLG', label: 'Wellington International Airport (WLG)' },
//   { value: 'CHC', label: 'Christchurch International Airport (CHC)' },
//   { value: 'ADL', label: 'Adelaide Airport (ADL)' },
//   { value: 'PER', label: 'Perth Airport (PER)' },
//   { value: 'DRW', label: 'Darwin International Airport (DRW)' },
//   { value: 'OOL', label: 'Gold Coast Airport (OOL)' },
//   { value: 'HBA', label: 'Hobart International Airport (HBA)' },
//   { value: 'TSV', label: 'Townsville Airport (TSV)' },
//   { value: 'CNS', label: 'Cairns Airport (CNS)' },
//   { value: 'KIX', label: 'Kansai International Airport (KIX)' },
//   { value: 'KUN', label: 'Kunming Changshui International Airport (KUN)' },
//   { value: 'PVG', label: 'Shanghai Pudong International Airport (PVG)' },
//   { value: 'PEK', label: 'Beijing Capital International Airport (PEK)' },
//   { value: 'CAN', label: 'Guangzhou Baiyun International Airport (CAN)' },
//   { value: 'CTU', label: 'Chengdu Shuangliu International Airport (CTU)' },
//   { value: 'SHA', label: 'Shanghai Hongqiao International Airport (SHA)' },
//   { value: 'HGH', label: 'Hangzhou Xiaoshan International Airport (HGH)' },
//   { value: 'SZX', label: 'Shenzhen Bao’an International Airport (SZX)' },
//   { value: 'XIY', label: 'Xi’an Xianyang International Airport (XIY)' },
//   { value: 'CKG', label: 'Chongqing Jiangbei International Airport (CKG)' },
//   { value: 'NKG', label: 'Nanjing Lukou International Airport (NKG)' },
//   { value: 'WUH', label: 'Wuhan Tianhe International Airport (WUH)' },
//   { value: 'TAO', label: 'Qingdao Liuting International Airport (TAO)' },
//   { value: 'HAK', label: 'Haikou Meilan International Airport (HAK)' },
//   { value: 'XMN', label: 'Xiamen Gaoqi International Airport (XMN)' },
//   { value: 'FOC', label: 'Fuzhou Changle International Airport (FOC)' },
//   { value: 'KWE', label: 'Guiyang Longdongbao International Airport (KWE)' },
//   { value: 'DLC', label: 'Dalian Zhoushuizi International Airport (DLC)' },
//   { value: 'CGO', label: 'Zhengzhou Xinzheng International Airport (CGO)' },
//   { value: 'HRB', label: 'Harbin Taiping International Airport (HRB)' },
//   { value: 'SHE', label: 'Shenyang Taoxian International Airport (SHE)' },
//   { value: 'TNA', label: 'Jinan Yaoqiang International Airport (TNA)' },
//   { value: 'YNT', label: 'Yantai Penglai International Airport (YNT)' },
//   { value: 'HFE', label: 'Hefei Xinqiao International Airport (HFE)' },
//   { value: 'NGB', label: 'Ningbo Lishe International Airport (NGB)' },
//   { value: 'LYG', label: 'Lianyungang Baitabu Airport (LYG)' },
//   { value: 'WUX', label: 'Wuxi Sunan Shuofang International Airport (WUX)' },
//   { value: 'ZUH', label: 'Zhuhai Jinwan Airport (ZUH)' },
//   { value: 'SJW', label: 'Shijiazhuang Zhengding International Airport (SJW)' },
//   { value: 'TYN', label: 'Taiyuan Wusu International Airport (TYN)' },
//   { value: 'CGQ', label: 'Changchun Longjia International Airport (CGQ)' },
//   { value: 'DYG', label: 'Dayong Airport (DYG)' },
//   { value: 'LYI', label: 'Linyi Qufu Airport (LYI)' },
//   { value: 'JMU', label: 'Jiamusi Dongjiao Airport (JMU)' },
//   { value: 'YCU', label: 'Yichun Mingyueshan Airport (YCU)' },
//   { value: 'JGN', label: 'Jinggangshan Airport (JGN)' },
//   { value: 'WDS', label: 'Wudangshan Airport (WDS)' },
//   { value: 'JNZ', label: 'Jinzhou Xiaolingzi Airport (JNZ)' },
//   { value: 'YIH', label: 'Yichang Sanxia Airport (YIH)' },
//   { value: 'XIL', label: 'Xilinhot Airport (XIL)' },
//   { value: 'HLD', label: 'Hailar Dongshan Airport (HLD)' },
//   { value: 'BAV', label: 'Baotou Erliban Airport (BAV)' },
//   { value: 'HLH', label: 'Hulunbuir Hailar Airport (HLH)' },
//   { value: 'DSN', label: 'Datong Yungang Airport (DSN)' },
//   { value: 'TGO', label: 'Tongliao Naoqi Airport (TGO)' },
//   { value: 'ZHY', label: 'Zhanjiang Wuchuan Airport (ZHY)' },
//   { value: 'LYA', label: 'Luoyang Beijiao Airport (LYA)' },
//   { value: 'JGS', label: 'Jiagedaqi Airport (JGS)' },
//   { value: 'YCU', label: 'Yushu Batang Airport (YCU)' },
//   { value: 'KRY', label: 'Korla Airport (KRY)' },
//   { value: 'HMI', label: 'Hami Airport (HMI)' },
//   { value: 'WUA', label: 'Wuhai Airport (WUA)' },
//   { value: 'KCA', label: 'Karamay Airport (KCA)' },
//   { value: 'IQM', label: 'Yining Airport (IQM)' },
//   { value: 'TGO', label: 'Tacheng Airport (TGO)' },
//   { value: 'AAT', label: 'Altay Airport (AAT)' },
//   { value: 'KHG', label: 'Kashgar Airport (KHG)' },
//   { value: 'YIN', label: 'Yining Airport (YIN)' },
//   { value: 'ZHY', label: 'Zhanjiang Wuchuan Airport (ZHY)' },
//   { value: 'DMK', label: 'Don Mueang International Airport (DMK)' },
//   { value: 'CNX', label: 'Chiang Mai International Airport (CNX)' },
//   { value: 'KBV', label: 'Krabi International Airport (KBV)' },
//   { value: 'URT', label: 'Udon Thani International Airport (URT)' },
//   { value: 'HDY', label: 'Hat Yai International Airport (HDY)' },
//   { value: 'HKT', label: 'Phuket International Airport (HKT)' },
//   { value: 'CEI', label: 'Chiang Rai International Airport (CEI)' },
//   { value: 'KKC', label: 'Khon Kaen Airport (KKC)' },
//   { value: 'NST', label: 'Nakhon Si Thammarat Airport (NST)' },
//   { value: 'UBP', label: 'Ubon Ratchathani Airport (UBP)' },
//   { value: 'NAW', label: 'Narathiwat Airport (NAW)' },
//   { value: 'PHS', label: 'Phitsanulok Airport (PHS)' },
//   { value: 'PYY', label: 'Pai Airport (PYY)' },
// ];

// const travelClassOptions = [
//   { value: 'ECONOMY', label: 'Economy' },
//   { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
//   { value: 'BUSINESS', label: 'Business' },
//   { value: 'FIRST', label: 'First Class' },
// ];

// const passengerOptions = Array.from({ length: 9 }, (_, i) => ({
//   value: (i + 1).toString(),
//   label: `${i + 1} Passenger${i > 0 ? 's' : ''}`,
// }));

// const FlightSearch: React.FC = () => {
//   const [origin, setOrigin] = useState('');
//   const [destination, setDestination] = useState('');
//   const [departureDate, setDepartureDate] = useState('');
//   const [returnDate, setReturnDate] = useState('');
//   const [passengers, setPassengers] = useState('1');
//   const [travelClass, setTravelClass] = useState('ECONOMY');
//   const [flights, setFlights] = useState<FlightOffer[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const navigate = useNavigate();

//   // Load cached values
//   useEffect(() => {
//     const cached = sessionStorage.getItem('flightSearchResults');
//     if (cached) setFlights(JSON.parse(cached));

//     const cachedOrigin = sessionStorage.getItem('origin');
//     const cachedDestination = sessionStorage.getItem('destination');
//     const cachedDepartureDate = sessionStorage.getItem('departureDate');
//     const cachedReturnDate = sessionStorage.getItem('returnDate');
//     const cachedPassengers = sessionStorage.getItem('passengers');
//     const cachedTravelClass = sessionStorage.getItem('travelClass');

//     if (cachedOrigin) setOrigin(cachedOrigin);
//     if (cachedDestination) setDestination(cachedDestination);
//     if (cachedDepartureDate) setDepartureDate(cachedDepartureDate);
//     if (cachedReturnDate) setReturnDate(cachedReturnDate);
//     if (cachedPassengers) setPassengers(cachedPassengers);
//     if (cachedTravelClass) setTravelClass(cachedTravelClass);
//   }, []);

//   // Sync state with sessionStorage
//   useEffect(() => {
//     sessionStorage.setItem('origin', origin);
//   }, [origin]);

//   useEffect(() => {
//     sessionStorage.setItem('destination', destination);
//   }, [destination]);

//   useEffect(() => {
//     sessionStorage.setItem('departureDate', departureDate);
//   }, [departureDate]);

//   useEffect(() => {
//     sessionStorage.setItem('returnDate', returnDate);
//   }, [returnDate]);

//   useEffect(() => {
//     sessionStorage.setItem('passengers', passengers);
//   }, [passengers]);

//   useEffect(() => {
//     sessionStorage.setItem('travelClass', travelClass);
//   }, [travelClass]);

//   const searchFlights = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const params = new URLSearchParams({
//         origin,
//         destination,
//         departureDate,
//         returnDate,
//         passengers,
//         travelClass,
//       });

//       const response = await fetch(`http://localhost:5000/api/flights?${params.toString()}`);
//       if (!response.ok) throw new Error('Flight search failed');
//       const data = await response.json();
//       setFlights(data.data || []);
//       sessionStorage.setItem('flightSearchResults', JSON.stringify(data.data || []));
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: '2rem' }}>
//       <h2>Search Flights</h2>

//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
//         <CreatableSelect
//           options={airportOptions}
//           placeholder="Select or type Origin"
//           value={
//             origin
//               ? airportOptions.find((opt) => opt.value === origin) || { value: origin, label: origin }
//               : null
//           }
//           onChange={(opt) => setOrigin(opt?.value || '')}
//           styles={{ container: (base) => ({ ...base, width: 250 }) }}
//           isClearable
//           formatCreateLabel={(inputValue) => `Use code: ${inputValue}`}
//         />

//         <CreatableSelect
//           options={airportOptions}
//           placeholder="Select or type Destination"
//           value={
//             destination
//               ? airportOptions.find((opt) => opt.value === destination) || { value: destination, label: destination }
//               : null
//           }
//           onChange={(opt) => setDestination(opt?.value || '')}
//           styles={{ container: (base) => ({ ...base, width: 250 }) }}
//           isClearable
//           formatCreateLabel={(inputValue) => `Use code: ${inputValue}`}
//         />

//         <div style={{ display: 'flex', flexDirection: 'column' }}>
//           <label htmlFor="departure-date" style={{ marginBottom: 4 }}>Departure Date</label>
//           <input
//             id="departure-date"
//             type="date"
//             value={departureDate}
//             onChange={(e) => setDepartureDate(e.target.value)}
//           />
//         </div>

//         <div style={{ display: 'flex', flexDirection: 'column' }}>
//           <label htmlFor="return-date" style={{ marginBottom: 4 }}>Return Date</label>
//           <input
//             id="return-date"
//             type="date"
//             value={returnDate}
//             onChange={(e) => setReturnDate(e.target.value)}
//           />
//         </div>

//         <Select
//           options={passengerOptions}
//           placeholder="Passengers"
//           value={passengerOptions.find((opt) => opt.value === passengers)}
//           onChange={(opt) => setPassengers(opt?.value || '1')}
//           styles={{ container: (base) => ({ ...base, width: 180 }) }}
//         />

//         <Select
//           options={travelClassOptions}
//           placeholder="Travel Class"
//           value={travelClassOptions.find((opt) => opt.value === travelClass)}
//           onChange={(opt) => setTravelClass(opt?.value || 'ECONOMY')}
//           styles={{ container: (base) => ({ ...base, width: 180 }) }}
//         />

//         <button onClick={searchFlights} disabled={loading}>
//           {loading ? 'Searching...' : 'Search'}
//         </button>
//       </div>

//       {error && <p style={{ color: 'red' }}>{error}</p>}

//       <div className="flights-container">
//         {flights.length > 0 ? (
//           flights.map((flight) => (
//             <div
//               key={flight.id}
//               style={{
//                 border: '1px solid #ddd',
//                 padding: '1.5rem',
//                 marginBottom: '1.5rem',
//                 borderRadius: '12px',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
//                 backgroundColor: '#fff',
//               }}
//             >
//               <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
//                 💰 Price: MYR {flight.price.total}
//               </p>

//               {flight.itineraries.map((itinerary, idx) => (
//                 <div key={idx}>
//                   <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🛫 Segments:</p>
//                   {itinerary.segments.map((seg, index) => {
//                     const departureTime = new Date(seg.departure.at);
//                     const arrivalTime = new Date(seg.arrival.at);

//                     // These fields may not exist in your FlightOffer type/data, so fallback to code if not present
//                     // @ts-ignore
//                     const airlineName =
//                       // @ts-ignore
//                       flight.airlineCodes?.find?.((a) => a.code === seg.carrierCode)?.name || seg.carrierCode || seg.carriers;

//                     // @ts-ignore
//                     const aircraftName =
//                       seg.aircraft?.code &&
//                       // @ts-ignore
//                       flight.aircraftCodes?.find?.((a) => a.code === seg.aircraft.code)?.name;

//                     return (
//                       <div key={index} style={{ marginBottom: '1rem' }}>
//                         <p>
//                           ✈️ <strong>{seg.departure.iataCode}</strong> ({departureTime.toLocaleString()}) →{' '}
//                           <strong>{seg.arrival.iataCode}</strong> ({arrivalTime.toLocaleString()})
//                         </p>
//                         <p>
//                           🏢 <strong>Airline:</strong> {airlineName}
//                           {aircraftName
//                           ? ` | ✈️ Aircraft: ${aircraftName} (${seg.aircraft?.code})`
//                           : seg.aircraft?.code
//                           ? ` | ✈️ Aircraft Code: ${seg.aircraft.code}`
//                           : ''}
//                         </p>
//                         <p>
//                           ⏱️ <strong>Duration:</strong>{' '}
//                           {seg.duration?.replace('PT', '').toLowerCase()}
//                         </p>
//                       </div>
//                     );
//                   })}

//                   {itinerary.segments.length > 1 &&
//                     itinerary.segments.slice(1).map((seg, i) => {
//                       const prevArrival = new Date(itinerary.segments[i].arrival.at);
//                       const nextDeparture = new Date(seg.departure.at);
//                       const layoverMinutes = Math.floor(
//                         (nextDeparture.getTime() - prevArrival.getTime()) / 60000
//                       );
//                       const hours = Math.floor(layoverMinutes / 60);
//                       const minutes = layoverMinutes % 60;

//                       return (
//                         <p key={`layover-${i}`} style={{ color: 'gray', marginLeft: '1rem' }}>
//                           🕓 Layover: {hours}h {minutes}m at{' '}
//                           {itinerary.segments[i].arrival.iataCode}
//                         </p>
//                       );
//                     })}
//                 </div>
//               ))}

//               <button
//                 onClick={() => navigate(`/flights/${flight.id}`, { state: { flight } })}
//                 style={{
//                   marginTop: '1rem',
//                   padding: '0.6rem 1.2rem',
//                   borderRadius: '8px',
//                   backgroundColor: '#007bff',
//                   color: '#fff',
//                   border: 'none',
//                   cursor: 'pointer',
//                 }}
//               >
//                 View Details
//               </button>

//               {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight && (
//                 <p style={{ marginTop: '0.8rem' }}>
//                   🧳 <strong>Baggage Allowance:</strong>{' '}
//                   {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weight} kg
//                 </p>
//               )}
//             </div>
//           ))
//         ) : (
//           !loading && <p>No flights found.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default FlightSearch;
// // import React, { useState, useEffect } from 'react';
// // import Select from 'react-select';
// // import CreatableSelect from 'react-select/creatable';
// // import { useNavigate } from 'react-router-dom';
// // //import airports from './airports.json'; // Make sure you import your airports list

// // // interface FlightOffer {
// // //   id: string;
// // //   price: { total: string };
// // //   itineraries: {
// // //     segments: {
// // //       departure: { iataCode: string; at: string };
// // //       arrival: { iataCode: string; at: string };
// // //       carriers?: string;
// // //       aircraft?: { code: string };
// // //       duration?: string;
// // //     }[];
// // //   }[];
// // //   travelerPricings?: {
// // //     fareDetailsBySegment?: {
// // //       includedCheckedBags?: { weight?: number };
// // //     }[];
// // //   }[];
// // // }

// // interface FlightOffer {
// //   id: string;
// //   price: { total: string };
// //   itineraries: {
// //     segments: {
// //       departure: { iataCode: string; at: string };
// //       arrival: { iataCode: string; at: string };
// //       carrierCode?: string;
// //       aircraft?: { code: string };
// //       duration?: string;
// //     }[];
// //   }[];
// //   travelerPricings?: {
// //     fareDetailsBySegment?: {
// //       includedCheckedBags?: { weight?: number };
// //     }[];
// //   }[];
// //   airlineDetails?: { code: string; name: string }[];
// //   aircraftDetails?: { code: string; name: string }[];
// // }

// // const airportOptions = [
// //   { value: 'KUL', label: 'Kuala Lumpur International Airport (KUL)' },
// //   { value: 'NRT', label: 'Narita International Airport (NRT)' },
// //   { value: 'SIN', label: 'Changi Airport (SIN)' },
// //   { value: 'PEN', label: 'Penang International Airport (PEN)' },
// //   { value: 'HND', label: 'Haneda Airport (HND)' },
// //   { value: 'BKK', label: 'Suvarnabhumi Airport (BKK)' },
// //   { value: 'HKG', label: 'Hong Kong International Airport (HKG)' },
// //   { value: 'ICN', label: 'Incheon International Airport (ICN)' },
// //   { value: 'MNL', label: 'Ninoy Aquino International Airport (MNL)' },
// //   { value: 'CGK', label: 'Soekarno–Hatta International Airport (CGK)' },
// //   { value: 'DPS', label: 'Ngurah Rai International Airport (DPS)' },
// //   { value: 'BOM', label: 'Chhatrapati Shivaji Maharaj International Airport (BOM)' },
// //   { value: 'DEL', label: 'Indira Gandhi International Airport (DEL)' },
// //   { value: 'DOH', label: 'Hamad International Airport (DOH)' },
// //   { value: 'DXB', label: 'Dubai International Airport (DXB)' },
// //   { value: 'CDG', label: 'Charles de Gaulle Airport (CDG)' },
// //   { value: 'JFK', label: 'John F. Kennedy International Airport (JFK)' },
// //   { value: 'LHR', label: 'London Heathrow Airport (LHR)' },
// //   { value: 'LAX', label: 'Los Angeles International Airport (LAX)' },
// //   { value: 'ORD', label: 'O’Hare International Airport (ORD)' },
// //   { value: 'FRA', label: 'Frankfurt Airport (FRA)' },
// //   { value: 'AMS', label: 'Amsterdam Airport Schiphol (AMS)' },
// //   { value: 'MAD', label: 'Adolfo Suárez Madrid–Barajas Airport (MAD)' },
// //   { value: 'BCN', label: 'Barcelona–El Prat Airport (BCN)' },
// //   { value: 'ZRH', label: 'Zurich Airport (ZRH)' },
// //   { value: 'VIE', label: 'Vienna International Airport (VIE)' },
// //   { value: 'IST', label: 'Istanbul Airport (IST)' },
// //   { value: 'TLV', label: 'Ben Gurion Airport (TLV)' },
// //   { value: 'CAI', label: 'Cairo International Airport (CAI)' },
// //   { value: 'RUH', label: 'King Khalid International Airport (RUH)' },
// //   { value: 'JED', label: 'King Abdulaziz International Airport (JED)' },
// //   { value: 'KWI', label: 'Kuwait International Airport (KWI)' },
// //   { value: 'MCT', label: 'Muscat International Airport (MCT)' },
// //   { value: 'BAH', label: 'Bahrain International Airport (BAH)' },
// //   { value: 'KTM', label: 'Tribhuvan International Airport (KTM)' },
// //   { value: 'DAC', label: 'Hazrat Shahjalal International Airport (DAC)' },
// //   { value: 'CMB', label: 'Bandaranaike International Airport (CMB)' },
// //   { value: 'MLE', label: 'Velana International Airport (MLE)' },
// //   { value: 'PNH', label: 'Phnom Penh International Airport (PNH)' },
// //   { value: 'REP', label: 'Siem Reap International Airport (REP)' },
// //   { value: 'SGN', label: 'Tan Son Nhat International Airport (SGN)' },
// //   { value: 'HAN', label: 'Noi Bai International Airport (HAN)' },
// //   { value: 'DAD', label: 'Da Nang International Airport (DAD)' },
// //   { value: 'HUI', label: 'Phu Bai International Airport (HUI)' },
// //   { value: 'KOS', label: 'Sihanoukville International Airport (KOS)' },
// //   { value: 'LPQ', label: 'Luang Prabang International Airport (LPQ)' },
// //   { value: 'VTE', label: 'Wattay International Airport (VTE)' },
// //   { value: 'RNO', label: 'Reno-Tahoe International Airport (RNO)' },
// //   { value: 'LAS', label: 'McCarran International Airport (LAS)' },
// //   { value: 'PHX', label: 'Phoenix Sky Harbor International Airport (PHX)' },
// //   { value: 'SEA', label: 'Seattle–Tacoma International Airport (SEA)' },
// //   { value: 'SFO', label: 'San Francisco International Airport (SFO)' },
// //   { value: 'DEN', label: 'Denver International Airport (DEN)' },
// //   { value: 'ATL', label: 'Hartsfield–Jackson Atlanta International Airport (ATL)' },
// //   { value: 'MIA', label: 'Miami International Airport (MIA)' },
// //   { value: 'BOS', label: 'Logan International Airport (BOS)' },
// //   { value: 'IAD', label: 'Washington Dulles International Airport (IAD)' },
// //   { value: 'YYZ', label: 'Toronto Pearson International Airport (YYZ)' },
// //   { value: 'YVR', label: 'Vancouver International Airport (YVR)' },
// //   { value: 'YUL', label: 'Montréal–Trudeau International Airport (YUL)' },
// //   { value: 'SYD', label: 'Sydney Kingsford Smith Airport (SYD)' },
// //   { value: 'MEL', label: 'Melbourne Airport (MEL)' },
// //   { value: 'BNE', label: 'Brisbane Airport (BNE)' },
// //   { value: 'AKL', label: 'Auckland Airport (AKL)' },
// //   { value: 'WLG', label: 'Wellington International Airport (WLG)' },
// //   { value: 'CHC', label: 'Christchurch International Airport (CHC)' },
// //   { value: 'ADL', label: 'Adelaide Airport (ADL)' },
// //   { value: 'PER', label: 'Perth Airport (PER)' },
// //   { value: 'DRW', label: 'Darwin International Airport (DRW)' },
// //   { value: 'OOL', label: 'Gold Coast Airport (OOL)' },
// //   { value: 'HBA', label: 'Hobart International Airport (HBA)' },
// //   { value: 'TSV', label: 'Townsville Airport (TSV)' },
// //   { value: 'CNS', label: 'Cairns Airport (CNS)' },
// //   { value: 'KIX', label: 'Kansai International Airport (KIX)' },
// //   { value: 'KUN', label: 'Kunming Changshui International Airport (KUN)' },
// //   { value: 'PVG', label: 'Shanghai Pudong International Airport (PVG)' },
// //   { value: 'PEK', label: 'Beijing Capital International Airport (PEK)' },
// //   { value: 'CAN', label: 'Guangzhou Baiyun International Airport (CAN)' },
// //   { value: 'CTU', label: 'Chengdu Shuangliu International Airport (CTU)' },
// //   { value: 'SHA', label: 'Shanghai Hongqiao International Airport (SHA)' },
// //   { value: 'HGH', label: 'Hangzhou Xiaoshan International Airport (HGH)' },
// //   { value: 'SZX', label: 'Shenzhen Bao’an International Airport (SZX)' },
// //   { value: 'XIY', label: 'Xi’an Xianyang International Airport (XIY)' },
// //   { value: 'CKG', label: 'Chongqing Jiangbei International Airport (CKG)' },
// //   { value: 'NKG', label: 'Nanjing Lukou International Airport (NKG)' },
// //   { value: 'WUH', label: 'Wuhan Tianhe International Airport (WUH)' },
// //   { value: 'TAO', label: 'Qingdao Liuting International Airport (TAO)' },
// //   { value: 'HAK', label: 'Haikou Meilan International Airport (HAK)' },
// //   { value: 'XMN', label: 'Xiamen Gaoqi International Airport (XMN)' },
// //   { value: 'FOC', label: 'Fuzhou Changle International Airport (FOC)' },
// //   { value: 'KWE', label: 'Guiyang Longdongbao International Airport (KWE)' },
// //   { value: 'DLC', label: 'Dalian Zhoushuizi International Airport (DLC)' },
// //   { value: 'CGO', label: 'Zhengzhou Xinzheng International Airport (CGO)' },
// //   { value: 'HRB', label: 'Harbin Taiping International Airport (HRB)' },
// //   { value: 'SHE', label: 'Shenyang Taoxian International Airport (SHE)' },
// //   { value: 'TNA', label: 'Jinan Yaoqiang International Airport (TNA)' },
// //   { value: 'YNT', label: 'Yantai Penglai International Airport (YNT)' },
// //   { value: 'HFE', label: 'Hefei Xinqiao International Airport (HFE)' },
// //   { value: 'NGB', label: 'Ningbo Lishe International Airport (NGB)' },
// //   { value: 'LYG', label: 'Lianyungang Baitabu Airport (LYG)' },
// //   { value: 'WUX', label: 'Wuxi Sunan Shuofang International Airport (WUX)' },
// //   { value: 'ZUH', label: 'Zhuhai Jinwan Airport (ZUH)' },
// //   { value: 'SJW', label: 'Shijiazhuang Zhengding International Airport (SJW)' },
// //   { value: 'TYN', label: 'Taiyuan Wusu International Airport (TYN)' },
// //   { value: 'CGQ', label: 'Changchun Longjia International Airport (CGQ)' },
// //   { value: 'DYG', label: 'Dayong Airport (DYG)' },
// //   { value: 'LYI', label: 'Linyi Qufu Airport (LYI)' },
// //   { value: 'JMU', label: 'Jiamusi Dongjiao Airport (JMU)' },
// //   { value: 'YCU', label: 'Yichun Mingyueshan Airport (YCU)' },
// //   { value: 'JGN', label: 'Jinggangshan Airport (JGN)' },
// //   { value: 'WDS', label: 'Wudangshan Airport (WDS)' },
// //   { value: 'JNZ', label: 'Jinzhou Xiaolingzi Airport (JNZ)' },
// //   { value: 'YIH', label: 'Yichang Sanxia Airport (YIH)' },
// //   { value: 'XIL', label: 'Xilinhot Airport (XIL)' },
// //   { value: 'HLD', label: 'Hailar Dongshan Airport (HLD)' },
// //   { value: 'BAV', label: 'Baotou Erliban Airport (BAV)' },
// //   { value: 'HLH', label: 'Hulunbuir Hailar Airport (HLH)' },
// //   { value: 'DSN', label: 'Datong Yungang Airport (DSN)' },
// //   { value: 'TGO', label: 'Tongliao Naoqi Airport (TGO)' },
// //   { value: 'ZHY', label: 'Zhanjiang Wuchuan Airport (ZHY)' },
// //   { value: 'LYA', label: 'Luoyang Beijiao Airport (LYA)' },
// //   { value: 'JGS', label: 'Jiagedaqi Airport (JGS)' },
// //   { value: 'YCU', label: 'Yushu Batang Airport (YCU)' },
// //   { value: 'KRY', label: 'Korla Airport (KRY)' },
// //   { value: 'HMI', label: 'Hami Airport (HMI)' },
// //   { value: 'WUA', label: 'Wuhai Airport (WUA)' },
// //   { value: 'KCA', label: 'Karamay Airport (KCA)' },
// //   { value: 'IQM', label: 'Yining Airport (IQM)' },
// //   { value: 'TGO', label: 'Tacheng Airport (TGO)' },
// //   { value: 'AAT', label: 'Altay Airport (AAT)' },
// //   { value: 'KHG', label: 'Kashgar Airport (KHG)' },
// //   { value: 'YIN', label: 'Yining Airport (YIN)' },
// //   { value: 'ZHY', label: 'Zhanjiang Wuchuan Airport (ZHY)' },
// //   { value: 'DMK', label: 'Don Mueang International Airport (DMK)' },
// //   { value: 'CNX', label: 'Chiang Mai International Airport (CNX)' },
// //   { value: 'KBV', label: 'Krabi International Airport (KBV)' },
// //   { value: 'URT', label: 'Udon Thani International Airport (URT)' },
// //   { value: 'HDY', label: 'Hat Yai International Airport (HDY)' },
// //   { value: 'HKT', label: 'Phuket International Airport (HKT)' },
// //   { value: 'CEI', label: 'Chiang Rai International Airport (CEI)' },
// //   { value: 'KKC', label: 'Khon Kaen Airport (KKC)' },
// //   { value: 'NST', label: 'Nakhon Si Thammarat Airport (NST)' },
// //   { value: 'UBP', label: 'Ubon Ratchathani Airport (UBP)' },
// //   { value: 'NAW', label: 'Narathiwat Airport (NAW)' },
// //   { value: 'PHS', label: 'Phitsanulok Airport (PHS)' },
// //   { value: 'PYY', label: 'Pai Airport (PYY)' },
// // ];

// // const travelClassOptions = [
// //   { value: 'ECONOMY', label: 'Economy' },
// //   { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
// //   { value: 'BUSINESS', label: 'Business' },
// //   { value: 'FIRST', label: 'First Class' },
// // ];

// // const passengerOptions = Array.from({ length: 9 }, (_, i) => ({
// //   value: (i + 1).toString(),
// //   label: `${i + 1} Passenger${i > 0 ? 's' : ''}`,
// // }));

// // const FlightSearch: React.FC = () => {
// //   const [origin, setOrigin] = useState('');
// //   const [destination, setDestination] = useState('');
// //   const [departureDate, setDepartureDate] = useState('');
// //   const [returnDate, setReturnDate] = useState('');
// //   const [passengers, setPassengers] = useState('1');
// //   const [travelClass, setTravelClass] = useState('ECONOMY');
// //   const [flights, setFlights] = useState<FlightOffer[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');

// //   const navigate = useNavigate();

// //   // Load cached values
// //   useEffect(() => {
// //     const cached = sessionStorage.getItem('flightSearchResults');
// //     if (cached) setFlights(JSON.parse(cached));

// //     const cachedOrigin = sessionStorage.getItem('origin');
// //     const cachedDestination = sessionStorage.getItem('destination');
// //     const cachedDepartureDate = sessionStorage.getItem('departureDate');
// //     const cachedReturnDate = sessionStorage.getItem('returnDate');
// //     const cachedPassengers = sessionStorage.getItem('passengers');
// //     const cachedTravelClass = sessionStorage.getItem('travelClass');

// //     if (cachedOrigin) setOrigin(cachedOrigin);
// //     if (cachedDestination) setDestination(cachedDestination);
// //     if (cachedDepartureDate) setDepartureDate(cachedDepartureDate);
// //     if (cachedReturnDate) setReturnDate(cachedReturnDate);
// //     if (cachedPassengers) setPassengers(cachedPassengers);
// //     if (cachedTravelClass) setTravelClass(cachedTravelClass);
// //   }, []);

// //   // Sync state with sessionStorage
// //   useEffect(() => {
// //     sessionStorage.setItem('origin', origin);
// //   }, [origin]);

// //   useEffect(() => {
// //     sessionStorage.setItem('destination', destination);
// //   }, [destination]);

// //   useEffect(() => {
// //     sessionStorage.setItem('departureDate', departureDate);
// //   }, [departureDate]);

// //   useEffect(() => {
// //     sessionStorage.setItem('returnDate', returnDate);
// //   }, [returnDate]);

// //   useEffect(() => {
// //     sessionStorage.setItem('passengers', passengers);
// //   }, [passengers]);

// //   useEffect(() => {
// //     sessionStorage.setItem('travelClass', travelClass);
// //   }, [travelClass]);

// //   const searchFlights = async () => {
// //     setLoading(true);
// //     setError('');
// //     try {
// //       const params = new URLSearchParams({
// //         origin,
// //         destination,
// //         departureDate,
// //         returnDate,
// //         passengers,
// //         travelClass,
// //       });

// //       const response = await fetch(`http://localhost:5000/api/flights?${params.toString()}`);
// //       if (!response.ok) throw new Error('Flight search failed');
// //       const data = await response.json();
// //       setFlights(data.data || []);
// //       sessionStorage.setItem('flightSearchResults', JSON.stringify(data.data || []));
// //     } catch (err: any) {
// //       setError(err.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

  

// //   return (
// //     <div style={{ padding: '2rem' }}>
// //       <h2>Search Flights</h2>

// //       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
// //         <CreatableSelect
// //           options={airportOptions}
// //           placeholder="Select or type Origin"
// //           value={
// //             origin
// //               ? airportOptions.find((opt) => opt.value === origin) || { value: origin, label: origin }
// //               : null
// //           }
// //           onChange={(opt) => setOrigin(opt?.value || '')}
// //           styles={{ container: (base) => ({ ...base, width: 250 }) }}
// //           isClearable
// //           formatCreateLabel={(inputValue) => `Use code: ${inputValue}`}
// //         />

// //         <CreatableSelect
// //           options={airportOptions}
// //           placeholder="Select or type Destination"
// //           value={
// //             destination
// //               ? airportOptions.find((opt) => opt.value === destination) || { value: destination, label: destination }
// //               : null
// //           }
// //           onChange={(opt) => setDestination(opt?.value || '')}
// //           styles={{ container: (base) => ({ ...base, width: 250 }) }}
// //           isClearable
// //           formatCreateLabel={(inputValue) => `Use code: ${inputValue}`}
// //         />

// //         <div style={{ display: 'flex', flexDirection: 'column' }}>
// //           <label htmlFor="departure-date" style={{ marginBottom: 4 }}>Departure Date</label>
// //           <input
// //             id="departure-date"
// //             type="date"
// //             value={departureDate}
// //             onChange={(e) => setDepartureDate(e.target.value)}
// //           />
// //         </div>

// //         <div style={{ display: 'flex', flexDirection: 'column' }}>
// //           <label htmlFor="return-date" style={{ marginBottom: 4 }}>Return Date</label>
// //           <input
// //             id="return-date"
// //             type="date"
// //             value={returnDate}
// //             onChange={(e) => setReturnDate(e.target.value)}
// //           />
// //         </div>

// //         <Select
// //           options={passengerOptions}
// //           placeholder="Passengers"
// //           value={passengerOptions.find((opt) => opt.value === passengers)}
// //           onChange={(opt) => setPassengers(opt?.value || '1')}
// //           styles={{ container: (base) => ({ ...base, width: 180 }) }}
// //         />

// //         <Select
// //           options={travelClassOptions}
// //           placeholder="Travel Class"
// //           value={travelClassOptions.find((opt) => opt.value === travelClass)}
// //           onChange={(opt) => setTravelClass(opt?.value || 'ECONOMY')}
// //           styles={{ container: (base) => ({ ...base, width: 180 }) }}
// //         />

// //         <button onClick={searchFlights} disabled={loading}>
// //           {loading ? 'Searching...' : 'Search'}
// //         </button>
// //       </div>

// //       {error && <p style={{ color: 'red' }}>{error}</p>}

// //       <div className="flights-container">
// //         {flights.length > 0 ? (
// //           flights.map((flight) => (
// //             <div
// //               key={flight.id}
// //               style={{
// //                 border: '1px solid #ddd',
// //                 padding: '1.5rem',
// //                 marginBottom: '1.5rem',
// //                 borderRadius: '12px',
// //                 boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
// //                 backgroundColor: '#fff',
// //               }}
// //             >
// //               <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
// //                 💰 Price: MYR {flight.price.total}
// //               </p>

// //               {flight.itineraries.map((itinerary, idx) => (
// //                 <div key={idx}>
// //                   <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🛫 Segments:</p>
// //                   {itinerary.segments.map((seg, index) => {
// //                     const departureTime = new Date(seg.departure.at);
// //                     const arrivalTime = new Date(seg.arrival.at);


// //                       // const airlineName = flight.airlineDetails?.[0]?.name || seg.carrierCode;
// //                       // const aircraftName = flight.aircraftDetails?.[0]?.name || seg.aircraft?.code;
// //                     const airlineName = flight.airlineDetails?.find(a => a.code === seg.carrierCode)?.name || seg.carrierCode;
// //                     const aircraftName = flight.aircraftDetails?.find(a => a.code === seg.aircraft?.code)?.name || seg.aircraft?.code;


// //                     return (
// //                       <div key={index} style={{ marginBottom: '1rem' }}>
// //                         <p>
// //                           ✈️ <strong>{seg.departure.iataCode}</strong> ({departureTime.toLocaleString()}) →{' '}
// //                           <strong>{seg.arrival.iataCode}</strong> ({arrivalTime.toLocaleString()})
// //                         </p>
// //                         <p>
// //                             🏢 <strong>Airline:</strong> {airlineName} ({seg.carrierCode})
// //                             {aircraftName
// //                               ? ` | ✈️ Aircraft: ${aircraftName} (${seg.aircraft?.code})`
// //                               : seg.aircraft?.code
// //                               ? ` | ✈️ Aircraft Code: ${seg.aircraft.code}`
// //                               : ''}
// //                           </p>
// //                         <p>
// //                           ⏱️ <strong>Duration:</strong>{' '}
// //                           {seg.duration?.replace('PT', '').toLowerCase()}
// //                         </p>
// //                       </div>
// //                     );
// //                   })}

// //                   {itinerary.segments.length > 1 &&
// //                     itinerary.segments.slice(1).map((seg, i) => {
// //                       const prevArrival = new Date(itinerary.segments[i].arrival.at);
// //                       const nextDeparture = new Date(seg.departure.at);
// //                       const layoverMinutes = Math.floor(
// //                         (nextDeparture.getTime() - prevArrival.getTime()) / 60000
// //                       );
// //                       const hours = Math.floor(layoverMinutes / 60);
// //                       const minutes = layoverMinutes % 60;

// //                       return (
// //                         <p key={`layover-${i}`} style={{ color: 'gray', marginLeft: '1rem' }}>
// //                           🕓 Layover: {hours}h {minutes}m at{' '}
// //                           {itinerary.segments[i].arrival.iataCode}
// //                         </p>
// //                       );
// //                     })}
// //                 </div>
// //               ))}

// //               <button
// //                 onClick={() => navigate(`/flights/${flight.id}`, { state: { flight } })}
// //                 style={{
// //                   marginTop: '1rem',
// //                   padding: '0.6rem 1.2rem',
// //                   borderRadius: '8px',
// //                   backgroundColor: '#007bff',
// //                   color: '#fff',
// //                   border: 'none',
// //                   cursor: 'pointer',
// //                 }}
// //               >
// //                 View Details
// //               </button>

// //               {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight && (
// //                 <p style={{ marginTop: '0.8rem' }}>
// //                   🧳 <strong>Baggage Allowance:</strong>{' '}
// //                   {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weight} kg
// //                 </p>
// //               )}
// //             </div>
// //           ))
// //         ) : (
// //           !loading && <p>No flights found.</p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // export default FlightSearch;