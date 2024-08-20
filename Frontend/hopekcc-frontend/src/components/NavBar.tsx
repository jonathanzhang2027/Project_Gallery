
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { User } from '@auth0/auth0-spa-js';
import {House, ArrowLeft, Edit, FileText, Eye } from 'lucide-react';

import LoginButton from "./LoginButton";
import { TitleDisplayButton } from "./projectComponents/Buttons";
import UserInfo from "./UserInfo";

const navClass = "flex justify-between items-center bg-gray-500 text-white p-4 ";
const ulClass = "flex space-x-4";
const liClass = "mx-2 px-2";
const linkClass = "text-white";
const activeLinkClass = "underline";
const HoverableUserInfo = ({user}:{user:User}) => {
  const [showUserInfo, setShowUserInfo] = useState(false); // Declare the setShowUserInfo function

  return (
    <div
    onMouseEnter={() => setShowUserInfo(true)}
    onMouseLeave={() => setShowUserInfo(false)}
    className="relative"
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
  )
}

export const NavBar = () => {
  const { isAuthenticated, user } = useAuth0();
  const location = useLocation();
  const getLinkClass = (path: string) => 
    `${linkClass} ${location.pathname === path ? activeLinkClass : ''}`;
  // don't display if editing
  if (location.pathname.includes("edit-project")) return null
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
            <HoverableUserInfo user={user}/>
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
  
  const [isEditingTitle, setEditingTitle] = useState(false);
  const { id } = useParams<{ id: string }>();
  const {isAuthenticated, user } = useAuth0();
  return (
    <nav className={'flex justify-between items-center bg-gray-500 text-white p-4 '}>
      <ul className={ulClass}>
        <li className={liClass}>
          <Link to={`/projects/${id}`} className="flex">
            <ArrowLeft size={20} className="mx-2"/>
            <span>Back</span>
          </Link>
        </li>
        <li className={liClass}>
          <Link to={`/`} className="flex">
            <House size={20} className="mx-2"/>
            <span>Home</span>
          </Link>
        </li>
      </ul>
      <ul className={ulClass}>
          <h1 className=" text-3xl font-bold">
        
            <TitleDisplayButton 
            title={title} onRename={onTitleChange}
            onClick={() => setEditingTitle(true)}  onCancelRename={() => setEditingTitle(false)}
            isRenaming={isEditingTitle}/>
          </h1>

          <li className="text-gray-400">
            <div>
              <p>Last Modified: {modifiedTime}</p>
            </div>
          </li>
      </ul>
      <ul className={ulClass}>
        <li className={liClass}>
          <button className="flex" onClick={onSwitchView}>
            {isEditing ? //Display view or Edit 
            <><Eye size={20} className="mx-2"/>View</> : 
            <><Edit size={20} />Edit</>}
          </button>
        </li>
        
        <li className={liClass}>
            <button className="flex" onClick={onCollapseDesc}>
              <FileText className="mx-2"/> Desc
          </button>
          </li>
        <ul className={liClass}> 
          {isAuthenticated && user ? (
            <HoverableUserInfo user={user}/>
          ) : (
            <LoginButton />
          )}
        </ul>
      </ul>
    </nav>

  );
};


export default NavBar;
