// Module 4: Lists and Keys
import { useState } from "react";
import SlotCard from "../components/SlotCard.jsx";
import { useParking } from "../context/ParkingContext.jsx";

const FILTERS = ["All", "Car", "Bike", "EV"];

function Slots() {
  const { slots } = useParking();
  const [filter, setFilter] = useState("All");
  const [onlyFree, setOnlyFree] = useState(false);

  const visible = slots.filter(
    (s) => (filter === "All" || s.type === filter) && (!onlyFree || !s.occupied)
  );

  return (
    <div className="page container">
      <h1>Parking Slots</h1>

      <div className="toolbar">
        {FILTERS.map((f) => (
          <button
            key={f} /* key helps React track each item between renders */
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
          {/* Use a stable unique id as key - NOT the array index */}
          {visible.map((slot) => (
            <SlotCard key={slot.id} slot={slot} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Slots;