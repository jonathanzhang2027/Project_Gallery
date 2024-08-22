import React from "react";
import { User as UserImg, Mail } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { User } from "@auth0/auth0-spa-js";
const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <span className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0">{children}</span>
);

const InfoItem = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <li className="flex items-center p-2">
    <IconWrapper>{icon}</IconWrapper>
    <span className="text-gray-700 text-sm">{children}</span>
  </li>
);

const UserInfo = ({ user }: { user: User }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden absolute right-0 top-full mt-2 w-64">
      <div className="flex items-center p-4 bg-gray-100">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
          <img
            src={user.picture}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-3">
          <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.nickname}</p>
        </div>
      </div>
      <ul className="py-2">
        <InfoItem
          icon={<UserImg />}
        >{`${user.given_name} ${user.family_name}`}</InfoItem>
        <InfoItem icon={<Mail />}>{user.email}</InfoItem>
      </ul>
      <div className="p-4 bg-gray-100">
        <LogoutButton />
      </div>
    </div>
  );
};

export default UserInfo;
