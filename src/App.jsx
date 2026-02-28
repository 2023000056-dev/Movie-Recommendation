import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MoviePage from './pages/MoviePage';
import TVBrowse from './pages/TVBrowse';
import TVPage from './pages/TVPage';
import PersonPage from './pages/PersonPage';
import Upcoming from './pages/Upcoming';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WorldDramas from './pages/WorldDramas';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader } from 'lucide-react';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><Loader className="spin" /></div>;
  if (!user) return <Navigate to="/signup" />;
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/movie/:id" element={<ProtectedRoute><MoviePage /></ProtectedRoute>} />
        <Route path="/tv" element={<ProtectedRoute><TVBrowse /></ProtectedRoute>} />
        <Route path="/tv/:id" element={<ProtectedRoute><TVPage /></ProtectedRoute>} />
        <Route path="/person/:id" element={<ProtectedRoute><PersonPage /></ProtectedRoute>} />
        <Route path="/upcoming" element={<ProtectedRoute><Upcoming /></ProtectedRoute>} />
        <Route path="/world-dramas" element={<ProtectedRoute><WorldDramas /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <AnimatedRoutes />
            </main>

            <footer className="footer shadow-lg">
              <div className="container" style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ color: 'var(--text-secondary)' }}>© 2026 CineScope. Powered by TMDB. Built with AI & Passion.</p>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

