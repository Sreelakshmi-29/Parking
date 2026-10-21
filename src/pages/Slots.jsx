// Module 4: Lists, Keys, and Router parameters (locationId)
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import SlotCard from "../components/SlotCard.jsx";
import { useParking } from "../context/ParkingContext.jsx";

const FILTERS = ["All", "Car", "Bike", "EV"];

function Slots() {
  const { locationId } = useParams();
  const { slots, locations } = useParking();
  const [filter, setFilter] = useState("All");
  const [onlyFree, setOnlyFree] = useState(false);

  const location = locations.find((l) => l.id === locationId);

  if (!location) {
    return (
      <div className="page container">
        <h1>Location not found</h1>
        <Link to="/locations" className="btn">Back to locations</Link>
      </div>
    );
  }

  const locationSlots = slots.filter((s) => s.locationId === locationId);
  const visible = locationSlots.filter(
    (s) => (filter === "All" || s.type === filter) && (!onlyFree || !s.occupied)
  );

  return (
    <div className="page container">
      <Link to="/locations" className="back-link">← All locations</Link>
      <h1>{location.icon} {location.name}</h1>
      <p className="muted" style={{ marginBottom: 24 }}>{location.area}</p>

      <div className="toolbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`chip ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <label className="chip">
          <input
            type="checkbox"
            checked={onlyFree}
            onChange={(e) => setOnlyFree(e.target.checked)}
          />{" "}
          Available only
        </label>
      </div>

      {visible.length === 0 ? (
        <p>No slots match your filters.</p>
      ) : (
        <div className="slots-grid">
          {visible.map((slot) => (
            <SlotCard key={slot.id} slot={slot} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Slots;