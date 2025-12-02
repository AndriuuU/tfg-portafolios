import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AnalyticsPage from "./pages/AnalyticsPage";
import RankingPage from "./pages/RankingPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Header />      
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/search" element={<Search />} />
            <Route path="/projects" element={<ProjectForm />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/projects/:id/edit" element={<EditProject />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/u/:username" element={<Portfolio />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;