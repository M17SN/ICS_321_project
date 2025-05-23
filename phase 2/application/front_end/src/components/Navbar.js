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
    <nav className="bg-dark-800 text-white px-4 py-3 flex items-center justify-between shadow">
      <Link to="/" className="font-bold text-lg">Soccer Tournament</Link>
      <div className="flex gap-4 items-center">
        {user && user.role === 'a' && (
          <>
            <Link to="/admin" className="hover:text-green-400">Admin Panel</Link>
          </>
        )}
        {user && user.role === 'g' && (
          <Link to="/guest" className="hover:text-green-400">Guest Panel</Link>
        )}
        {user && user.role === 'p' && (
          <Link to="/player" className="hover:text-green-400">Player Panel</Link>
        )}
        {user ? (
          <>
            <span className="text-sm">{user.username} ({user.role})</span>
            <button onClick={handleLogout} className="ml-2 bg-dark-700 text-green-700 px-3 py-1 rounded hover:bg-green-900">Logout</button>
          </>
        ) : (
          <Link to="/" className="hover:text-green-400">Login</Link>
        )}
      </div>
    </nav>
  );
} 