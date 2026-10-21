// Module 4: React Router URL parameters (useParams)
import { useParams, Link, useNavigate } from "react-router-dom";
import { useParking } from "../context/ParkingContext.jsx";

function SlotDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { slots, locations } = useParking();
  const slot = slots.find((s) => s.id === Number(id));

  if (!slot) {
    return (
      <div className="page container">
        <h1>Slot not found</h1>
        <Link to="/locations" className="btn">Back to locations</Link>
      </div>
    );
  }

  const location = locations.find((l) => l.id === slot.locationId);

  return (
    <div className="page container">
      <h1>Slot {slot.zone}-{slot.id}</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        <p><strong>Location:</strong> {location?.name}</p>
        <p><strong>Zone:</strong> {slot.zone}</p>
        <p><strong>Vehicle type:</strong> {slot.type}</p>
        <p><strong>Rate:</strong> ₹{slot.hourlyRate} per hour</p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={`badge ${slot.occupied ? "occupied" : "available"}`}>
            {slot.occupied ? "Occupied" : "Available"}
          </span>
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={() => navigate(-1)}>Back</button>
          {!slot.occupied && (
            <Link to={`/book/${slot.id}`} className="btn btn-accent">Book this slot</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default SlotDetails;