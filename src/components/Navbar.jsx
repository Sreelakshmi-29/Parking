import { NavLink, Link } from "react-router-dom";
import { useParking } from "../context/ParkingContext.jsx";

function Navbar() {
  const { bookings } = useParking();
  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          Park<span>Ease</span>
        </Link>
        <ul className="nav-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/locations">Locations</NavLink></li>
          <li>
            <NavLink to="/bookings">
              My Bookings {bookings.length > 0 && `(${bookings.length})`}
            </NavLink>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Navbar;