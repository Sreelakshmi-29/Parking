// Module 2 + 4: React Router setup, Routes, URL parameters
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Slots from "./pages/Slots.jsx";
import SlotDetails from "./pages/SlotDetails.jsx";
import BookSlot from "./pages/BookSlot.jsx";
import Bookings from "./pages/Bookings.jsx";
import NotFound from "./pages/NotFound.jsx";

// Functional component using JSX
function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/slots" element={<Slots />} />
          {/* :id is a route parameter */}
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