// Props + CSS Modules + Conditional rendering (ternary and &&)
import { Link } from "react-router-dom";
import styles from "./SlotCard.module.css";

function SlotCard({ slot }) {
  const { id, zone, type, hourlyRate, occupied } = slot;

  return (
    <div className={`${styles.card} ${occupied ? styles.occupied : ""}`}>
      <div className={styles.title}>Slot {zone}-{id}</div>
      <div className={styles.meta}>{type} parking · ₹{hourlyRate}/hr</div>

      {/* Ternary */}
      <span className={`badge ${occupied ? "occupied" : "available"}`}>
        {occupied ? "Occupied" : "Available"}
      </span>

      <div className={styles.actions}>
        <Link to={`/slots/${id}`} className="btn">Details</Link>
        {/* && operator: only render when slot is free */}
        {!occupied && (
          <Link to={`/book/${id}`} className="btn btn-accent">Book</Link>
        )}
      </div>
    </div>
  );
}

export default SlotCard;