import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import NewProject from "./pages/NewProject";
import ProjectDetails from "./pages/ProjectDetails";
import EditProject from "./pages/EditProject";

function App() {
  return (
    <>
      <Router>
        
        <NavBar />
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="/new-project" element={<NewProject />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/edit-project/:id" element={<EditProject />} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
