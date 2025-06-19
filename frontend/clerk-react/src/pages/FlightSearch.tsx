import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plane, Clock, MapPin } from "lucide-react";

interface FlightOffer {
  id: string;
  price: { total: string };
  itineraries: {
    segments: {
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carriers?: string;
      aircraft?: { code: string };
      duration?: string;
    }[];
  }[];
  travelerPricings?: {
    fareDetailsBySegment?: {
      includedCheckedBags?: { weight?: number };
    }[];
  }[];
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
        adults: passengers,
        travelClass,
        ...(returnDate && { returnDate }),
      });

      const response = await fetch(`/api/flights?${params}`);
      
      if (!response.ok) {
        throw new Error('Flight search failed');
      }

      const data = await response.json();
      setFlights(data.data || []);
      
      // Cache results
      sessionStorage.setItem('flightSearchResults', JSON.stringify(data.data || []));
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching for flights');
      console.error('Flight search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlightSelect = (flight: FlightOffer) => {
    // Store the selected flight in sessionStorage for the FlightDetails page
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
    // Navigate to flight details page (order confirmation)
    setLocation(`/flight-details/${flight.id}`);
  };

  const formatDuration = (duration: string) => {
    return duration?.replace('PT', '').toLowerCase() || '';
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

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
        {flights.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Flights</h2>
            <div className="space-y-4">
              {flights.map((flight) => (
                <Card key={flight.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {flight.itineraries.map((itinerary, idx) => (
                          <div key={idx} className="mb-4 last:mb-0">
                            <div className="flex items-center space-x-4 mb-2">
                              <Plane className="w-5 h-5 text-primary" />
                              <span className="font-medium text-slate-900">
                                {idx === 0 ? 'Outbound' : 'Return'}
                              </span>
                            </div>
                            
                            {itinerary.segments.map((segment, segIdx) => (
                              <div key={segIdx} className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-4">
                                  <div className="text-center">
                                    <div className="font-semibold text-slate-900">{segment.departure.iataCode}</div>
                                    <div className="text-sm text-slate-600">
                                      {new Date(segment.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                      <div className="h-px bg-slate-300 flex-1"></div>
                                      <Clock className="w-4 h-4 text-slate-400" />
                                      <div className="h-px bg-slate-300 flex-1"></div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {formatDuration(segment.duration || '')}
                                    </div>
                                  </div>
                                  
                                  <div className="text-center">
                                    <div className="font-semibold text-slate-900">{segment.arrival.iataCode}</div>
                                    <div className="text-sm text-slate-600">
                                      {new Date(segment.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-primary mb-2">
                          MYR {parseFloat(flight.price.total).toFixed(2)}
                        </div>
                        <Button 
                          onClick={() => handleFlightSelect(flight)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Select Flight
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="text-slate-600">Searching for flights...</div>
          </div>
        )}

        {!loading && flights.length === 0 && origin && destination && (
          <div className="text-center py-12">
            <div className="text-slate-600">No flights found. Please try different search criteria.</div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}