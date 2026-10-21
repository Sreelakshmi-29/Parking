// Props + conditional rendering (ternary)
import { Link } from "react-router-dom";

function LocationCard({ location, free, total }) {
  const { id, name, area, icon, description } = location;

  return (
    <Link to={`/locations/${id}`} className="location-card">
      <div className="location-icon">{icon}</div>
      <h3>{name}</h3>
      <p className="muted">{area}</p>
      <p>{description}</p>
      <span className={`badge ${free > 0 ? "available" : "occupied"}`}>
        {free > 0 ? `${free} of ${total} slots free` : "Full"}
      </span>
    </Link>
  );
}

export default LocationCard;