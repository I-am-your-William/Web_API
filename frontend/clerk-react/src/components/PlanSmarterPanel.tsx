import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, TrendingDown, TrendingUp, ChevronDown, Plane, RefreshCw } from "lucide-react";

// Popular flight routes for price tracking
const popularRoutes = [
  { from: "KUL", to: "NRT", label: "KUL → NRT" },
  { from: "KUL", to: "SIN", label: "KUL → SIN" },
  { from: "KUL", to: "BKK", label: "KUL → BKK" },
  { from: "KUL", to: "HKG", label: "KUL → HKG" },
  { from: "SIN", to: "CDG", label: "SIN → CDG" },
  { from: "NRT", to: "LAX", label: "NRT → LAX" },
];

interface FlightPrice {
  id: string;
  route: string;
  price: number;
  currency: string;
  date: string;
  lastUpdated: string;
}

export function PlanSmarterPanel() {
  const [fromAmount, setFromAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [toAmount, setToAmount] = useState("0");
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);
  const [flightPrices, setFlightPrices] = useState<FlightPrice[]>([]);
  const [flightLoading, setFlightLoading] = useState(false);

  // Popular currencies - displayed by default
  const popularCurrencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "INR", name: "Indian Rupee" },
    { code: "BRL", name: "Brazilian Real" }
  ];

  // Extended currency list - shown when "Show all currencies" is toggled
  const allCurrencies = [
    ...popularCurrencies,
    { code: "AED", name: "UAE Dirham" },
    { code: "ARS", name: "Argentine Peso" },
    { code: "BGN", name: "Bulgarian Lev" },
    { code: "CLP", name: "Chilean Peso" },
    { code: "COP", name: "Colombian Peso" },
    { code: "CZK", name: "Czech Koruna" },
    { code: "DKK", name: "Danish Krone" },
    { code: "EGP", name: "Egyptian Pound" },
    { code: "HKD", name: "Hong Kong Dollar" },
    { code: "HUF", name: "Hungarian Forint" },
    { code: "IDR", name: "Indonesian Rupiah" },
    { code: "ILS", name: "Israeli Shekel" },
    { code: "KRW", name: "South Korean Won" },
    { code: "MXN", name: "Mexican Peso" },
    { code: "MYR", name: "Malaysian Ringgit" },
    { code: "NOK", name: "Norwegian Krone" },
    { code: "NZD", name: "New Zealand Dollar" },
    { code: "PHP", name: "Philippine Peso" },
    { code: "PLN", name: "Polish Zloty" },
    { code: "RON", name: "Romanian Leu" },
    { code: "RUB", name: "Russian Ruble" },
    { code: "SEK", name: "Swedish Krona" },
    { code: "SGD", name: "Singapore Dollar" },
    { code: "THB", name: "Thai Baht" },
    { code: "TRY", name: "Turkish Lira" },
    { code: "ZAR", name: "South African Rand" }
  ];

  const currenciesToShow = showAllCurrencies ? allCurrencies : popularCurrencies;

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
      if (!apiKey) {
        throw new Error('API key is missing. Please set VITE_EXCHANGE_RATE_API_KEY in your .env file.');
      }
      
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Exchange rate data:', data);
      
      if (data.result === 'success' && data.conversion_rates) {
        setExchangeRates(data.conversion_rates);
        
        // Calculate conversion
        const amount = parseFloat(fromAmount) || 0;
        const rate = data.conversion_rates[toCurrency] || 1;
        setToAmount((amount * rate).toFixed(2));
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Use fallback rates when API fails
      const amount = parseFloat(fromAmount) || 0;
      const basicRate = fromCurrency === "USD" && toCurrency === "EUR" ? 0.85 : 
                       fromCurrency === "EUR" && toCurrency === "USD" ? 1.18 :
                       fromCurrency === "USD" && toCurrency === "GBP" ? 0.79 :
                       fromCurrency === "GBP" && toCurrency === "USD" ? 1.27 : 1;
      setToAmount((amount * basicRate).toFixed(2));
    }
    setIsLoading(false);
  };

