import React, { useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useNavigate } from 'react-router-dom';

interface FlightOffer {
  id: string;
  price: {
    total: string;
  };
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
      includedCheckedBags?: {
        weight?: number;
      };
    }[];
  }[];
}

const airports = [
  { code: 'KUL', name: 'Kuala Lumpur International Airport' },
  { code: 'NRT', name: 'Narita International Airport' },
  { code: 'SIN', name: 'Changi Airport' },
  { code: 'PEN', name: 'Penang International Airport' },
  { code: 'HND', name: 'Haneda Airport' },
  { code: 'BKK', name: 'Suvarnabhumi Airport' },
  { code: 'HKG', name: 'Hong Kong International Airport' },
  { code: 'ICN', name: 'Incheon International Airport' },
  { code: 'MNL', name: 'Ninoy Aquino International Airport' },
  { code: 'CGK', name: 'Soekarno–Hatta International Airport' },
  { code: 'DPS', name: 'Ngurah Rai International Airport' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'DEL', name: 'Indira Gandhi International Airport' },
  { code: 'DOH', name: 'Hamad International Airport' },
  { code: 'DXB', name: 'Dubai International Airport' },
  { code: 'CDG', name: 'Charles de Gaulle Airport' },
  { code: 'JFK', name: 'John F. Kennedy International Airport' },
  { code: 'LHR', name: 'London Heathrow Airport' },
  { code: 'LAX', name: 'Los Angeles International Airport' },
  { code: 'ORD', name: 'O’Hare International Airport' },
  { code: 'FRA', name: 'Frankfurt Airport' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport' },
  { code: 'BCN', name: 'Barcelona–El Prat Airport' },
  { code: 'ZRH', name: 'Zurich Airport' },
  { code: 'VIE', name: 'Vienna International Airport' },
  { code: 'IST', name: 'Istanbul Airport' },
  { code: 'TLV', name: 'Ben Gurion Airport' },
  { code: 'CAI', name: 'Cairo International Airport' },
  { code: 'RUH', name: 'King Khalid International Airport' },
  { code: 'JED', name: 'King Abdulaziz International Airport' },
  { code: 'KWI', name: 'Kuwait International Airport' },
  { code: 'MCT', name: 'Muscat International Airport' },
  { code: 'BAH', name: 'Bahrain International Airport' },
  { code: 'KTM', name: 'Tribhuvan International Airport' },
  { code: 'DAC', name: 'Hazrat Shahjalal International Airport' },
  { code: 'CMB', name: 'Bandaranaike International Airport' },
  { code: 'MLE', name: 'Velana International Airport' },
  { code: 'PNH', name: 'Phnom Penh International Airport' },
  { code: 'REP', name: 'Siem Reap International Airport' },
  { code: 'SGN', name: 'Tan Son Nhat International Airport' },
  { code: 'HAN', name: 'Noi Bai International Airport' },
  { code: 'DAD', name: 'Da Nang International Airport' },
  { code: 'HUI', name: 'Phu Bai International Airport' },
  { code: 'KOS', name: 'Sihanoukville International Airport' },
  { code: 'LPQ', name: 'Luang Prabang International Airport' },
  { code: 'VTE', name: 'Wattay International Airport' },
  { code: 'RNO', name: 'Reno-Tahoe International Airport' },
  { code: 'LAS', name: 'McCarran International Airport' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport' },
  { code: 'SEA', name: 'Seattle–Tacoma International Airport' },
  { code: 'SFO', name: 'San Francisco International Airport' },
  { code: 'DEN', name: 'Denver International Airport' },
  { code: 'ATL', name: 'Hartsfield–Jackson Atlanta International Airport' },
  { code: 'MIA', name: 'Miami International Airport' },
  { code: 'BOS', name: 'Logan International Airport' },
  { code: 'IAD', name: 'Washington Dulles International Airport' },
  { code: 'YYZ', name: 'Toronto Pearson International Airport' },
  { code: 'YVR', name: 'Vancouver International Airport' },
  { code: 'YUL', name: 'Montréal–Trudeau International Airport' },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport' },
  { code: 'MEL', name: 'Melbourne Airport' },
  { code: 'BNE', name: 'Brisbane Airport' },
  { code: 'AKL', name: 'Auckland Airport' },
  { code: 'WLG', name: 'Wellington International Airport' },
  { code: 'CHC', name: 'Christchurch International Airport' },
  { code: 'ADL', name: 'Adelaide Airport' },
  { code: 'PER', name: 'Perth Airport' },
  { code: 'DRW', name: 'Darwin International Airport' },
  { code: 'OOL', name: 'Gold Coast Airport' },
  { code: 'HBA', name: 'Hobart International Airport' },
  { code: 'TSV', name: 'Townsville Airport' },
  { code: 'CNS', name: 'Cairns Airport' },
  { code: 'KIX', name: 'Kansai International Airport' },
  { code: 'KUN', name: 'Kunming Changshui International Airport' },
  { code: 'PVG', name: 'Shanghai Pudong International Airport' },
  { code: 'PEK', name: 'Beijing Capital International Airport' },
  { code: 'CAN', name: 'Guangzhou Baiyun International Airport' },
  { code: 'CTU', name: 'Chengdu Shuangliu International Airport' },
  { code: 'SHA', name: 'Shanghai Hongqiao International Airport' },
  { code: 'HGH', name: 'Hangzhou Xiaoshan International Airport' },
  { code: 'SZX', name: 'Shenzhen Bao’an International Airport' },
  { code: 'XIY', name: 'Xi’an Xianyang International Airport' },
  { code: 'CKG', name: 'Chongqing Jiangbei International Airport' },
  { code: 'NKG', name: 'Nanjing Lukou International Airport' },
  { code: 'WUH', name: 'Wuhan Tianhe International Airport' },
  { code: 'TAO', name: 'Qingdao Liuting International Airport' },
  { code: 'HAK', name: 'Haikou Meilan International Airport' },
  { code: 'XMN', name: 'Xiamen Gaoqi International Airport' },
  { code: 'FOC', name: 'Fuzhou Changle International Airport' },
  { code: 'KWE', name: 'Guiyang Longdongbao International Airport' },
  { code: 'DLC', name: 'Dalian Zhoushuizi International Airport' },
  { code: 'CGO', name: 'Zhengzhou Xinzheng International Airport' },
  { code: 'HRB', name: 'Harbin Taiping International Airport' },
  { code: 'SHE', name: 'Shenyang Taoxian International Airport' },
  { code: 'TNA', name: 'Jinan Yaoqiang International Airport' },
  { code: 'YNT', name: 'Yantai Penglai International Airport' },
  { code: 'HFE', name: 'Hefei Xinqiao International Airport' },
  { code: 'NGB', name: 'Ningbo Lishe International Airport' },
  { code: 'LYG', name: 'Lianyungang Baitabu Airport' },
  { code: 'WUX', name: 'Wuxi Sunan Shuofang International Airport' },
  { code: 'ZUH', name: 'Zhuhai Jinwan Airport' },
  { code: 'SJW', name: 'Shijiazhuang Zhengding International Airport' },
  { code: 'TYN', name: 'Taiyuan Wusu International Airport' },
  { code: 'CGQ', name: 'Changchun Longjia International Airport' },
  { code: 'DYG', name: 'Dayong Airport' },
  { code: 'LYI', name: 'Linyi Qufu Airport' },
  { code: 'JMU', name: 'Jiamusi Dongjiao Airport' },
  { code: 'YCU', name: 'Yichun Mingyueshan Airport' },
  { code: 'JGN', name: 'Jinggangshan Airport' },
  { code: 'WDS', name: 'Wudangshan Airport' },
  { code: 'JNZ', name: 'Jinzhou Xiaolingzi Airport' },
  { code: 'YIH', name: 'Yichang Sanxia Airport' },
  { code: 'XIL', name: 'Xilinhot Airport' },
  { code: 'HLD', name: 'Hailar Dongshan Airport' },
  { code: 'BAV', name: 'Baotou Erliban Airport' },
  { code: 'HLH', name: 'Hulunbuir Hailar Airport' },
  { code: 'DSN', name: 'Datong Yungang Airport' },
  { code: 'TGO', name: 'Tongliao Naoqi Airport' },
  { code: 'ZHY', name: 'Zhanjiang Wuchuan Airport' },
  { code: 'LYA', name: 'Luoyang Beijiao Airport' },
  { code: 'JGS', name: 'Jiagedaqi Airport' },
  { code: 'YCU', name: 'Yushu Batang Airport' },
  { code: 'KRY', name: 'Korla Airport' },
  { code: 'HMI', name: 'Hami Airport' },
  { code: 'WUA', name: 'Wuhai Airport' },
  { code: 'KCA', name: 'Karamay Airport' },
  { code: 'IQM', name: 'Yining Airport' },
  { code: 'TGO', name: 'Tacheng Airport' },
  { code: 'AAT', name: 'Altay Airport' },
  { code: 'KHG', name: 'Kashgar Airport' },
  { code: 'YIN', name: 'Yining Airport' },
  { code: 'ZHY', name: 'Zhanjiang Wuchuan Airport' },
  { code:'DMK', name: 'Don Mueang International Airport' },
  { code: 'CNX', name: 'Chiang Mai International Airport' },
  { code: 'KBV', name: 'Krabi International Airport' },
  { code: 'URT', name: 'Udon Thani International Airport' },
  { code: 'HDY', name: 'Hat Yai International Airport' },
  { code: 'HKT', name: 'Phuket International Airport' },
  { code: 'CEI', name: 'Chiang Rai International Airport' },
  { code: 'KKC', name: 'Khon Kaen Airport' },
  { code: 'NST', name: 'Nakhon Si Thammarat Airport' },
  { code: 'UBP', name: 'Ubon Ratchathani Airport' },
  { code: 'NAW', name: 'Narathiwat Airport' },
  { code: 'PHS', name: 'Phitsanulok Airport' },
  { code: 'PYY', name: 'Pai Airport' },
];

const airportOptions = airports.map((airport) => ({
  value: airport.code,
  label: `${airport.name} (${airport.code})`,
}));

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
              ? { value: origin, label: airportOptions.find((opt) => opt.value === origin)?.label || origin }
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
              ? { value: destination, label: airportOptions.find((opt) => opt.value === destination)?.label || destination }
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

  <>
    {flight.itineraries.map((itinerary, idx) => (
      <div key={idx}>
        <p><strong>Segments:</strong></p>
        {itinerary.segments.map((seg, index) => {
          const departureTime = new Date(seg.departure.at);
          const arrivalTime = new Date(seg.arrival.at);

          return (
            <div key={index} style={{ marginBottom: '0.5rem' }}>
              <p>
                ✈️ <strong>{seg.departure.iataCode}</strong> ({departureTime.toLocaleString()}) →{' '}
                <strong>{seg.arrival.iataCode}</strong> ({arrivalTime.toLocaleString()})
              </p>
              <p>
                🏢 <strong>Airline:</strong> {seg.carriers}
                {seg.aircraft && ` | Aircraft: ${seg.aircraft.code}`}
              </p>
              <p>
                ⏱️ <strong>Duration:</strong> {seg.duration?.replace('PT', '').toLowerCase()}
              </p>
            </div>
          );
        })}

        {/* Layovers */}
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
  </>

  {/* Baggage info */}
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
