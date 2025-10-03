// App.js - Main application component with routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Predict from './pages/Predict';
import Results from './pages/Results';
import CandidateDetail from './pages/CandidateDetail';
import AdminDashboard from './pages/AdminDashboard';
import ScientistDashboard from './pages/ScientistDashboard';
import { initializeDB } from './utils/mockDatabase';

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  if (requiredRole && currentUser.role !== requiredRole) {
    return <div className="unauthorized">Unauthorized access</div>;
  }
  
  return children;
};

// Main App Content (separated to use useAuth hook)
const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/results" element={<Results />} />
          <Route path="/candidate/:id" element={<CandidateDetail />} />
          
          {/* Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/scientist" 
            element={
              <ProtectedRoute requiredRole="scientist">
                <ScientistDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

// Main App component
function App() {
  // Initialize the database when app starts
  initializeDB();

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;