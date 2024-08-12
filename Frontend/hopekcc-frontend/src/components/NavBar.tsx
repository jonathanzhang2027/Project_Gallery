import { Link, useLocation } from "react-router-dom";
import LoginButton from "./LoginButton";
import { useAuth0 } from "@auth0/auth0-react";
import { ArrowLeft, Edit, FileText, Eye } from 'lucide-react';
import { TitleDisplayButton } from "./projectComponents/buttons";
import { useState } from "react";
import UserInfo from "./UserInfo";

const navClass = "flex justify-between items-center bg-gray-500 text-white p-4 ";
const ulClass = "flex space-x-4";
const liClass = "mx-4";
const linkClass = "text-white";
const activeLinkClass = "underline";
export const NavBar = () => {
  const { isAuthenticated, user } = useAuth0();
  const location = useLocation();
  const [showUserInfo, setShowUserInfo] = useState(false);

  const getLinkClass = (path: string) => 
    `${linkClass} ${location.pathname === path ? activeLinkClass : ''}`;

  return (
    <nav className={navClass}>
      <ul className={ulClass}>
        <li className={liClass}>
          <Link to="/" className={getLinkClass("/")}>
            Home
          </Link>
        </li>
        <li className={liClass}>
          <Link to="/new-project" className={getLinkClass("/new-project")}>
            New Project
          </Link>
        </li>
        
      </ul>
      <ul className={liClass}> 
          {isAuthenticated && user ? (
            <div
              onMouseEnter={() => setShowUserInfo(true)}
              onMouseLeave={() => setShowUserInfo(false)}
              className="relative cursor-pointer"
            >
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              {showUserInfo && (
                <>
                  <div 
                    className="absolute top-full right-0 w-64 h-4"
                  />
                  <UserInfo user={user} />
                </>
              )}
            </div>
          ) : (
            <LoginButton />
          )}
        </ul>
    </nav>
  );
};




export const ProjectNavBar = ({onSwitchView, onCollapseDesc, onTitleChange, isEditing,  title, modifiedTime}
  : {onCollapseDesc:() => void, onSwitchView:() => void; onTitleChange:(oldTitle:string, newTitle:string) => void; 
    isEditing:boolean, title: string, modifiedTime: string, Description: string }) => {
  const linkStyle = (path: string) => ({
    textDecoration: location.pathname === path ? "underline" : "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: "2rem",
  });
  const [isEditingTitle, setEditingTitle] = useState(false);

  return (
    <nav className={navClass}>
      <ul className={ulClass}>
        <li className={liClass}>
          <Link to="/" style={linkStyle("/")}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
        </li>
        
        <li className={liClass}>
          <button onClick={onSwitchView}>
            {isEditing ? //Display view or Edit 
            <><Eye size={20} />View</> : 
            <><Edit size={20} />Edit</>}
          </button>
        </li>
        <li className={liClass}>
          <TitleDisplayButton 
          title={title} onRename={onTitleChange}
          onClick={() => setEditingTitle(true)}  onCancelRename={() => setEditingTitle(false)}
           isRenaming={isEditingTitle}/>
        </li>
        <li className={liClass}>
          <button onClick={onCollapseDesc}>
            <FileText/> Description
        </button>
        </li>
        <li className={liClass}>
          <div>
            <p>Last Modified: {modifiedTime}</p>
          </div>
        </li>
      </ul>
    </nav>

  );
};


export default NavBar;
