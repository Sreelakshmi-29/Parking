// Module 3: Controlled components, form submission, validation, event handling
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useParking } from "../context/ParkingContext.jsx";

const PLATE_REGEX = /^[A-Za-z]{2}[0-9]{1,2}[A-Za-z]{1,3}[0-9]{1,4}$/; // e.g. KL10AB1234

function BookSlot() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { slots, bookSlot } = useParking();
  const slot = slots.find((s) => s.id === Number(id));

  const [form, setForm] = useState({ name: "", vehicleNumber: "", hours: 1 });
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

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = "Name must be at least 3 characters";
    if (!PLATE_REGEX.test(form.vehicleNumber.trim()))
      e.vehicleNumber = "Enter a valid plate, e.g. KL10AB1234";
    const h = Number(form.hours);
    if (!h || h < 1 || h > 24) e.hours = "Hours must be between 1 and 24";
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
      hours: Number(form.hours),
    });
    setSubmitted(true);
    setTimeout(() => navigate("/bookings"), 1500);
  };

  const total = slot.hourlyRate * (Number(form.hours) || 0);

  return (
    <div className="page container">
      <h1>Book Slot {slot.zone}-{slot.id}</h1>

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

        <div className={`field ${errors.hours ? "invalid" : ""}`}>
          <label htmlFor="hours">Duration (hours)</label>
          <select id="hours" name="hours" value={form.hours} onChange={handleChange}>
            {[1, 2, 3, 4, 6, 8, 12, 24].map((h) => (
              <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>
            ))}
          </select>
          {errors.hours && <span className="error">{errors.hours}</span>}
        </div>

        <p><strong>Total: ₹{total}</strong></p>

        <button className="btn" type="submit" disabled={submitted}>
          {submitted ? "Booked" : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}

export default BookSlot;