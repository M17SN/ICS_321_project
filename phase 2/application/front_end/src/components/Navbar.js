import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between shadow">
      <Link to="/" className="font-bold text-lg">Soccer Tournament</Link>
      <div className="flex gap-4 items-center">
        {user && user.role === 'a' && (
          <>
            <Link to="/admin" className="hover:underline">Admin Panel</Link>
          </>
        )}
        {user && user.role === 'g' && (
          <Link to="/guest" className="hover:underline">Guest Panel</Link>
        )}
        {user && user.role === 'p' && (
          <Link to="/player" className="hover:underline">Player Panel</Link>
        )}
        {user ? (
          <>
            <span className="text-sm">{user.username} ({user.role})</span>
            <button onClick={handleLogout} className="ml-2 bg-white text-blue-700 px-3 py-1 rounded hover:bg-gray-100">Logout</button>
          </>
        ) : (
          <Link to="/" className="hover:underline">Login</Link>
        )}
      </div>
    </nav>
  );
} 