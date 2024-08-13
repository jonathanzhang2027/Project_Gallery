import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "react-query";

// setting up Auth0
// note to self- Vite requires different syntax than React App to get .env variables
const domain = import.meta.env.VITE_AUTH0_DOMAIN!;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID!;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE!;
const scope = import.meta.env.VITE_AUTH0_SCOPE!;

if (!domain || !clientId || !audience || !scope) {
  throw new Error("Missing Auth0 configuration");
}
// for data fetching and caching projects from the database
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: audience,
      scope: scope,
    }}
  >
    <QueryClientProvider client={queryClient}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </QueryClientProvider>
  </Auth0Provider>
);
