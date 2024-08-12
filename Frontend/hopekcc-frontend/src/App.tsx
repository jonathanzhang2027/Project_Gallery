import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import NewProject from "./pages/NewProject";
import Project from "./pages/Project";
import EditProject from "./pages/EditProject";

function App() {
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
