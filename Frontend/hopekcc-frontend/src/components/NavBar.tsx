import { Link, useLocation } from "react-router-dom";
import LoginButton from "./LoginButton";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./LogoutButton";
import { ArrowLeft, Edit, FileText, Eye } from 'lucide-react';


export const NavBar = () => {
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


export const ProjectNavBar = ({onSwitchView, onCollapseDesc, isEditing,  title, modifiedTime}
  : {onCollapseDesc:() => void, onSwitchView:() => void; 
    isEditing:boolean, title: string, modifiedTime: string, Description: string }) => {
  const linkStyle = (path: string) => ({
    textDecoration: location.pathname === path ? "underline" : "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: "2rem",
  });
  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <Link to="/" style={linkStyle("/")}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
        </li>
        
        <li style={liStyle}>
          <button onClick={onSwitchView}>
            {isEditing ? //Display view or Edit 
            <><Eye size={20} />View</> : 
            <><Edit size={20} />Edit</>}
          </button>
        </li>
        <li style={liStyle}>
          <button onClick={onCollapseDesc}>
            <FileText/> Description
        </button>
        </li>
        <li style={liStyle}>
          <div>
            <h3>{title}</h3>
            <p>Last Modified: {modifiedTime}</p>
          </div>
        </li>
      </ul>
    </nav>

  );
};


export default NavBar;
