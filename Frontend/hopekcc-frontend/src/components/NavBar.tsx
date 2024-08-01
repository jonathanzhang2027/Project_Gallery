import { Link } from "react-router-dom";
import LoginButton from "./LoginButton";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./LogoutButton";

const NavBar = () => {
  const { isAuthenticated } = useAuth0();
  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <Link to="/">Home</Link>
        </li>
        <li style={liStyle}>
          <Link to="/new-project">New Project</Link>
        </li>
        <li style={liStyle}>
          <LoginButton />
          <LogoutButton />
          {/* <Link to="/login">Login</Link> */}
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
