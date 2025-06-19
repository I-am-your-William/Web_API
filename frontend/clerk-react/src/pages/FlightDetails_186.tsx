import type React from "react"
import { useEffect, useState } from "react"
import { useLocation, useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Separator } from "../components/ui/separator"
import { Progress } from "../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Checkbox } from "../components/ui/checkbox"
import {
  Plane,
  Clock,
  Users,
  Luggage,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Shield,
  Wifi,
  Coffee,
  Monitor,
  ChevronLeft,
  Star,
  Info,
  Plus,
  Minus,
  Phone,
  Mail,
  User,
} from "lucide-react"

interface PassengerDetail {
  name: string
  gender: string
  birthday: string
  title: string
  email: string
  phone: string
}

interface ContactInfo {
  primaryEmail: string
  primaryPhone: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
}

interface FlightSegment {
  departure: { iataCode: string; at: string }
  arrival: { iataCode: string; at: string }
  carriers?: string
  carrierCode?: string
  aircraft?: { code: string }
  duration?: string
}

interface FlightItinerary {
  segments: FlightSegment[]
}

interface FlightData {
  id: string
  price: { total: string; grandTotal?: string }
  itineraries: FlightItinerary[]
  validatingAirlineCodes?: string[]
  airlineDetails?: { name: string }[]
  aircraftDetails?: { name: string; code: string }[]
}

