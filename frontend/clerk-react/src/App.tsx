import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import FirebaseTest from "./components/firebasetest"
import FlightSearch from "./components/FlightSearch"
import FlightDetails from "./components/FlightDetails"
import MyBooking from "./components/MyBooking"
import ViewDetails from "./components/ViewBooking"

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <BrowserRouter>
        <header
          className="header"
          style={{
            width: "100%",
            padding: "1rem",
            background: "#eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>✈️ Travel Planner</h1>
            <nav>
              <Link to="/">Home</Link> |{" "}
              <Link to="/flights">Search Flights</Link> |{" "}
              <Link to="/plans">My Plans</Link> |{" "}
              <Link to="/bookings">My Booking</Link>
            </nav>
          </div>
          <div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            padding: "1rem",
            maxWidth: "1500px",
            margin: "0 auto",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            width: "100%",
          }}
        >
          <Routes>
            <Route path="/" element={<FirebaseTest />} />
            <Route path="/flights" element={<FlightSearch />} />
            <Route path="/flights/:id" element={<FlightDetails />} />
            <Route path="/bookings" element={<MyBooking />} />
            <Route path="/view-details" element={<ViewDetails />} />
            <Route path="*" element={<p>404 - Page Not Found</p>} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  )
}
