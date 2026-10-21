// Module 3: Controlled components, form submission, validation, event handling
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useParking } from "../context/ParkingContext.jsx";

const PLATE_REGEX = /^[A-Za-z]{2}[0-9]{1,2}[A-Za-z]{1,3}[0-9]{1,4}$/; // e.g. KL10AB1234

// Helpers for date/time pickers
const todayString = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function BookSlot() {
  const { id } = useParams();
  const navigate = useNavigate();
const { slots, bookSlot, locations } = useParking(); 
 const slot = slots.find((s) => s.id === Number(id));

  const [form, setForm] = useState({
    name: "",
    vehicleNumber: "",
    date: todayString(),
    startTime: "",
    endTime: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!slot) {
    return (
      <div className="page container">
        <h1>Slot not found</h1>
        <Link to="/slots" className="btn">Back to slots</Link>
      </div>
    );
  }

  // Conditional rendering using early return
  if (slot.occupied && !submitted) {
    return (
      <div className="page container">
        <h1>Sorry, this slot is already occupied</h1>
        <Link to="/slots" className="btn">Choose another slot</Link>
      </div>
    );
  }

  // One handler for every input (controlled components)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Duration is calculated from the chosen start and end time
  const minutes =
    form.startTime && form.endTime
      ? toMinutes(form.endTime) - toMinutes(form.startTime)
      : 0;
  const hours = minutes > 0 ? Math.ceil(minutes / 60) : 0; // billed per started hour
  const total = slot.hourlyRate * hours;

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = "Name must be at least 3 characters";
    if (!PLATE_REGEX.test(form.vehicleNumber.trim()))
      e.vehicleNumber = "Enter a valid plate, e.g. KL10AB1234";
    if (!form.date) e.date = "Please choose a date";
    else if (form.date < todayString()) e.date = "Date cannot be in the past";
    if (!form.startTime) e.startTime = "Please choose a start time";
    if (!form.endTime) e.endTime = "Please choose an end time";
    if (form.startTime && form.endTime && minutes <= 0)
      e.endTime = "End time must be after start time";
    if (minutes > 24 * 60) e.endTime = "Maximum booking is 24 hours";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    bookSlot({
      slotId: slot.id,
      name: form.name.trim(),
      vehicleNumber: form.vehicleNumber.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      hours,
    });
    setSubmitted(true);
    setTimeout(() => navigate("/bookings"), 1500);
  };

  return (
    <div className="page container">
<h1>Book Slot {slot.zone}-{slot.id}</h1>
<p className="muted" style={{ marginBottom: 16 }}>
  📍 {locations.find((l) => l.id === slot.locationId)?.name}
</p>
      {submitted && (
        <div className="success-msg">Booking confirmed! Redirecting to your bookings...</div>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className={`field ${errors.name ? "invalid" : ""}`}>
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className={`field ${errors.vehicleNumber ? "invalid" : ""}`}>
          <label htmlFor="vehicleNumber">Vehicle number</label>
          <input
            id="vehicleNumber"
            name="vehicleNumber"
            placeholder="KL10AB1234"
            value={form.vehicleNumber}
            onChange={handleChange}
          />
          {errors.vehicleNumber && <span className="error">{errors.vehicleNumber}</span>}
        </div>

        <div className={`field ${errors.date ? "invalid" : ""}`}>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            min={todayString()}
            value={form.date}
            onChange={handleChange}
          />
          {errors.date && <span className="error">{errors.date}</span>}
        </div>

        <div className="time-row">
          <div className={`field ${errors.startTime ? "invalid" : ""}`}>
            <label htmlFor="startTime">Start time</label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
            />
            {errors.startTime && <span className="error">{errors.startTime}</span>}
          </div>

          <div className={`field ${errors.endTime ? "invalid" : ""}`}>
            <label htmlFor="endTime">End time</label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
            />
            {errors.endTime && <span className="error">{errors.endTime}</span>}
          </div>
        </div>

        {/* Conditional rendering: show summary only when the time range is valid */}
        {hours > 0 && (
          <p>
            Duration: <strong>{hours} hour{hours > 1 ? "s" : ""}</strong> ·{" "}
            <strong>Total: ₹{total}</strong>
          </p>
        )}

        <button className="btn" type="submit" disabled={submitted}>
          {submitted ? "Booked" : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}

export default BookSlot;