const FlightDetails: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { userId, getToken } = useAuth()

  // State management
  const [flight, setFlight] = useState<FlightData | null>(location.state?.flight || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [numPassengers, setNumPassengers] = useState(1)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)
  const [bookingLoading, setBookingLoading] = useState(false)

  const [passengerDetails, setPassengerDetails] = useState<PassengerDetail[]>([
    { name: "", gender: "", birthday: "", title: "Mr", email: "", phone: "" },
  ])

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    primaryEmail: "",
    primaryPhone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  })

  // Additional booking options
  const [selectedExtras, setSelectedExtras] = useState({
    extraBaggage: false,
    seatSelection: false,
    mealPreference: "",
    insurance: false,
  })

  useEffect(() => {
    // Clear any previous errors when component mounts
    setError("")
  }, [])

  useEffect(() => {
    if (!flight && id) {
      setLoading(true)
      fetch(`http://localhost:5000/api/flights/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch flight data")
          return res.json()
        })
        .then((data) => {
          setFlight(data)
          setError("")
        })
        .catch((err) => {
          console.error(err)
          setError("Flight not found or error fetching details.")
        })
        .finally(() => setLoading(false))
    }
  }, [id, flight])

  const handlePassengerCountChange = (count: number) => {
    const validCount = Math.min(Math.max(count, 1), 9)
    setNumPassengers(validCount)
    const newDetails = Array.from(
      { length: validCount },
      (_, i) =>
        passengerDetails[i] || {
          name: "",
          gender: "",
          birthday: "",
          title: "Mr",
          email: "",
          phone: "",
        },
    )
    setPassengerDetails(newDetails)
  }

  const handlePassengerDetailChange = (index: number, field: keyof PassengerDetail, value: string) => {
    const updatedDetails = [...passengerDetails]
    updatedDetails[index][field] = value
    setPassengerDetails(updatedDetails)
  }

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo({ ...contactInfo, [field]: value })
  }

  const validatePassengerAndContactData = () => {
    if (!userId) {
      setError("Please log in to book a flight.")
      return false
    }
  

    // Validate passenger details
    if (
      passengerDetails.some((p) => !p.name.trim() || !p.gender || !p.birthday || !p.email.trim() || !p.phone.trim())
    ) {
      setError("Please complete all passenger information including email and phone for each passenger.")
      return false
    }

    // Validate contact information
    if (!contactInfo.primaryEmail || !contactInfo.primaryPhone) {
      setError("Please provide primary contact information.")
      return false
    }

    if (!contactInfo.emergencyContactName || !contactInfo.emergencyContactPhone) {
      setError("Please provide emergency contact information.")
      return false
    }

    return true
  }

  const saveBookingToDatabase = async (bookingData: any) => {
    const token = await getToken()

    try {
      const response = await fetch("http://localhost:5000/api/bookings/flights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to save booking")
      }

      return data
    } catch (error) {
      console.error("Database save error:", error)
      throw error
    }
  }

  const handleBooking = async () => {
    if (!validatePassengerAndContactData()) return

    setBookingLoading(true)
    setError("")

    const bookingPayload = {
      userId,
      flightId: flight?.id || id,
      passengerDetails: passengerDetails.map((passenger, index) => ({
        ...passenger,
        passengerNumber: index + 1,
        userId,
      })),
      primaryContact: {
        email: contactInfo.primaryEmail,
        phone: contactInfo.primaryPhone,
      },
      emergencyContact: {
        name: contactInfo.emergencyContactName,
        phone: contactInfo.emergencyContactPhone,
        relation: contactInfo.emergencyContactRelation,
      },
      extras: selectedExtras,
      contactInfo,
      selectedExtras,
      flightDetails: flight,
      totalPrice: calculateTotalPrice(),
      bookingDate: new Date().toISOString(),
      status: "confirmed",
    }

    try {
      console.log("Saving booking to database:", bookingPayload)
      const result = await saveBookingToDatabase(bookingPayload)

      setShowSuccessModal(true)
      setTimeout(() => {
        navigate(`/view-booking/${result.bookingId}`)
      }, 3000)
    } catch (error: any) {
      console.error("Booking failed:", error)
      setError(`Booking failed: ${error?.message || "Please try again."}`)
    } finally {
      setBookingLoading(false)
    }
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
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    }
  }

  const formatDuration = (duration?: string) => {
    if (!duration) return "N/A"
    return duration.replace("PT", "").replace("H", "h ").replace("M", "m").toLowerCase()
  }

  const calculateLayover = (prevArrival: string, nextDeparture: string) => {
    const layoverMinutes = Math.floor((new Date(nextDeparture).getTime() - new Date(prevArrival).getTime()) / 60000)
    const hours = Math.floor(layoverMinutes / 60)
    const minutes = layoverMinutes % 60
    return `${hours}h ${minutes}m`
  }

  const calculateTotalPrice = () => {
    const basePrice = Number.parseFloat(flight?.price?.total || "0") * numPassengers
    let extrasPrice = 0

    if (selectedExtras.extraBaggage) extrasPrice += 50 * numPassengers
    if (selectedExtras.seatSelection) extrasPrice += 25 * numPassengers
    if (selectedExtras.mealPreference && selectedExtras.mealPreference !== "standard") extrasPrice += 15 * numPassengers
    if (selectedExtras.insurance) extrasPrice += 30 * numPassengers

    return basePrice + extrasPrice
  }

  const renderFlightSegment = (segment: FlightSegment, index: number) => {
    const departure = formatDateTime(segment.departure.at)
    const arrival = formatDateTime(segment.arrival.at)

    return (
      <div key={index} className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{departure.time}</div>
              <div className="text-sm font-medium">{segment.departure.iataCode}</div>
              <div className="text-xs text-muted-foreground">{departure.date}</div>
            </div>

            <div className="flex flex-col items-center gap-2 min-w-[120px]">
              <div className="text-xs text-muted-foreground">{formatDuration(segment.duration)}</div>
              <div className="w-full h-px bg-border relative">
                <Plane className="h-4 w-4 absolute -top-2 left-1/2 transform -translate-x-1/2 bg-background text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">Direct</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">{arrival.time}</div>
              <div className="text-sm font-medium">{segment.arrival.iataCode}</div>
              <div className="text-xs text-muted-foreground">{arrival.date}</div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4" />
              <span>{segment.carriers || segment.carrierCode}</span>
            </div>
            {segment.aircraft && <div className="text-xs text-muted-foreground">Aircraft: {segment.aircraft.code}</div>}
          </div>
        </div>
      </div>
    )
  }

  const renderItinerary = (itinerary: FlightItinerary, index: number, type: "Outbound" | "Return") => {
    return (
      <Card key={index} className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            {type} Flight
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {itinerary.segments.map((segment, segIndex) => (
            <div key={segIndex}>
              {renderFlightSegment(segment, segIndex)}
              {segIndex < itinerary.segments.length - 1 && (
                <div className="flex items-center gap-2 py-2 px-4 bg-orange-50 rounded text-sm text-orange-700">
                  <Clock className="h-4 w-4" />
                  <span>
                    Layover: {calculateLayover(segment.arrival.at, itinerary.segments[segIndex + 1].departure.at)} at{" "}
                    {segment.arrival.iataCode}
                  </span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const renderPassengerAndContactForm = () => (
    <div className="space-y-8">
      {/* Passenger Count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Passenger Information</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePassengerCountChange(numPassengers - 1)}
            disabled={numPassengers <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="px-3 py-1 bg-muted rounded text-sm font-medium">{numPassengers}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePassengerCountChange(numPassengers + 1)}
            disabled={numPassengers >= 9}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Passenger Details */}
      {passengerDetails.map((passenger, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Passenger {idx + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Select
                  value={passenger.title}
                  onValueChange={(value) => handlePassengerDetailChange(idx, "title", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Full Name *</Label>
                <Input
                  value={passenger.name}
                  onChange={(e) => handlePassengerDetailChange(idx, "name", e.target.value)}
                  placeholder="Enter full name as on passport"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select
                  value={passenger.gender}
                  onValueChange={(value) => handlePassengerDetailChange(idx, "gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={passenger.birthday}
                  onChange={(e) => handlePassengerDetailChange(idx, "birthday", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  type="email"
                  value={passenger.email}
                  onChange={(e) => handlePassengerDetailChange(idx, "email", e.target.value)}
                  placeholder="passenger@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  type="tel"
                  value={passenger.phone}
                  onChange={(e) => handlePassengerDetailChange(idx, "phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Separator />

      {/* Primary Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Primary Contact Information
          </CardTitle>
          <CardDescription>This will be used for booking confirmations and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Email Address *</Label>
              <Input
                type="email"
                value={contactInfo.primaryEmail}
                onChange={(e) => handleContactInfoChange("primaryEmail", e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Phone Number *</Label>
              <Input
                type="tel"
                value={contactInfo.primaryPhone}
                onChange={(e) => handleContactInfoChange("primaryPhone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergency Contact Information
          </CardTitle>
          <CardDescription>Person to contact in case of emergency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Emergency Contact Name *</Label>
              <Input
                value={contactInfo.emergencyContactName}
                onChange={(e) => handleContactInfoChange("emergencyContactName", e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Phone *</Label>
              <Input
                type="tel"
                value={contactInfo.emergencyContactPhone}
                onChange={(e) => handleContactInfoChange("emergencyContactPhone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select
                value={contactInfo.emergencyContactRelation}
                onValueChange={(value) => handleContactInfoChange("emergencyContactRelation", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderExtrasForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Additional Services</h3>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="extraBaggage"
            checked={selectedExtras.extraBaggage}
            onCheckedChange={(checked) => setSelectedExtras({ ...selectedExtras, extraBaggage: checked as boolean })}
          />
          <div className="flex-1">
            <Label htmlFor="extraBaggage" className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Luggage className="h-4 w-4" />
                Extra Baggage (23kg)
              </span>
              <span className="text-sm font-medium">+MYR 50/person</span>
            </Label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="seatSelection"
            checked={selectedExtras.seatSelection}
            onCheckedChange={(checked) => setSelectedExtras({ ...selectedExtras, seatSelection: checked as boolean })}
          />
          <div className="flex-1">
            <Label htmlFor="seatSelection" className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Preferred Seat Selection
              </span>
              <span className="text-sm font-medium">+MYR 25/person</span>
            </Label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="insurance"
            checked={selectedExtras.insurance}
            onCheckedChange={(checked) => setSelectedExtras({ ...selectedExtras, insurance: checked as boolean })}
          />
          <div className="flex-1">
            <Label htmlFor="insurance" className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Travel Insurance
              </span>
              <span className="text-sm font-medium">+MYR 30/person</span>
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Meal Preference</Label>
          <Select
            value={selectedExtras.mealPreference}
            onValueChange={(value) => setSelectedExtras({ ...selectedExtras, mealPreference: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select meal preference (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Meal</SelectItem>
              <SelectItem value="vegetarian">Vegetarian (+MYR 15/person)</SelectItem>
              <SelectItem value="vegan">Vegan (+MYR 15/person)</SelectItem>
              <SelectItem value="halal">Halal (+MYR 15/person)</SelectItem>
              <SelectItem value="kosher">Kosher (+MYR 15/person)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Loading flight details...</p>
        </div>
      </div>
    )
  }

  if (error || !flight) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Flight details not available."}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const perPassengerPrice = Number.parseFloat(flight?.price?.total || "0")
  const totalPrice = calculateTotalPrice()

  if (!flight?.itineraries || flight.itineraries.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Flight data is incomplete or missing. Please go back and select a flight again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Flight Details</h1>
          <p className="w-full lg:w-auto text-black dark:text-white text-muted-foreground">Review and book your selected flight</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Flight Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Information */}
          {flight.itineraries?.map((itinerary, idx) =>
            renderItinerary(itinerary, idx, idx === 0 ? "Outbound" : "Return"),
          )}

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Flight Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span>WiFi Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Coffee className="h-4 w-4 text-brown-500" />
                  <span>Meals Included</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Monitor className="h-4 w-4 text-purple-500" />
                  <span>Entertainment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Luggage className="h-4 w-4 text-green-500" />
                  <span>Baggage Included</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Booking</CardTitle>
              <CardDescription>
                Step {bookingStep} of 2 - {bookingStep === 1 ? "Passenger & Contact Details" : "Review & Pay"}
              </CardDescription>
              <Progress value={(bookingStep / 2) * 100} className="w-full" />
            </CardHeader>
            <CardContent>
              <Tabs value={bookingStep.toString()} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="1">Passenger & Contact Details</TabsTrigger>
                  <TabsTrigger value="2" disabled={bookingStep < 2}>
                    Review & Pay
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="1" className="mt-6 space-y-6">
                  {renderPassengerAndContactForm()}
                  <Separator />
                  {renderExtrasForm()}
                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => setBookingStep(2)}
                      disabled={
                        passengerDetails.some(
                          (p) => !p.name.trim() || !p.gender || !p.birthday || !p.email.trim() || !p.phone.trim(),
                        ) ||
                        !contactInfo.primaryEmail ||
                        !contactInfo.primaryPhone ||
                        !contactInfo.emergencyContactName ||
                        !contactInfo.emergencyContactPhone
                      }
                      size="lg"
                      className="w-full lg:w-auto text-black dark:text-white"
                    >
                      Review Booking
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="2" className="mt-6">
                  <div className="space-y-6">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Please review all details carefully before confirming your booking.
                      </AlertDescription>
                    </Alert>

                    {/* Booking Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Passengers ({numPassengers})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {passengerDetails.map((passenger, idx) => (
                            <div key={idx} className="text-sm">
                              <strong>
                                {passenger.title} {passenger.name}
                              </strong>
                              <div className="text-muted-foreground">
                                {passenger.email} | {passenger.phone}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <strong>Primary:</strong> {contactInfo.primaryEmail} | {contactInfo.primaryPhone}
                          </div>
                          <div>
                            <strong>Emergency:</strong> {contactInfo.emergencyContactName} (
                            {contactInfo.emergencyContactRelation})
                          </div>
                          <div className="text-muted-foreground">{contactInfo.emergencyContactPhone}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={() => setBookingStep(1)}>
                        Back to Details
                      </Button>
                      <Button onClick={handleBooking} disabled={bookingLoading} size="lg"
                      className="w-full lg:w-auto text-black dark:text-white">
                        {bookingLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Confirm Booking - MYR {totalPrice.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Price Summary */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Price Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Base Price ({numPassengers} passenger{numPassengers > 1 ? "s" : ""})
                  </span>
                  <span>MYR {(perPassengerPrice * numPassengers).toFixed(2)}</span>
                </div>

                {selectedExtras.extraBaggage && (
                  <div className="flex justify-between text-sm">
                    <span>Extra Baggage</span>
                    <span>MYR {(50 * numPassengers).toFixed(2)}</span>
                  </div>
                )}

                {selectedExtras.seatSelection && (
                  <div className="flex justify-between text-sm">
                    <span>Seat Selection</span>
                    <span>MYR {(25 * numPassengers).toFixed(2)}</span>
                  </div>
                )}

                {selectedExtras.mealPreference && selectedExtras.mealPreference !== "standard" && (
                  <div className="flex justify-between text-sm">
                    <span>Special Meals</span>
                    <span>MYR {(15 * numPassengers).toFixed(2)}</span>
                  </div>
                )}

                {selectedExtras.insurance && (
                  <div className="flex justify-between text-sm">
                    <span>Travel Insurance</span>
                    <span>MYR {(30 * numPassengers).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>MYR {totalPrice.toFixed(2)}</span>
              </div>

              <div className="text-xs text-muted-foreground">Prices include taxes and fees</div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Instant Confirmation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-green-500" />
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your flight has been successfully booked and saved to the database. You will receive a confirmation email
              shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={() => navigate("/bookings")} className="w-full lg:w-auto text-black dark:text-white w-full">
              View My Bookings
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FlightDetails



// import React, { useEffect, useState } from 'react';
// import { useLocation, useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '@clerk/clerk-react';

// const FlightDetails: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const { userId, getToken } = useAuth();
//   const [flight, setFlight] = useState<any>(location.state?.flight || null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [numPassengers, setNumPassengers] = useState(1);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   const [passengerDetails, setPassengerDetails] = useState([
//     { name: '', gender: '', birthday: '' }
//   ]);

//   useEffect(() => {
//     if (!flight && id) {
//       setLoading(true);
//       fetch(`http://localhost:5000/api/flights/${id}`)
//         .then((res) => {
//           if (!res.ok) throw new Error('Failed to fetch flight data');
//           return res.json();
//         })
//         .then((data) => {
//           setFlight(data);
//           setError('');
//         })
//         .catch((err) => {
//           console.error(err);
//           setError('Flight not found or error fetching details.');
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [id, flight]);

//   const handlePassengerCountChange = (count: number) => {
//     const validCount = Math.min(count, 9);
//     setNumPassengers(validCount);
//     const newDetails = Array.from({ length: validCount }, (_, i) => passengerDetails[i] || { name: '', gender: '', birthday: '' });
//     setPassengerDetails(newDetails);
//   };

//   const handlePassengerDetailChange = (index: number, field: 'name' | 'gender' | 'birthday', value: string) => {
//     const updatedDetails = [...passengerDetails];
//     updatedDetails[index][field] = value;
//     setPassengerDetails(updatedDetails);
//   };

//   const handleBooking = async () => {
//     if (!userId) {
//       alert('Please log in to book a flight.');
//       return;
//     }

//     if (passengerDetails.some(p => !p.name.trim() || !p.gender || !p.birthday)) {
//       alert('Please complete all passenger information.');
//       return;
//     }

//     if (!flight || !(flight.id || id)) {
//       alert('Flight information is missing.');
//       return;
//     }

//     const token = await getToken();

//     const bookingPayload = {
//       userId,
//       flightId: flight.id || id,
//       passengerDetails,
//       flightDetails: flight,
//     };

//     try {
//       const res = await fetch('http://localhost:5000/api/bookings/flights', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(bookingPayload),
//       });

//       const data = await res.json();
//       console.log('📦 Booking API response:', res.status, data);

//       if (!res.ok) {
//         const errorMsg = data?.message || data?.error || 'Booking failed';
//         alert(`Booking failed: ${errorMsg}`);
//         throw new Error(errorMsg);
//       }

//       setShowSuccessModal(true);
//       setTimeout(() => {
//         navigate(`/view-booking/${data.bookingId}`);
//       }, 3000);
//     } catch (error: any) {
//       console.error('Booking failed:', error);
//       alert(`Booking failed. ${error?.message || 'Please try again.'}`);
//     }
//   };

//   const renderItinerary = (itinerary: any, index: number, type: 'Departure' | 'Return') => {
//     return (
//       <div key={index} style={{ marginBottom: '2rem' }}>
//         <h3>{type} Flight</h3>
//         {itinerary.segments.map((seg: any, i: number) => {
//           const departureTime = new Date(seg.departure.at);
//           const arrivalTime = new Date(seg.arrival.at);
//           return (
//             <div key={i} style={{ marginBottom: '1rem' }}>
//               <p>
//                 <strong>From:</strong> {seg.departure.iataCode} at {departureTime.toLocaleString()}<br />
//                 <strong>To:</strong> {seg.arrival.iataCode} at {arrivalTime.toLocaleString()}<br />
//                 <strong>Flight Duration:</strong> {seg.duration.replace('PT', '').toLowerCase()}<br />
//                 <strong>Airline Code:</strong> {seg.carrierCode}<br />
//                 {seg.aircraft && <><strong>Aircraft:</strong> {seg.aircraft?.code}</>}
//               </p>
//               {i > 0 && (() => {
//                 const prevArrival = new Date(itinerary.segments[i - 1].arrival.at);
//                 const layoverMinutes = Math.floor((departureTime.getTime() - prevArrival.getTime()) / 60000);
//                 const hours = Math.floor(layoverMinutes / 60);
//                 const minutes = layoverMinutes % 60;
//                 return (
//                   <p style={{ color: 'gray' }}>
//                     🕓 Layover: {hours}h {minutes}m at {itinerary.segments[i - 1].arrival.iataCode}
//                   </p>
//                 );
//               })()}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   if (loading) return <p>Loading flight details...</p>;
//   if (error || !flight) return <p>{error || 'Flight details not available.'}</p>;

//   const perPassengerPrice = parseFloat(flight.price?.total || '0');
//   const totalPrice = (perPassengerPrice * numPassengers).toFixed(2);

//   return (
//     <div style={{ display: 'flex', padding: '2rem', gap: '2rem', alignItems: 'flex-start' }}>
//       {/* Left: Flight Details */}
//       <div style={{ flex: 2 }}>
//         <h2>Flight Details (ID: {id})</h2>
//         <button onClick={() => navigate(-1)}>← Back to Results</button>

//         {flight.itineraries?.map((itinerary: any, idx: number) =>
//           renderItinerary(itinerary, idx, idx === 0 ? 'Departure' : 'Return')
//         )}

//         {/* Airline Info */}
//         {/* <p><strong>Airline:</strong> {flight.validatingAirlineCodes?.[0]}</p> */}
//         <p><strong>Price per Passenger:</strong> MYR {perPassengerPrice.toFixed(2)}</p>
//         <p><strong>Total Price for {numPassengers} Passenger{numPassengers > 1 ? 's' : ''}:</strong> MYR {totalPrice}</p>
//       </div>

//       {/* Right: Passenger Booking Panel */}
//       <div style={{
//         flex: 1,
//         border: '1px solid #ccc',
//         padding: '1rem',
//         borderRadius: '8px',
//         backgroundColor: '#f9f9f9',
//         position: 'sticky',
//         top: '2rem'
//       }}>
//         <h3>Passenger Details</h3>
//         <label><strong>Number of Passengers:</strong></label><br />
//         <input
//           type="number"
//           min={1}
//           max={9}
//           value={numPassengers}
//           onChange={(e) => handlePassengerCountChange(Number(e.target.value))}
//           style={{ width: '60px', marginBottom: '0.5rem' }}
//         /><br />
//         <small style={{ color: 'gray' }}>Max 9 passengers allowed</small>

//         {passengerDetails.map((passenger, idx) => (
//           <div key={idx} style={{ marginBottom: '1rem' }}>
//             <label>Passenger {idx + 1} Name:</label><br />
//             <input
//               type="text"
//               value={passenger.name}
//               onChange={(e) => handlePassengerDetailChange(idx, 'name', e.target.value)}
//               required
//             /><br />

//             <label>Gender:</label><br />
//             <select
//               value={passenger.gender}
//               onChange={(e) => handlePassengerDetailChange(idx, 'gender', e.target.value)}
//               required
//             >
//               <option value="">Select gender</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </select><br />

//             <label>Birthday:</label><br />
//             <input
//               type="date"
//               value={passenger.birthday}
//               onChange={(e) => handlePassengerDetailChange(idx, 'birthday', e.target.value)}
//               required
//             />
//           </div>
//         ))}

//         <button
//           style={{
//             marginTop: '1rem',
//             backgroundColor: '#0070f3',
//             color: 'white',
//             padding: '0.5rem 1rem',
//             borderRadius: '5px',
//             border: 'none',
//             cursor: 'pointer'
//           }}
//           onClick={handleBooking}
//         >
//           ✈️ Book Now
//         </button>
//       </div>

//       {/* Success Modal */}
//       {showSuccessModal && (
//         <div style={{
//           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//           backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
//           justifyContent: 'center', alignItems: 'center', zIndex: 1000
//         }}>
//           <div style={{
//             background: 'white', padding: '2rem', borderRadius: '10px',
//             textAlign: 'center', maxWidth: '400px', width: '90%'
//           }}>
//             <h3 style={{ marginBottom: '1rem' }}>🎉 Booking Successful!</h3>
//             <p>You will be redirected to your booking shortly.</p>
//             <button
//               onClick={() => navigate('/bookings')}
//               style={{
//                 marginTop: '1rem',
//                 backgroundColor: '#0070f3',
//                 color: 'white',
//                 padding: '0.5rem 1rem',
//                 borderRadius: '5px',
//                 border: 'none',
//                 cursor: 'pointer'
//               }}
//             >
//               Go to My Bookings Now
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FlightDetails;
// // import React, { useEffect, useState } from 'react';
// // import { useLocation, useParams, useNavigate } from 'react-router-dom';
// // import { useAuth } from '@clerk/clerk-react';

// // const FlightDetails: React.FC = () => {
// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const { id } = useParams<{ id: string }>();
// //   const { userId, getToken } = useAuth();
// //   const [flight, setFlight] = useState<any>(location.state?.flight || null);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [numPassengers, setNumPassengers] = useState(1);
// //   const [showSuccessModal, setShowSuccessModal] = useState(false);

// //   const [passengerDetails, setPassengerDetails] = useState([
// //     { name: '', gender: '', birthday: '' }
// //   ]);

// //   useEffect(() => {
// //     if (!flight && id) {
// //       setLoading(true);
// //       fetch(`http://localhost:5000/api/flights/${id}`)
// //         .then((res) => {
// //           if (!res.ok) throw new Error('Failed to fetch flight data');
// //           return res.json();
// //         })
// //         .then((data) => {
// //           setFlight(data);
// //           setError('');
// //         })
// //         .catch((err) => {
// //           console.error(err);
// //           setError('Flight not found or error fetching details.');
// //         })
// //         .finally(() => setLoading(false));
// //     }
// //   }, [id, flight]);

// //   const handlePassengerCountChange = (count: number) => {
// //     const validCount = Math.min(count, 9);
// //     setNumPassengers(validCount);
// //     const newDetails = Array.from({ length: validCount }, (_, i) => passengerDetails[i] || { name: '', gender: '', birthday: '' });
// //     setPassengerDetails(newDetails);
// //   };

// //   const handlePassengerDetailChange = (index: number, field: 'name' | 'gender' | 'birthday', value: string) => {
// //     const updatedDetails = [...passengerDetails];
// //     updatedDetails[index][field] = value;
// //     setPassengerDetails(updatedDetails);
// //   };

// //   const handleBooking = async () => {
// //     if (!userId) {
// //       alert('Please log in to book a flight.');
// //       return;
// //     }

// //     if (passengerDetails.some(p => !p.name.trim() || !p.gender || !p.birthday)) {
// //       alert('Please complete all passenger information.');
// //       return;
// //     }

// //     if (!flight || !(flight.id || id)) {
// //       alert('Flight information is missing.');
// //       return;
// //     }

// //     const token = await getToken();

// //   //     // Map airline codes to names
// //   // const airlineMap = new Map();
// //   // if (flight.airlineDetails && flight.airlineCodes) {
// //   //   flight.airlineCodes.forEach((code: string, index: number) => {
// //   //     const airline = flight.airlineDetails[index];
// //   //     if (airline?.name) {
// //   //       airlineMap.set(code, airline.name);
// //   //     }
// //   //   });
// //   // }

// //   // // Enrich each itinerary segment
// //   // const enrichedItineraries = flight.itineraries.map((itinerary: any) => ({
// //   //   ...itinerary,
// //   //   segments: itinerary.segments.map((segment: any) => ({
// //   //     ...segment,
// //   //     airlineName: airlineMap.get(segment.carrierCode) || '',
// //   //     aircraftName:
// //   //       flight.aircraftDetails?.find(
// //   //         (aircraft: any) => aircraft.code === segment.aircraft?.code
// //   //       )?.name || '',
// //   //   })),
// //   // }));

// // //   const bookingPayload = {
// // //   userId,
// // //   flightId: flight.id || id,
// // //   totalPrice: parseFloat(flight.price?.grandTotal || '0') * passengerDetails.length,
// // //   passengerDetails: passengerDetails.map((p) => ({
// // //     ...p,
// // //     userId,
// // //     type: 'flight',
// // //   })),
// // //   flightDetails: {
// // //     ...flight,
// // //     itineraries: enrichedItineraries,
// // //     totalPrice: parseFloat(flight.price?.grandTotal || '0') * passengerDetails.length,
// // //   },
// // // };



// //     const bookingPayload = {
// //       userId,
// //       flightId: flight.id || id,
// //       passengerDetails,
// //       flightDetails: flight,
// //     };

// //     // const totalPriceValue = parseFloat(totalPrice); // Already calculated earlier

// //     // // Extract all unique aircrafts and airline names
// //     // const airlineNames = new Set<string>();
// //     // const aircraftNames = new Set<string>();

// //     // flight.itineraries?.forEach((itinerary: any) => {
// //     //   itinerary.segments.forEach((seg: any) => {
// //     //     const airline = flight.airlineDetails?.[0]?.name || seg.carrierCode;
// //     //     const aircraft = flight.aircraftDetails?.[0]?.name || seg.aircraft?.code;
// //     //     if (airline) airlineNames.add(airline);
// //     //     if (aircraft) aircraftNames.add(aircraft);
// //     //   });
// //     // });

// //     // const bookingPayload = {
// //     //   userId,
// //     //   flightId: flight.id || id,
// //     //   passengerDetails,
// //     //   flightDetails: flight,
// //     //   totalPrice: totalPriceValue,
// //     //   airlines: Array.from(airlineNames),
// //     //   aircrafts: Array.from(aircraftNames),
// //     // };


// //     try {
// //       const res = await fetch('http://localhost:5000/api/bookings/flights', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify(bookingPayload),
// //       });

// //       const data = await res.json();
// //       console.log('📦 Booking API response:', res.status, data);

// //       if (!res.ok) {
// //         const errorMsg = data?.message || data?.error || 'Booking failed';
// //         alert(`Booking failed: ${errorMsg}`);
// //         throw new Error(errorMsg);
// //       }

// //       setShowSuccessModal(true);
// //       setTimeout(() => {
// //         navigate(`/bookings/${data.bookingId}`);
// //       }, 3000);
// //     } catch (error: any) {
// //       console.error('Booking failed:', error);
// //       alert(`Booking failed. ${error?.message || 'Please try again.'}`);
// //     }
// //   };

// //   const renderItinerary = (itinerary: any, index: number, type: 'Departure' | 'Return') => {
// //     return (
// //       <div key={index} style={{ marginBottom: '2rem' }}>
// //         <h3>{type} Flight</h3>
// //         {itinerary.segments.map((seg: any, i: number) => {
// //           const departureTime = new Date(seg.departure.at);
// //           const arrivalTime = new Date(seg.arrival.at);
// //           const airlineName = flight.airlineDetails?.[0]?.name || seg.carrierCode;
// //           const aircraftName = flight.aircraftDetails?.[0]?.name || seg.aircraft?.code;
// //           return (
// //             <div key={i} style={{ marginBottom: '1rem' }}>
// //               <p>
// //                 <strong>From:</strong> {seg.departure.iataCode} at {departureTime.toLocaleString()}<br />
// //                 <strong>To:</strong> {seg.arrival.iataCode} at {arrivalTime.toLocaleString()}<br />
// //                 <strong>Flight Duration:</strong> {seg.duration.replace('PT', '').toLowerCase()}<br />
// //                 <strong>Airline :</strong> {airlineName} ({seg.carrierCode})<br />
// //                 {seg.aircraft && <><strong>Aircraft:</strong> {aircraftName} ({seg.aircraft?.code})    </>}
// //               </p>
// //               {i > 0 && (() => {
// //                 const prevArrival = new Date(itinerary.segments[i - 1].arrival.at);
// //                 const layoverMinutes = Math.floor((departureTime.getTime() - prevArrival.getTime()) / 60000);
// //                 const hours = Math.floor(layoverMinutes / 60);
// //                 const minutes = layoverMinutes % 60;
// //                 return (
// //                   <p style={{ color: 'gray' }}>
// //                     🕓 Layover: {hours}h {minutes}m at {itinerary.segments[i - 1].arrival.iataCode}
// //                   </p>
// //                 );
// //               })()}
// //             </div>
// //           );
// //         })}
// //       </div>
// //     );
// //   };

// //   if (loading) return <p>Loading flight details...</p>;
// //   if (error || !flight) return <p>{error || 'Flight details not available.'}</p>;

// //   const perPassengerPrice = parseFloat(flight.price?.total || '0');
// //   const totalPrice = (perPassengerPrice * numPassengers).toFixed(2);

// //   return (
// //     <div style={{ display: 'flex', padding: '2rem', gap: '2rem', alignItems: 'flex-start' }}>
// //       {/* Left: Flight Details */}
// //       <div style={{ flex: 2 }}>
// //         <h2>Flight Details (ID: {id})</h2>
// //         <button onClick={() => navigate(-1)}>← Back to Results</button>

// //         {flight.itineraries?.map((itinerary: any, idx: number) =>
// //           renderItinerary(itinerary, idx, idx === 0 ? 'Departure' : 'Return')
// //         )}

// //         {/* Airline Info */}
// //         {/* <p><strong>Airline:</strong> {flight.validatingAirlineCodes?.[0]}</p> */}
// //         <p><strong>Price per Passenger:</strong> MYR {perPassengerPrice.toFixed(2)}</p>
// //         <p><strong>Total Price for {numPassengers} Passenger{numPassengers > 1 ? 's' : ''}:</strong> MYR {totalPrice}</p>
// //       </div>

// //       {/* Right: Passenger Booking Panel */}
// //       <div style={{
// //         flex: 1,
// //         border: '1px solid #ccc',
// //         padding: '1rem',
// //         borderRadius: '8px',
// //         backgroundColor: '#f9f9f9',
// //         position: 'sticky',
// //         top: '2rem'
// //       }}>
// //         <h3>Passenger Details</h3>
// //         <label><strong>Number of Passengers:</strong></label><br />
// //         <input
// //           type="number"
// //           min={1}
// //           max={9}
// //           value={numPassengers}
// //           onChange={(e) => handlePassengerCountChange(Number(e.target.value))}
// //           style={{ width: '60px', marginBottom: '0.5rem' }}
// //         /><br />
// //         <small style={{ color: 'gray' }}>Max 9 passengers allowed</small>

// //         {passengerDetails.map((passenger, idx) => (
// //           <div key={idx} style={{ marginBottom: '1rem' }}>
// //             <label>Passenger {idx + 1} Name:</label><br />
// //             <input
// //               type="text"
// //               value={passenger.name}
// //               onChange={(e) => handlePassengerDetailChange(idx, 'name', e.target.value)}
// //               required
// //             /><br />

// //             <label>Gender:</label><br />
// //             <select
// //               value={passenger.gender}
// //               onChange={(e) => handlePassengerDetailChange(idx, 'gender', e.target.value)}
// //               required
// //             >
// //               <option value="">Select gender</option>
// //               <option value="male">Male</option>
// //               <option value="female">Female</option>
// //               <option value="other">Other</option>
// //             </select><br />

// //             <label>Birthday:</label><br />
// //             <input
// //               type="date"
// //               value={passenger.birthday}
// //               onChange={(e) => handlePassengerDetailChange(idx, 'birthday', e.target.value)}
// //               required
// //             />
// //           </div>
// //         ))}

// //         <button
// //           style={{
// //             marginTop: '1rem',
// //             backgroundColor: '#0070f3',
// //             color: 'white',
// //             padding: '0.5rem 1rem',
// //             borderRadius: '5px',
// //             border: 'none',
// //             cursor: 'pointer'
// //           }}
// //           onClick={handleBooking}
// //         >
// //           ✈️ Book Now
// //         </button>
// //       </div>

// //       {/* Success Modal */}
// //       {showSuccessModal && (
// //         <div style={{
// //           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
// //           backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
// //           justifyContent: 'center', alignItems: 'center', zIndex: 1000
// //         }}>
// //           <div style={{
// //             background: 'white', padding: '2rem', borderRadius: '10px',
// //             textAlign: 'center', maxWidth: '400px', width: '90%'
// //           }}>
// //             <h3 style={{ marginBottom: '1rem' }}>🎉 Booking Successful!</h3>
// //             <p>You will be redirected to your booking shortly.</p>
// //             <button
// //               onClick={() => navigate('/bookings')}
// //               style={{
// //                 marginTop: '1rem',
// //                 backgroundColor: '#0070f3',
// //                 color: 'white',
// //                 padding: '0.5rem 1rem',
// //                 borderRadius: '5px',
// //                 border: 'none',
// //                 cursor: 'pointer'
// //               }}
// //             >
// //               Go to My Bookings Now
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default FlightDetails;