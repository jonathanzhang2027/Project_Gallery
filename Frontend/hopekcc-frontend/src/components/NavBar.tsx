
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <Link to="/home">Home</Link>
        </li>
        <li style={liStyle}>
          <Link to="/login">Login</Link>
        </li>
        <li style={liStyle}>
          <Link to="/new-project">New Project</Link>
        </li>
      </ul>
    </nav>
  );
};

const navStyle = {
  padding: "1rem",
  background: "#333",
  color: "#fff",
};

const ulStyle = {
  listStyle: "none",
  display: "flex",
  justifyContent: "space-around",
};

const liStyle = {
  margin: "0 1rem",
};

export default NavBar;
