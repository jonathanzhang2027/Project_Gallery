import { Link } from "react-router-dom";
import LoginButton from "./LoginButton"; // Adjust the import according to your file structure
import UserInfo from "./UserInfo";
import { User } from "@auth0/auth0-react";

interface MobileMenuProps {
  isAuthenticated: boolean;
  user?: any; // Replace `any` with the actual user type
  getLinkClass: (path: string) => string;
}

const HoverableUserInfo = ({ user }: { user: User }) => {
  return (
    <div className="relative">
      <img
        src={user.picture}
        alt={user.name}
        className="w-8 h-8 rounded-full cursor-pointer hidden sm:flex"
      />

      <>
        <div className="absolute top-full right-0 w-64 h-4" />
        <UserInfo user={user} />
      </>
    </div>
  );
};

const MobileMenu: React.FC<MobileMenuProps> = ({
  isAuthenticated,
  user,
  getLinkClass,
}) => {
  return (
    <div className="sm:hidden" id="mobile-menu">
      <ul className="space-y-1 px-2 pt-2 pb-3">
        <li>
          <Link to="/" className={getLinkClass("/")}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/new-project" className={getLinkClass("/new-project")}>
            New Project
          </Link>
        </li>
        <li>
          {isAuthenticated && user ? (
            <div>
              <HoverableUserInfo user={user} />
            </div>
          ) : (
            <LoginButton />
          )}
        </li>
      </ul>
    </div>
  );
};

export default MobileMenu;
