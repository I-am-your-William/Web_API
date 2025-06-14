import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import FirebaseTest from "./components/firebasetest"
import FlightSearch from "./components/FlightSearch"
import FlightDetails from "./components/FlightDetails"
//import TravelPlans from "./components/TravelPlans"

export default function App() {
  return (
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
            <Link to="/">Home</Link> | <Link to="/flights">Search Flights</Link> | <Link to="/plans">My Plans</Link>
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

      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<FirebaseTest />} />
          <Route path="/flights" element={<FlightSearch />} />
          <Route path="/flights/:id" element={<FlightDetails />} />
        {/* Optional: Add a fallback route */}
        <Route path="*" element={<p>404 - Page Not Found</p>} />

      
        </Routes>
      </main>
    </BrowserRouter>
  )
}
