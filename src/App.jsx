import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import CreateMeme from './components/CreateMeme';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = useCallback(() => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (token && tokenExpiry) {
      const now = new Date();
      if (now.getTime() < parseInt(tokenExpiry)) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const handleLogin = useCallback((token) => {
    const now = new Date();
    const expiryTime = now.getTime() + (24 * 60 * 60 * 1000);
    
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  }, []);

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                isAuthenticated={isAuthenticated} 
                onLogout={handleLogout} 
              />
            } 
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/create" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? 
                <Navigate to="/create" replace /> : 
                <Signup onSignup={handleLogin} />
            } 
          />
<Route 
            path="/create" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CreateMeme />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
