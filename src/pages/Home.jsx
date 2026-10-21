import { Link } from "react-router-dom";
import Clock from "../components/Clock.jsx";
import StatCard from "../components/StatCard.jsx";
import { useParking } from "../context/ParkingContext.jsx";

function Home() {
  const { slots } = useParking();
  const available = slots.filter((s) => !s.occupied).length;

  return (
    <>
      <section className="hero">
        <div className="container">
          <div>
            <h1>Find and book your parking spot in seconds.</h1>
            <p>
              Real-time slot availability for cars, bikes and EVs. Reserve ahead
              and skip the circling.
            </p>
            <Link to="/slots" className="btn btn-accent">Browse Slots</Link>
          </div>
          <Clock label="Live parking time" />
        </div>
      </section>

      <div className="container">
        <div className="stats-grid">
          <StatCard label="Total Slots" value={slots.length} />
          <StatCard label="Available" value={available} color="#16a34a" />
          <StatCard label="Occupied" value={slots.length - available} color="#dc2626" />
        </div>
      </div>
    </>
  );
}

export default Home;