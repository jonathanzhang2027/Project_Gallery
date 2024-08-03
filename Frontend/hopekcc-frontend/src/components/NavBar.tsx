import { Link, useLocation } from "react-router-dom";
import LoginButton from "./LoginButton";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./LogoutButton";

const NavBar = () => {
  const { isAuthenticated } = useAuth0();
  const location = useLocation();

  const linkStyle = (path: string) => ({
    textDecoration: location.pathname === path ? "underline" : "none",
    color: "#fff",
  });

  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <Link to="/" style={linkStyle("/")}>
            Home
          </Link>
        </li>
        <li style={liStyle}>
          <Link to="/new-project" style={linkStyle("/new-project")}>
            New Project
          </Link>
        </li>
        <li style={liStyle}>
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
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
