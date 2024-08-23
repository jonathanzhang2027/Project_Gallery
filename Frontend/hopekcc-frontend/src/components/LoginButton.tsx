import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  return (
    !isAuthenticated && (
      <button
        className="text-lg font-medium"
        onClick={() => loginWithRedirect()}
      >
        Login
      </button>
    )
  );
};

export default LoginButton;
