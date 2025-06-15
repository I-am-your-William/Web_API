import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useNavigate } from 'react-router-dom';
//import airports from './airports.json'; // Make sure you import your airports list

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

// const airportOptions = airports.map((airport) => ({
//   value: airport.code,
//   label: `${airport.name} (${airport.code})`,
// }));
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

const FlightSearch: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [travelClass, setTravelClass] = useState('ECONOMY');
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

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

  const searchFlights = async () => {
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
      });

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
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Search Flights</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <CreatableSelect
          options={airportOptions}
          placeholder="Select or type Origin"
          value={
            origin
              ? airportOptions.find((opt) => opt.value === origin) || { value: origin, label: origin }
              : null
          }
          onChange={(opt) => setOrigin(opt?.value || '')}
          styles={{ container: (base) => ({ ...base, width: 250 }) }}
          isClearable
          formatCreateLabel={(inputValue) => `Use code: ${inputValue}`}
        />

        <CreatableSelect
          options={airportOptions}
          placeholder="Select or type Destination"
          value={
            destination
              ? airportOptions.find((opt) => opt.value === destination) || { value: destination, label: destination }
              : null
          }
          onChange={(opt) => setDestination(opt?.value || '')}
          styles={{ container: (base) => ({ ...base, width: 250 }) }}
          isClearable
          formatCreateLabel={(inputValue) => `Use code: ${inputValue}`}
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="departure-date" style={{ marginBottom: 4 }}>Departure Date</label>
          <input
            id="departure-date"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="return-date" style={{ marginBottom: 4 }}>Return Date</label>
          <input
            id="return-date"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>

        <Select
          options={passengerOptions}
          placeholder="Passengers"
          value={passengerOptions.find((opt) => opt.value === passengers)}
          onChange={(opt) => setPassengers(opt?.value || '1')}
          styles={{ container: (base) => ({ ...base, width: 180 }) }}
        />

        <Select
          options={travelClassOptions}
          placeholder="Travel Class"
          value={travelClassOptions.find((opt) => opt.value === travelClass)}
          onChange={(opt) => setTravelClass(opt?.value || 'ECONOMY')}
          styles={{ container: (base) => ({ ...base, width: 180 }) }}
        />

        <button onClick={searchFlights} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        {flights.length > 0 ? (
          flights.map((flight) => (
            <div key={flight.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
              <p><strong>Price:</strong> MYR {flight.price.total}</p>
              {flight.itineraries.map((itinerary, idx) => (
                <div key={idx}>
                  <p><strong>Segments:</strong></p>
                  {itinerary.segments.map((seg, index) => {
                    const departureTime = new Date(seg.departure.at);
                    const arrivalTime = new Date(seg.arrival.at);

                    return (
                      <div key={index} style={{ marginBottom: '0.5rem' }}>
                        <p>✈️ <strong>{seg.departure.iataCode}</strong> ({departureTime.toLocaleString()}) → <strong>{seg.arrival.iataCode}</strong> ({arrivalTime.toLocaleString()})</p>
                        <p>🏢 <strong>Airline:</strong> {seg.carriers} {seg.aircraft && `| Aircraft: ${seg.aircraft.code}`}</p>
                        <p>⏱️ <strong>Duration:</strong> {seg.duration?.replace('PT', '').toLowerCase()}</p>
                      </div>
                    );
                  })}
                  {itinerary.segments.length > 1 &&
                    itinerary.segments.slice(1).map((seg, i) => {
                      const prevArrival = new Date(itinerary.segments[i].arrival.at);
                      const nextDeparture = new Date(seg.departure.at);
                      const layoverMinutes = Math.floor((nextDeparture.getTime() - prevArrival.getTime()) / 60000);
                      const hours = Math.floor(layoverMinutes / 60);
                      const minutes = layoverMinutes % 60;
                      return (
                        <p key={`layover-${i}`} style={{ color: 'gray', marginLeft: '1rem' }}>
                          🕓 Layover: {hours}h {minutes}m at {itinerary.segments[i].arrival.iataCode}
                        </p>
                      );
                    })}
                </div>
              ))}

              <button
                onClick={() => navigate(`/flights/${flight.id}`, { state: { flight } })}
                style={{ marginTop: '1rem' }}
              >
                View Details
              </button>

              {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight && (
                <p>
                  🧳 <strong>Baggage Allowance:</strong>{' '}
                  {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.weight} kg
                </p>
              )}
            </div>
          ))
        ) : (
          !loading && <p>No flights found.</p>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;