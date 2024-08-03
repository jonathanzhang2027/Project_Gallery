import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import NewProject from "./pages/NewProject";
import Project from "./pages/Project";
import EditProject from "./pages/EditProject";
import axios from "axios";

function App() {
  const { getAccessTokenSilently, isLoading } = useAuth0();

  async function callApi() {
    try {
      const token = await getAccessTokenSilently();
      // const response = await axios.get("http://127.0.0.1:8000/", {
      //   headers: {
      //     authorization: `Bearer ${token}`,
      //   },
      // });
      // console.log(response.data);
      console.log(token);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          "Error getting access token or fetching data:",
          error.message
        );
      } else {
        console.error("An unexpected error occurred");
      }
    }
  }

  if (isLoading) return <div> Loading... </div>;

  return (
    <>
      <Router>
        <NavBar />
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="/new-project" element={<NewProject />} />
          <Route path="/project/:id" element={<Project />} />
          <Route path="/edit-project/:id" element={<EditProject />} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Router>
      <button onClick={() => callApi()}> call api </button>
      <h1>Vite + React</h1>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <div className="bg-blue-500 text-white p-4">Tailwind CSS is working!</div>
    </>
  );
}

export default App;