// Popular flight routes from around the world for diverse results
const globalRoutes = [
  { from: "KUL", to: "SIN" }, { from: "KUL", to: "NRT" }, { from: "KUL", to: "BKK" },
  { from: "SIN", to: "CDG" }, { from: "SIN", to: "NRT" }, { from: "HKG", to: "LAX" },
  { from: "BKK", to: "NRT" }, { from: "NRT", to: "LAX" }, { from: "ICN", to: "SFO" },
  { from: "DXB", to: "LHR" }, { from: "LHR", to: "JFK" }, { from: "CDG", to: "JFK" },
  { from: "PEK", to: "LAX" }, { from: "HND", to: "SFO" }, { from: "DEL", to: "LHR" }
];

  const fetchFlightPrices = async () => {
    setFlightLoading(true);
    try {
      const allFlights: any[] = [];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const departureDate = tomorrow.toISOString().split('T')[0];

      // Randomly select 3-4 routes to get diverse results
      const selectedRoutes = globalRoutes
        .sort(() => Math.random() - 0.5)
        .slice(0, 4); // Get 4 routes to ensure we get at least 3 results      // Fetch flights for selected routes with delays to avoid rate limits
      const promises = selectedRoutes.map(async (route, index) => {
        try {
          // Add increasing delay between requests to avoid rate limiting
          const delay = index * 1500; // 1.5 seconds between each request
          if (delay > 0) {
            console.log(`⏱️ Waiting ${delay}ms before fetching ${route.from}-${route.to}...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          const params = new URLSearchParams({
            origin: route.from,
            destination: route.to,
            departureDate,
            adults: '1',
            travelClass: 'ECONOMY'
          });

          console.log(`🔍 Fetching flights for ${route.from}-${route.to}...`);
          const response = await fetch(`/api/flights?${params}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              console.log(`✅ Found ${data.data.length} flights for ${route.from}-${route.to}`);
              // Take just the first/cheapest flight from each route
              return data.data[0];
            } else if (data.rateLimited) {
              console.log(`⚠️ Rate limited for route ${route.from}-${route.to}, skipping...`);
            } else {
              console.log(`📭 No flights found for ${route.from}-${route.to}`);
            }
          } else if (response.status === 429) {
            console.log(`⚠️ Rate limit hit for route ${route.from}-${route.to}, skipping...`);
          } else {
            console.log(`❌ Error response for ${route.from}-${route.to}: ${response.status}`);
          }
          return null;
        } catch (error) {
          console.error(`❌ Error fetching flights for ${route.from}-${route.to}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validFlights = results.filter(flight => flight !== null);

      // Format the flights
      const formattedFlights: FlightPrice[] = validFlights.slice(0, 3).map((flight, index) => {
        const firstSegment = flight.itineraries?.[0]?.segments?.[0];
        const route = `${firstSegment?.departure.iataCode} → ${firstSegment?.arrival.iataCode}`;
        
        const depDate = new Date(firstSegment?.departure.at);
        const formattedDate = depDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });

        return {
          id: flight.id || `flight-${index}`,
          route: route || 'Unknown Route', // Ensure route is always defined
          price: parseFloat(flight.price.total),
          currency: flight.price.currency || 'MYR', // Use currency from API if available
          date: formattedDate,
          lastUpdated: new Date().toLocaleTimeString()
        };
      });

      setFlightPrices(formattedFlights);
    } catch (error) {
      console.error('Error fetching flight prices:', error);
      setFlightPrices([]);
    }
    setFlightLoading(false);
  };

  useEffect(() => {
    fetchExchangeRates();
    fetchFlightPrices();
  }, [fromCurrency, toCurrency]);

  const handleAmountChange = (value: string) => {
    setFromAmount(value);
    if (exchangeRates) {
      const amount = parseFloat(value) || 0;
      const rate = exchangeRates[toCurrency] || 1;
      setToAmount((amount * rate).toFixed(2));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-2xl shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Plan Smarter</h3>
          
          {/* Currency Converter */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Currency Converter</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="1000"
                    value={fromAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="w-24 p-3 border border-slate-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currenciesToShow.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code}
                      </SelectItem>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                        className="w-full text-xs text-slate-600 hover:text-primary"
                      >
                        <ChevronDown className={`w-3 h-3 mr-1 transition-transform ${showAllCurrencies ? 'rotate-180' : ''}`} />
                        {showAllCurrencies ? 'Show Popular' : 'Show All Currencies'}
                      </Button>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-center">
                <ArrowUpDown className="w-5 h-5 text-slate-400 mx-auto" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={isLoading ? "Loading..." : toAmount}
                    readOnly
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                  />
                </div>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="w-24 p-3 border border-slate-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currenciesToShow.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code}
                      </SelectItem>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                        className="w-full text-xs text-slate-600 hover:text-primary"
                      >
                        <ChevronDown className={`w-3 h-3 mr-1 transition-transform ${showAllCurrencies ? 'rotate-180' : ''}`} />
                        {showAllCurrencies ? 'Show Popular' : 'Show All Currencies'}
                      </Button>
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Flight Price Tracker */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900">Flight Price Tracker</h4>
              <Button
                onClick={fetchFlightPrices}
                variant="outline"
                size="sm"
                disabled={flightLoading}
                className="text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${flightLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <div className="space-y-3">
              {flightLoading ? (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Loading flight prices...
                </div>
              ) : flightPrices.length > 0 ? (
                flightPrices.map((flight) => (
                  <div key={flight.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 flex items-center">
                        <Plane className="w-4 h-4 mr-2 text-slate-400" />
                        {flight.route}
                      </div>
                      <div className="text-sm text-slate-500">{flight.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">MYR {flight.price.toFixed(0)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-slate-500">
                  <Plane className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No flight prices available</p>
                  <p className="text-xs">Click refresh to load latest prices</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}