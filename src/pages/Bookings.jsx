import { Link } from "react-router-dom";
import { useParking } from "../context/ParkingContext.jsx";

function Bookings() {
  const { bookings, cancelBooking, locations } = useParking();

  return (
    <div className="page container">
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <div>
          <p>You have no bookings yet.</p>
          <br />
          <Link to="/locations" className="btn">Choose a location</Link>
        </div>
      ) : (
        <ul className="booking-list">
          {bookings.map((b) => {
            const location = locations.find((l) => l.id === b.locationId);
            return (
              <li key={b.id} className="card booking-item">
                <div>
                  <strong>{location?.name}</strong> · Slot #{b.slotId} · {b.vehicleNumber}
                  <br />
                  <small>
                    {b.name} · {b.date} · {b.startTime} to {b.endTime} ({b.hours}h) · ₹{b.total}
                  </small>
                </div>
                <button className="btn btn-danger" onClick={() => cancelBooking(b.id)}>
                  Cancel
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Bookings;