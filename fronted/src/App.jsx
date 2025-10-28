import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectForm from "./pages/ProjectForm";
import NewProject from "./pages/NewProject";
import Portfolio from "./pages/Portfolio";
import EditProject from "./pages/EditProject";
import ProjectDetail from "./pages/ProjectDetail";
import Settings from "./pages/Settings";
import Search from "./pages/Search";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Header user={user} setUser={setUser} />      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="/projects" element={<ProjectForm />} />
        <Route path="/projects/new" element={<NewProject />} />
        <Route path="/u/:username" element={<Portfolio />} />
        <Route path="/projects/:id/edit" element={<EditProject />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Routes>
    </Router>
  );
}

export default App;