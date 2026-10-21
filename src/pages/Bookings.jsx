import { Link } from "react-router-dom";
import { useParking } from "../context/ParkingContext.jsx";

function Bookings() {
  const { bookings, cancelBooking } = useParking();

  return (
    <div className="page container">
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <div>
          <p>You have no bookings yet.</p>
          <br />
          <Link to="/slots" className="btn">Find a slot</Link>
        </div>
      ) : (
        <ul className="booking-list">
          {bookings.map((b) => (
            <li key={b.id} className="card booking-item">
              <div>
                <strong>Slot #{b.slotId}</strong> · {b.vehicleNumber}
                <br />
                <small>{b.name} · {b.hours}h · ₹{b.total} · {b.createdAt}</small>
              </div>
              <button className="btn btn-danger" onClick={() => cancelBooking(b.id)}>
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Bookings;