import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { API_BASE_URL } from '@/lib/api';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

const airportOptions = [
  { value: 'KUL', label: 'Kuala Lumpur International Airport (KUL)' },
  { value: 'NRT', label: 'Narita International Airport (NRT)' },
  { value: 'SIN', label: 'Changi Airport (SIN)' },
  { value: 'PEN', label: 'Penang International Airport (PEN)' },
  { value: 'HND', label: 'Haneda Airport (HND)' },
  { value: 'BKK', label: 'Suvarnabhumi Airport (BKK)' },
  { value: 'HKG', label: 'Hong Kong International Airport (HKG)' },
  { value: 'ICN', label: 'Incheon International Airport (ICN)' },
  { value: 'MNL', label: 'Ninoy Aquino International Airport (MNL)' },
  { value: 'CGK', label: 'Soekarno–Hatta International Airport (CGK)' },
  { value: 'DPS', label: 'Ngurah Rai International Airport (DPS)' },
  { value: 'BOM', label: 'Chhatrapati Shivaji Maharaj International Airport (BOM)' },
  { value: 'DEL', label: 'Indira Gandhi International Airport (DEL)' },
  { value: 'DOH', label: 'Hamad International Airport (DOH)' },
  { value: 'DXB', label: 'Dubai International Airport (DXB)' },
  { value: 'CDG', label: 'Charles de Gaulle Airport (CDG)' },
  { value: 'JFK', label: 'John F. Kennedy International Airport (JFK)' },
  { value: 'LHR', label: 'London Heathrow Airport (LHR)' },
  { value: 'LAX', label: 'Los Angeles International Airport (LAX)' },
  { value: 'ORD', label: 'O’Hare International Airport (ORD)' },
  { value: 'FRA', label: 'Frankfurt Airport (FRA)' },
  { value: 'AMS', label: 'Amsterdam Airport Schiphol (AMS)' },
  { value: 'MAD', label: 'Adolfo Suárez Madrid–Barajas Airport (MAD)' },
  { value: 'BCN', label: 'Barcelona–El Prat Airport (BCN)' },
  { value: 'ZRH', label: 'Zurich Airport (ZRH)' },
  { value: 'VIE', label: 'Vienna International Airport (VIE)' },
  { value: 'IST', label: 'Istanbul Airport (IST)' },
  { value: 'TLV', label: 'Ben Gurion Airport (TLV)' },
  { value: 'CAI', label: 'Cairo International Airport (CAI)' },
  { value: 'RUH', label: 'King Khalid International Airport (RUH)' },
  { value: 'JED', label: 'King Abdulaziz International Airport (JED)' },
  { value: 'KWI', label: 'Kuwait International Airport (KWI)' },
  { value: 'MCT', label: 'Muscat International Airport (MCT)' },
  { value: 'BAH', label: 'Bahrain International Airport (BAH)' },
  { value: 'KTM', label: 'Tribhuvan International Airport (KTM)' },
  { value: 'DAC', label: 'Hazrat Shahjalal International Airport (DAC)' },
  { value: 'CMB', label: 'Bandaranaike International Airport (CMB)' },
  { value: 'MLE', label: 'Velana International Airport (MLE)' },
  { value: 'PNH', label: 'Phnom Penh International Airport (PNH)' },
  { value: 'REP', label: 'Siem Reap International Airport (REP)' },
  { value: 'SGN', label: 'Tan Son Nhat International Airport (SGN)' },
  { value: 'HAN', label: 'Noi Bai International Airport (HAN)' },
  { value: 'DAD', label: 'Da Nang International Airport (DAD)' },
  { value: 'HUI', label: 'Phu Bai International Airport (HUI)' },
  { value: 'KOS', label: 'Sihanoukville International Airport (KOS)' },
  { value: 'LPQ', label: 'Luang Prabang International Airport (LPQ)' },
  { value: 'VTE', label: 'Wattay International Airport (VTE)' },
  { value: 'RNO', label: 'Reno-Tahoe International Airport (RNO)' },
  { value: 'LAS', label: 'McCarran International Airport (LAS)' },
  { value: 'PHX', label: 'Phoenix Sky Harbor International Airport (PHX)' },
  { value: 'SEA', label: 'Seattle–Tacoma International Airport (SEA)' },
  { value: 'SFO', label: 'San Francisco International Airport (SFO)' },
  { value: 'DEN', label: 'Denver International Airport (DEN)' },
  { value: 'ATL', label: 'Hartsfield–Jackson Atlanta International Airport (ATL)' },
  { value: 'MIA', label: 'Miami International Airport (MIA)' },
  { value: 'BOS', label: 'Logan International Airport (BOS)' },
  { value: 'IAD', label: 'Washington Dulles International Airport (IAD)' },
  { value: 'YYZ', label: 'Toronto Pearson International Airport (YYZ)' },
  { value: 'YVR', label: 'Vancouver International Airport (YVR)' },
  { value: 'YUL', label: 'Montréal–Trudeau International Airport (YUL)' },
  { value: 'SYD', label: 'Sydney Kingsford Smith Airport (SYD)' },
  { value: 'MEL', label: 'Melbourne Airport (MEL)' },
  { value: 'BNE', label: 'Brisbane Airport (BNE)' },
  { value: 'AKL', label: 'Auckland Airport (AKL)' },
  { value: 'WLG', label: 'Wellington International Airport (WLG)' },
  { value: 'CHC', label: 'Christchurch International Airport (CHC)' },
  { value: 'ADL', label: 'Adelaide Airport (ADL)' },
  { value: 'PER', label: 'Perth Airport (PER)' },
  { value: 'DRW', label: 'Darwin International Airport (DRW)' },
  { value: 'OOL', label: 'Gold Coast Airport (OOL)' },
  { value: 'HBA', label: 'Hobart International Airport (HBA)' },
  { value: 'TSV', label: 'Townsville Airport (TSV)' },
  { value: 'CNS', label: 'Cairns Airport (CNS)' },
  { value: 'KIX', label: 'Kansai International Airport (KIX)' },
  { value: 'KUN', label: 'Kunming Changshui International Airport (KUN)' },
  { value: 'PVG', label: 'Shanghai Pudong International Airport (PVG)' },
  { value: 'PEK', label: 'Beijing Capital International Airport (PEK)' },
  { value: 'CAN', label: 'Guangzhou Baiyun International Airport (CAN)' },
  { value: 'CTU', label: 'Chengdu Shuangliu International Airport (CTU)' },
  { value: 'SHA', label: 'Shanghai Hongqiao International Airport (SHA)' },
  { value: 'HGH', label: 'Hangzhou Xiaoshan International Airport (HGH)' },
  { value: 'SZX', label: 'Shenzhen Bao’an International Airport (SZX)' },
  { value: 'XIY', label: 'Xi’an Xianyang International Airport (XIY)' },
  { value: 'CKG', label: 'Chongqing Jiangbei International Airport (CKG)' },
  { value: 'NKG', label: 'Nanjing Lukou International Airport (NKG)' },
  { value: 'WUH', label: 'Wuhan Tianhe International Airport (WUH)' },
  { value: 'TAO', label: 'Qingdao Liuting International Airport (TAO)' },
  { value: 'HAK', label: 'Haikou Meilan International Airport (HAK)' },
  { value: 'XMN', label: 'Xiamen Gaoqi International Airport (XMN)' },
  { value: 'FOC', label: 'Fuzhou Changle International Airport (FOC)' },
  { value: 'KWE', label: 'Guiyang Longdongbao International Airport (KWE)' },
  { value: 'DLC', label: 'Dalian Zhoushuizi International Airport (DLC)' },
  { value: 'CGO', label: 'Zhengzhou Xinzheng International Airport (CGO)' },
  { value: 'HRB', label: 'Harbin Taiping International Airport (HRB)' },
  { value: 'SHE', label: 'Shenyang Taoxian International Airport (SHE)' },
  { value: 'TNA', label: 'Jinan Yaoqiang International Airport (TNA)' },
  { value: 'YNT', label: 'Yantai Penglai International Airport (YNT)' },
  { value: 'HFE', label: 'Hefei Xinqiao International Airport (HFE)' },
  { value: 'NGB', label: 'Ningbo Lishe International Airport (NGB)' },
  { value: 'LYG', label: 'Lianyungang Baitabu Airport (LYG)' },
  { value: 'WUX', label: 'Wuxi Sunan Shuofang International Airport (WUX)' },
  { value: 'ZUH', label: 'Zhuhai Jinwan Airport (ZUH)' },
  { value: 'SJW', label: 'Shijiazhuang Zhengding International Airport (SJW)' },
  { value: 'TYN', label: 'Taiyuan Wusu International Airport (TYN)' },
  { value: 'CGQ', label: 'Changchun Longjia International Airport (CGQ)' },
  { value: 'DYG', label: 'Dayong Airport (DYG)' },
  { value: 'LYI', label: 'Linyi Qufu Airport (LYI)' },
  { value: 'JMU', label: 'Jiamusi Dongjiao Airport (JMU)' },
  { value: 'YCU', label: 'Yichun Mingyueshan Airport (YCU)' },
  { value: 'JGN', label: 'Jinggangshan Airport (JGN)' },
  { value: 'WDS', label: 'Wudangshan Airport (WDS)' },
  { value: 'JNZ', label: 'Jinzhou Xiaolingzi Airport (JNZ)' },
  { value: 'YIH', label: 'Yichang Sanxia Airport (YIH)' },
  { value: 'XIL', label: 'Xilinhot Airport (XIL)' },
  { value: 'HLD', label: 'Hailar Dongshan Airport (HLD)' },
  { value: 'BAV', label: 'Baotou Erliban Airport (BAV)' },
  { value: 'HLH', label: 'Hulunbuir Hailar Airport (HLH)' },
  { value: 'DSN', label: 'Datong Yungang Airport (DSN)' },
  { value: 'TGO', label: 'Tongliao Naoqi Airport (TGO)' },
  { value: 'ZHY', label: 'Zhanjiang Wuchuan Airport (ZHY)' },
  { value: 'LYA', label: 'Luoyang Beijiao Airport (LYA)' },
  { value: 'JGS', label: 'Jiagedaqi Airport (JGS)' },
  { value: 'YCU', label: 'Yushu Batang Airport (YCU)' },
  { value: 'KRY', label: 'Korla Airport (KRY)' },
  { value: 'HMI', label: 'Hami Airport (HMI)' },
  { value: 'WUA', label: 'Wuhai Airport (WUA)' },
  { value: 'KCA', label: 'Karamay Airport (KCA)' },
  { value: 'IQM', label: 'Yining Airport (IQM)' },
  { value: 'TGO', label: 'Tacheng Airport (TGO)' },
  { value: 'AAT', label: 'Altay Airport (AAT)' },
  { value: 'KHG', label: 'Kashgar Airport (KHG)' },
  { value: 'YIN', label: 'Yining Airport (YIN)' },
  { value: 'ZHY', label: 'Zhanjiang Wuchuan Airport (ZHY)' },
  { value: 'DMK', label: 'Don Mueang International Airport (DMK)' },
  { value: 'CNX', label: 'Chiang Mai International Airport (CNX)' },
  { value: 'KBV', label: 'Krabi International Airport (KBV)' },
  { value: 'URT', label: 'Udon Thani International Airport (URT)' },
  { value: 'HDY', label: 'Hat Yai International Airport (HDY)' },
  { value: 'HKT', label: 'Phuket International Airport (HKT)' },
  { value: 'CEI', label: 'Chiang Rai International Airport (CEI)' },
  { value: 'KKC', label: 'Khon Kaen Airport (KKC)' },
  { value: 'NST', label: 'Nakhon Si Thammarat Airport (NST)' },
  { value: 'UBP', label: 'Ubon Ratchathani Airport (UBP)' },
  { value: 'NAW', label: 'Narathiwat Airport (NAW)' },
  { value: 'PHS', label: 'Phitsanulok Airport (PHS)' },
  { value: 'PYY', label: 'Pai Airport (PYY)' },
];



