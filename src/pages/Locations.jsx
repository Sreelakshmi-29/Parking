// Lists and keys: one card per location
import LocationCard from "../components/LocationCard.jsx";
import { useParking } from "../context/ParkingContext.jsx";

function Locations() {
  const { locations, slots } = useParking();

  return (
    <div className="page container">
      <h1>Choose a Parking Location</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Select where you want to park, then pick a slot.
      </p>

      <div className="location-grid">
        {locations.map((loc) => {
          const own = slots.filter((s) => s.locationId === loc.id);
          const free = own.filter((s) => !s.occupied).length;
          return (
            <LocationCard key={loc.id} location={loc} free={free} total={own.length} />
          );
        })}
      </div>
    </div>
  );
}

export default Locations;