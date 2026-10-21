// Module 3: useContext + useState + useEffect (global parking state)
import { createContext, useContext, useState, useEffect } from "react";

const ParkingContext = createContext(null);

// 12 slots across 3 zones
const initialSlots = [
  { id: 1, zone: "A", type: "Car", hourlyRate: 40, occupied: false },
  { id: 2, zone: "A", type: "Car", hourlyRate: 40, occupied: true },
  { id: 3, zone: "A", type: "Car", hourlyRate: 40, occupied: false },
  { id: 4, zone: "A", type: "EV", hourlyRate: 60, occupied: false },
  { id: 5, zone: "B", type: "Bike", hourlyRate: 15, occupied: false },
  { id: 6, zone: "B", type: "Bike", hourlyRate: 15, occupied: true },
  { id: 7, zone: "B", type: "Bike", hourlyRate: 15, occupied: false },
  { id: 8, zone: "B", type: "Car", hourlyRate: 40, occupied: false },
  { id: 9, zone: "C", type: "EV", hourlyRate: 60, occupied: false },
  { id: 10, zone: "C", type: "EV", hourlyRate: 60, occupied: true },
  { id: 11, zone: "C", type: "Car", hourlyRate: 40, occupied: false },
  { id: 12, zone: "C", type: "Bike", hourlyRate: 15, occupied: false },
];

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
  const [slots, setSlots] = useState(() => load("pe_slots", initialSlots));
  const [bookings, setBookings] = useState(() => load("pe_bookings", []));

  // useEffect: persist to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("pe_slots", JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem("pe_bookings", JSON.stringify(bookings));
  }, [bookings]);

  const bookSlot = ({ slotId, name, vehicleNumber, hours }) => {
    const slot = slots.find((s) => s.id === slotId);
    const booking = {
      id: Date.now(),
      slotId,
      name,
      vehicleNumber: vehicleNumber.toUpperCase(),
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

  const value = { slots, bookings, bookSlot, cancelBooking };
  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}

// Custom hook so components can write: const { slots } = useParking();
export function useParking() {
  const ctx = useContext(ParkingContext);
  if (!ctx) throw new Error("useParking must be used inside ParkingProvider");
  return ctx;
}