const travelClassOptions = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First Class' },
];

const passengerOptions = Array.from({ length: 9 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1} Passenger${i > 0 ? 's' : ''}`,
}));

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
          {value ? airportOptions.find((airport) => airport.value === value)?.label || value : placeholder}
          <MapPin className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No airport found.</CommandEmpty>
            <CommandGroup>
              {airportOptions.map((airport) => (
                <CommandItem
                  key={airport.value}
                  value={airport.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{airport.label}</span>
                    <span className="text-sm text-muted-foreground">{airport.label}</span>
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

export default function FlightSearch() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [travelClass, setTravelClass] = useState('ECONOMY');
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        origin,
        destination,
        departureDate,
        returnDate,
        passengers,
        travelClass,
      })

      const response = await fetch(`${API_BASE_URL}/api/flights?${params.toString()}`);
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

  const handleFlightSelect = (flight: FlightOffer) => {
    // Store the selected flight in sessionStorage for the FlightDetails page
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
    // Navigate to flight details page (order confirmation)
    setLocation(`/flight-details/${flight.id}`);
  };

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


  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Find Your Perfect Flight</h1>
          <p className="text-xl text-slate-600">Search and book flights to destinations worldwide</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">From</label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {airportOptions.map((airport) => (
                      <SelectItem key={airport.value} value={airport.value}>
                        {airport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">To</label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {airportOptions.map((airport) => (
                      <SelectItem key={airport.value} value={airport.value}>
                        {airport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Departure</label>
                <Input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Return (Optional)</label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={departureDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Passengers</label>
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

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Class</label>
                <Select value={travelClass} onValueChange={setTravelClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {travelClassOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? 'Searching...' : 'Search Flights'}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm mt-2">{error}</div>
            )}
          </CardContent>
        </Card>

        {/* Flight Results */}
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
                <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
                  {/* Flight Info (Departure/Return) */}
                  <div className="flex-1 flex flex-col gap-6">
                    {flight.itineraries.map((itinerary, idx) => (
                      <Card key={idx} className="border border-blue-200">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 text-2xl text-blue-800 mb-2 font-bold">
                            <Plane className="h-6 w-6" />
                            <span>{idx === 0 ? "Departure" : "Return"}</span>
                          </div>
                          {itinerary.segments.map((segment, segIdx) => (
                            <div key={segIdx} className="mb-4">
                              <div className="flex flex-row items-center justify-between gap-6 relative">
                                <div className="flex flex-col items-center">
                                  <div className="text-xl font-bold text-blue-900">{formatDateTime(segment.departure.at).time}</div>
                                  <div className="text-base text-blue-900 font-semibold">{segment.departure.iataCode}</div>
                                  <div className="text-sm text-black-500">{formatDateTime(segment.departure.at).date}</div>
                                </div>
                                {/* Dotted line with airplane and duration in the middle */}
                                <div className="flex-1 flex flex-col items-center">
                                  <div className="flex items-center w-full justify-center">
                                    <div className="border-t border-dotted border-blue-900 w-16 sm:w-24 md:w-32 lg:w-40 xl:w-56 relative flex items-center">
                                      <span className="absolute left-1/2 -translate-x-1/2 bg-white px-2 text-s text-blue-900 font-semibold flex items-center gap-1">
                                        <Plane className="inline-block h-4 w-4 text-blue-900 -rotate-12" />
                                        {formatDuration(segment.duration)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className="text-xl font-bold text-blue-900">{formatDateTime(segment.arrival.at).time}</div>
                                  <div className="text-base text-blue-900 font-semibold">{segment.arrival.iataCode}</div>
                                  <div className="text-sm text-black-500">{formatDateTime(segment.arrival.at).date}</div>
                                </div>
                              </div>
                              <div className="flex flex-col items-start mt-3">
                                <div className="flex items-center gap-2 text-sm text-blue-900 font-semibold mt-1">
                                  <Building2 className="h-5 w-5 text-blue-900" />
                                  <span>Airline: {segment.carrierCode || '-'}</span>
                                  {segment.aircraft && (
                                    <span className="ml-2">Aircraft: <span className="font-semibold">{segment.aircraft.code}</span></span>
                                  )}
                                </div>
                              </div>
                              {/* Layover (if not last segment) */}
                              {segIdx < itinerary.segments.length - 1 && (
                                <div className="flex flex-row items-center justify-center gap-2 my-2 w-full bg-orange-50 border border-yellow-400 rounded px-3 py-2">
                                  <Clock className="h-4 w-4 text-yellow-700" />
                                  <span className="text-base text-yellow-900 font-semibold">Layover:</span>
                                  <span className="text-base text-yellow-900">{calculateLayover(segment.arrival.at, itinerary.segments[segIdx + 1].departure.at)}</span>
                                  <span className="text-base text-yellow-900">at {segment.arrival.iataCode}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {/* Price and Book at top right, beside the departure card */}
                  <div className="w-full lg:w-auto lg:ml-4 flex-shrink-0 flex flex-col items-end mt-4 lg:mt-0">
                    <Card className="shadow-md">
                      <CardContent className="py-2 px-4 flex flex-col items-end gap-1">
                        <div className="flex flex-row items-baseline gap-1">
                          <span className="text-xl font-bold text-blue-900">MYR {flight.price.total}</span>
                          <span className="text-base text-muted-foreground ml-1">per person</span>
                        </div>
                        <Button
                          size="lg"
                          className="text-white bg-blue-500 hover:bg-blue-600 px-5 py-2 text-base mt-5"
                          onClick={() => handleFlightSelect(flight)}
                        >
                          Select Flight
                        </Button>
                      </CardContent>
                    </Card>
                    {/* Baggage Info */}
                    {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight && (
                      <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 rounded px-4 py-2 mt-2">
                        <Luggage className="h-5 w-5" />
                        <span>
                          Baggage: {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weight} kg included
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && flights.length === 0 &&origin && destination && (
            <Card>
              <CardContent className="py-12 text-center">
                <Plane className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No flights found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or dates to find more options.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-slate-600">Searching for flights...</div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}