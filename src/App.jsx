// Module 2 + 4: React Router setup, Routes, URL parameters
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Locations from "./pages/Locations.jsx";
import Slots from "./pages/Slots.jsx";
import SlotDetails from "./pages/SlotDetails.jsx";
import BookSlot from "./pages/BookSlot.jsx";
import Bookings from "./pages/Bookings.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/locations" element={<Locations />} />
          {/* :locationId is a route parameter */}
          <Route path="/locations/:locationId" element={<Slots />} />
          <Route path="/slots" element={<Navigate to="/locations" replace />} />
          <Route path="/slots/:id" element={<SlotDetails />} />
          <Route path="/book/:id" element={<BookSlot />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;