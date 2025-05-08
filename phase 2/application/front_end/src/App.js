import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AdminPanel from './pages/AdminPanel';
import GuestPanel from './pages/GuestPanel';
import PlayerPanel from './pages/PlayerPanel';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LoginRegister />} />
            <Route path="/admin" element={<ProtectedRoute role="a"><AdminPanel /></ProtectedRoute>} />
            <Route path="/guest" element={<ProtectedRoute role="g"><GuestPanel /></ProtectedRoute>} />
            <Route path="/player" element={<ProtectedRoute role="p"><PlayerPanel /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
