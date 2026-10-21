import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page container">
      <h1>404 - Page not found</h1>
      <br />
      <Link to="/" className="btn">Go home</Link>
    </div>
  );
}

export default NotFound;