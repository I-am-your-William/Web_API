import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "@clerk/clerk-react"
import {
  ArrowLeft,
  Plane,
  Calendar,
  Clock,
  Luggage,
  User,
  CreditCard,
  Mail,
  Phone,
  Shield,
  Plus,
  Coffee,
} from "lucide-react"

type Segment = {
  departure: { iataCode: string; at: string; terminal?: string }
  arrival: { iataCode: string; at: string; terminal?: string }
  carrierCode?: string
  number: string
  duration: string
  aircraft?: { code: string }
}

type Passenger = {
  name: string
  gender: string
  birthday: string
  email?: string
  phone?: string
  title?: string
  passengerNumber?: number
}

type EmergencyContact = {
  name?: string
  phone?: string
  relation?: string
}

type PrimaryContact = {
  email?: string
  phone?: string
}

type Extras = {
  extraBaggage?: boolean
  insurance?: boolean
  mealPreference?: string
  seatSelection?: boolean
}

type Booking = {
  bookingId: string
  createdAt: string
  price: {
    base: string
    total: string
    grandTotal: string
    currency: string
  }
  baggageAllowances: number[]
  itineraries: {
    segments: Segment[]
    duration: string
  }[]
  passengers: Passenger[]
  emergencyContact?: EmergencyContact
  primaryContact?: PrimaryContact
  extras?: Extras
  totalPrice?: number
  type?: string
  flightId?: string
  userId?: string
}

// Helper function to format duration
const formatDuration = (duration: string) => {
  return duration.replace("PT", "").replace("H", "h ").replace("M", "m").toLowerCase()
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return {
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
    full: date.toLocaleString(),
  }
}

// Helper function to format baggage allowance
const formatBaggageAllowance = (allowance: number) => {
  return allowance > 0 ? "Yes" : "No"
}

// Helper function to format currency
const formatCurrency = (amount: number | string, currency = "MYR") => {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return `${currency} ${numAmount.toFixed(2)}`
}

