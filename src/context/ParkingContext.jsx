// Module 3: useContext + useState + useEffect (global parking state)
import { createContext, useContext, useState, useEffect } from "react";

const ParkingContext = createContext(null);

// Parking locations
const locations = [
  { id: "mall", name: "Orion City Mall", area: "Downtown", icon: "🛍️", description: "Covered multi-level parking next to the food court." },
  { id: "stadium", name: "Greenfield Stadium", area: "Sports District", icon: "🏟️", description: "Open parking right outside Gate 3. Book early on match days." },
  { id: "airport", name: "Skyline Airport", area: "Terminal Road", icon: "✈️", description: "Short and long stay parking, 2 minutes from departures." },
  { id: "hospital", name: "City Care Hospital", area: "North Avenue", icon: "🏥", description: "Visitor parking close to the main entrance." },
];

// Each location gets the same 8-slot layout; ids are unique across all locations
const slotTemplate = [
  { zone: "A", type: "Car", hourlyRate: 40 },
  { zone: "A", type: "Car", hourlyRate: 40 },
  { zone: "A", type: "EV", hourlyRate: 60 },
  { zone: "B", type: "Bike", hourlyRate: 15 },
  { zone: "B", type: "Bike", hourlyRate: 15 },
  { zone: "B", type: "Car", hourlyRate: 40 },
  { zone: "C", type: "EV", hourlyRate: 60 },
  { zone: "C", type: "Bike", hourlyRate: 15 },
];

const initialSlots = locations.flatMap((loc, li) =>
  slotTemplate.map((t, i) => ({
    id: li * 10 + i + 1, // 1-8, 11-18, 21-28, 31-38
    locationId: loc.id,
    ...t,
    occupied: (i + li) % 4 === 1, // a few start occupied
  }))
);

// Read saved data safely from localStorage
function load(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function ParkingProvider({ children }) {
  const [slots, setSlots] = useState(() => load("pe_slots_v2", initialSlots));
  const [bookings, setBookings] = useState(() => load("pe_bookings_v2", []));

  // useEffect: persist to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("pe_slots_v2", JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem("pe_bookings_v2", JSON.stringify(bookings));
  }, [bookings]);

  const bookSlot = ({ slotId, name, vehicleNumber, date, startTime, endTime, hours }) => {
    const slot = slots.find((s) => s.id === slotId);
    const booking = {
      id: Date.now(),
      slotId,
      locationId: slot.locationId,
      name,
      vehicleNumber: vehicleNumber.toUpperCase(),
      date,
      startTime,
      endTime,
      hours,
      total: slot.hourlyRate * hours,
      createdAt: new Date().toLocaleString(),
    };
    setBookings((prev) => [booking, ...prev]);
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, occupied: true } : s))
    );
  };

  const cancelBooking = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setSlots((prev) =>
      prev.map((s) => (s.id === booking.slotId ? { ...s, occupied: false } : s))
    );
  };

  const value = { locations, slots, bookings, bookSlot, cancelBooking };
  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}

// Custom hook so components can write: const { slots } = useParking();
export function useParking() {
  const ctx = useContext(ParkingContext);
  if (!ctx) throw new Error("useParking must be used inside ParkingProvider");
  return ctx;
}