export default function ViewBookingPage() {
  const { state } = useLocation()
  const { id } = useParams()
  const [booking, setBooking] = useState<Booking | null>(state?.booking ?? null)
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [primaryContact, setPrimaryContact] = useState<PrimaryContact | null>(null)
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null)
  const [extras, setExtras] = useState<Extras | null>(null)
  const [totalPrice, setTotalPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchContactsAndExtras = async () => {
      try {
        setLoading(true)
        const token = await getToken()
        const response = await fetch(`http://localhost:5000/api/bookings/${id}/contacts`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setPrimaryContact(data.primaryContact)
          setEmergencyContact(data.emergencyContact)
          setExtras(data.extras)
          if (data.totalPrice !== undefined) {
            setTotalPrice(data.totalPrice)
          }
        }
      } catch (err) {
        console.error("Error fetching contacts and extras:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchContactsAndExtras()
  }, [id, getToken])

  useEffect(() => {
    if (booking || !id) return

    const fetchSingleBooking = async () => {
      try {
        const token = await getToken()
        const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const raw = await response.json()
        console.log("Fetched booking data from API:", raw)
        setBooking(raw)
      } catch (err: any) {
        console.error("Error fetching single booking:", err.message)
      }
    }

    fetchSingleBooking()
  }, [booking, id, getToken])

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="text-sm text-gray-500">Loading booking details...</div>
          {id && <div className="text-xs text-gray-400 mt-2">Booking ID: {id}</div>}
        </div>
      </div>
    )
  }

  // Safe data access with fallbacks
  const price = booking.price || {}
  const currency = price.currency || "MYR"
  const itineraries = booking.itineraries || []
  const airlineCodes: string[] = (booking as any).airlineCodes || []
  const baggageAllowances = booking.baggageAllowances || []

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto font-sans bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
      >
        <ArrowLeft size={18} />
        <span>Back to Bookings</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Summary</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <Calendar size={16} />
              <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-500">Booking ID</span>
              <p className="font-mono font-medium">{booking.bookingId}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl flex flex-col">
            <span className="text-sm text-gray-500">Airline</span>
            <span className="font-medium">{airlineCodes.join(", ") || "Unknown Airline"}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl flex flex-col">
            <span className="text-sm text-gray-500">Total Price</span>
            <span className="font-medium text-lg">
              {totalPrice
                ? formatCurrency(totalPrice, currency)
                : booking.totalPrice
                  ? formatCurrency(booking.totalPrice, currency)
                  : price.total
                    ? `${currency} ${price.total}`
                    : price.grandTotal
                      ? `${currency} ${price.grandTotal}`
                      : "N/A"}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl flex flex-col">
            <span className="text-sm text-gray-500">Passengers</span>
            <span className="font-medium">
              {booking.passengers.length} {booking.passengers.length === 1 ? "person" : "people"}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl flex flex-col">
            <span className="text-sm text-gray-500">Baggage Included</span>
            <span className="font-medium">
              {baggageAllowances.some((allowance: number) => allowance > 0) ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Itineraries Section - Takes 2/3 of the space */}
        <div className="md:col-span-2">
          {itineraries.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Plane size={20} />
                Flight Itinerary
              </h2>

              {itineraries.map((it: { segments: Segment[]; duration: string }, idx: number) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">{idx === 0 ? "Outbound" : "Return"} Flight</h3>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-500">Total duration: {formatDuration(it.duration)}</span>
                    </div>
                  </div>

                  {/* Flight segments */}
                  <div className="space-y-8">
                    {it.segments.map((segment: Segment, segIdx: number) => {
                      const departureInfo = formatDate(segment.departure.at)
                      const arrivalInfo = formatDate(segment.arrival.at)

                      return (
                        <div key={segIdx} className="relative">
                          {/* Flight number and duration */}
                          <div className="flex justify-between items-center mb-4">
                            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                              Flight {segment.carrierCode ?? ""}
                              {segment.number}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock size={14} />
                              {formatDuration(segment.duration)}
                            </div>
                          </div>

                          {/* Timeline */}
                          <div className="flex">
                            {/* Departure */}
                            <div className="w-1/3 pr-4">
                              <div className="text-2xl font-bold">{departureInfo.time}</div>
                              <div className="text-sm font-medium">{departureInfo.date}</div>
                              <div className="text-lg font-bold mt-1">{segment.departure.iataCode}</div>
                              {segment.departure.terminal && (
                                <div className="text-sm text-gray-500">Terminal {segment.departure.terminal}</div>
                              )}
                            </div>

                            {/* Flight path visualization */}
                            <div className="flex-grow relative flex flex-col items-center justify-center">
                              <div className="h-full absolute left-1/2 transform -translate-x-1/2 border-l-2 border-dashed border-gray-300"></div>
                              <div className="bg-white z-10 p-1 rounded-full border-2 border-gray-300">
                                <Plane size={20} className="text-gray-500 transform -rotate-90" />
                              </div>
                            </div>

                            {/* Arrival */}
                            <div className="w-1/3 pl-4 text-right">
                              <div className="text-2xl font-bold">{arrivalInfo.time}</div>
                              <div className="text-sm font-medium">{arrivalInfo.date}</div>
                              <div className="text-lg font-bold mt-1">{segment.arrival.iataCode}</div>
                              {segment.arrival.terminal && (
                                <div className="text-sm text-gray-500">Terminal {segment.arrival.terminal}</div>
                              )}
                            </div>
                          </div>

                          {/* Aircraft information */}
                          {segment.aircraft && (
                            <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                              <Plane size={14} />
                              <span>Aircraft: {segment.aircraft.code}</span>
                            </div>
                          )}

                          {/* Layover information */}
                          {segIdx < it.segments.length - 1 && (
                            <div className="mt-6 mb-6">
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                                <Clock size={16} className="text-amber-500" />
                                <div>
                                  <span className="font-medium text-amber-700">Layover: </span>
                                  {(() => {
                                    const prevArrival = new Date(segment.arrival.at)
                                    const nextDeparture = new Date(it.segments[segIdx + 1].departure.at)
                                    const diffMinutes = Math.floor(
                                      (nextDeparture.getTime() - prevArrival.getTime()) / 60000,
                                    )
                                    const hours = Math.floor(diffMinutes / 60)
                                    const minutes = diffMinutes % 60
                                    return (
                                      <span className="text-amber-700">
                                        {hours}h {minutes}m at {segment.arrival.iataCode}
                                      </span>
                                    )
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Baggage information */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-gray-600">
                    <Luggage size={18} />
                    <span>Baggage allowance: </span>
                    <span className="font-medium">
                      {booking.baggageAllowances && booking.baggageAllowances[idx] !== undefined
                        ? formatBaggageAllowance(booking.baggageAllowances[idx])
                        : "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right sidebar - Takes 1/3 of the space */}
        <div className="md:col-span-1 space-y-8">
          {/* Price Summary Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard size={20} />
              Price Details
            </h2>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
              <div className="space-y-3">
                {price.base && (
                  <div className="flex justify-between text-gray-600">
                    <span>Base fare</span>
                    <span>
                      {currency} {price.base}
                    </span>
                  </div>
                )}

                {price.base && price.total && (
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & fees</span>
                    <span>
                      {currency} {(Number.parseFloat(price.total) - Number.parseFloat(price.base)).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Additional Services Section */}
          {extras && Object.values(extras).some((value) => value) && (
            <div>
              <h4 className="text-l font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={20} />
                Additional Services
              </h4>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
                <div className="space-y-3">
                  {extras.extraBaggage && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Luggage size={16} className="text-gray-500" />
                        <span>Extra Baggage (23kg)</span>
                      </div>
                      <span className="text-green-600 font-medium">✓ Added</span>
                    </div>
                  )}

                  {extras.seatSelection && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-500" />
                        <span>Seat Selection</span>
                      </div>
                      <span className="text-green-600 font-medium">✓ Added</span>
                    </div>
                  )}

                  {extras.mealPreference && extras.mealPreference !== "standard" && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coffee size={16} className="text-gray-500" />
                        <span>Special Meal ({extras.mealPreference})</span>
                      </div>
                      <span className="text-green-600 font-medium">✓ Added</span>
                    </div>
                  )}

                  {extras.insurance && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-gray-500" />
                        <span>Travel Insurance</span>
                      </div>
                      <span className="text-green-600 font-medium">✓ Added</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


                <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {totalPrice
                      ? formatCurrency(totalPrice, currency)
                      : booking.totalPrice
                        ? formatCurrency(booking.totalPrice, currency)
                        : price.total
                          ? `${currency} ${price.total}`
                          : price.grandTotal
                            ? `${currency} ${price.grandTotal}`
                            : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          
          {/* Passengers Section */}
          {booking.passengers && booking.passengers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} />
                Passenger{booking.passengers.length > 1 ? "s" : ""} Details
              </h2>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="mb-6 pb-6 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <User size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {p.title} {p.name}
                        </h3>
                        {p.passengerNumber && (
                          <span className="text-sm text-gray-500">Passenger {p.passengerNumber}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pl-9">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 block">Gender</span>
                          <p className="font-medium capitalize">{p.gender}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Date of Birth</span>
                          <p className="font-medium">{new Date(p.birthday).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Contact Information */}
                      {(p.email || p.phone) && (
                        <div className="space-y-2">
                          {p.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail size={14} className="text-gray-500" />
                              <span className="text-gray-600">{p.email}</span>
                            </div>
                          )}
                          {p.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={14} className="text-gray-500" />
                              <span className="text-gray-600">{p.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information Section */}
          {(primaryContact || emergencyContact || booking.primaryContact || booking.emergencyContact) && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Mail size={20} />
                Contact Information
              </h2>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md">
                <div className="space-y-4">
                  {/* Primary Contact */}
                  {(primaryContact || booking.primaryContact) && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Primary Contact</h4>
                      <div className="space-y-2">
                        {(primaryContact?.email || booking.primaryContact?.email) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={14} className="text-gray-500" />
                            <span className="text-gray-600">
                              {primaryContact?.email || booking.primaryContact?.email}
                            </span>
                          </div>
                        )}
                        {(primaryContact?.phone || booking.primaryContact?.phone) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className="text-gray-500" />
                            <span className="text-gray-600">
                              {primaryContact?.phone || booking.primaryContact?.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {(emergencyContact || booking.emergencyContact) && (
                    <div className={primaryContact || booking.primaryContact ? "pt-4 border-t border-gray-100" : ""}>
                      <h4 className="font-medium text-gray-800 mb-2">Emergency Contact</h4>
                      <div className="space-y-2">
                        {(emergencyContact?.name || booking.emergencyContact?.name) && (
                          <div className="flex items-center gap-2 text-sm">
                            <User size={14} className="text-gray-500" />
                            <span className="text-gray-600">
                              {emergencyContact?.name || booking.emergencyContact?.name}
                              {(emergencyContact?.relation || booking.emergencyContact?.relation) &&
                                ` (${emergencyContact?.relation || booking.emergencyContact?.relation})`}
                            </span>
                          </div>
                        )}
                        {(emergencyContact?.phone || booking.emergencyContact?.phone) && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className="text-gray-500" />
                            <span className="text-gray-600">
                              {emergencyContact?.phone || booking.emergencyContact?.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
