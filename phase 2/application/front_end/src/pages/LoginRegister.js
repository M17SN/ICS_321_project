import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Player', value: 'player' },
  { label: 'Guest', value: 'guest' },
];

const positions = [
  { label: 'Goalkeeper', value: 'GK' },
  { label: 'Defender', value: 'DF' },
  { label: 'Central Midfielder', value: 'CM' },
  { label: 'Striker', value: 'ST' },
];

export default function LoginRegister() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'player', kfupm_id: '', name: '', date_of_birth: '', position: '', jersey_no: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.username || !form.password || (tab === 'register' && (!form.email || !form.role))) {
      toast.error('All fields are required.');
      return false;
    }
    if (tab === 'register' && !/^.+@gmail\.com$/.test(form.email)) {
      toast.error('Only Gmail addresses are accepted.');
      return false;
    }
    if (form.password.length < 4) {
      toast.error('Password must be at least 4 characters.');
      return false;
    }
    if (tab === 'register' && form.role === 'player') {
      if (!/^[0-9]{4}$/.test(form.kfupm_id)) {
        toast.error('KFUPM ID must be 4 digits.');
        return false;
      }
      if (!/^[A-Za-z ]+$/.test(form.name)) {
        toast.error('Name must contain only letters and spaces.');
        return false;
      }
      if (!form.date_of_birth) {
        toast.error('Date of birth is required.');
        return false;
      }
      if (!['GK', 'DF', 'CM', 'ST'].includes(form.position)) {
        toast.error('Please select a valid position.');
        return false;
      }
      if (!form.jersey_no || isNaN(form.jersey_no) || +form.jersey_no < 1 || +form.jersey_no > 99) {
        toast.error('Jersey number must be between 1 and 99.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await axios.post('http://localhost:4000/login', { username: form.username, password: form.password });
        login({ username: res.data.user.username, role: res.data.user.role });
        toast.success('Login successful!');
        if (res.data.user.role === 'a') navigate('/admin');
        else if (res.data.user.role === 'g') navigate('/guest');
        else if (res.data.user.role === 'p') navigate('/player');
      } else {
        await axios.post('http://localhost:4000/register', {
          username: form.username,
          password: form.password,
          email: form.email,
          role: form.role,
          ...(form.role === 'player' ? {
            kfupm_id: form.kfupm_id,
            name: form.name,
            date_of_birth: form.date_of_birth,
            position: form.position,
            jersey_no: form.jersey_no,
          } : {})
        });
        toast.success('Registration successful! You can now log in.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-900">
      <div className="bg-dark-800 p-8 rounded shadow-md w-full max-w-md">
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 font-semibold rounded-l ${tab === 'login' ? 'bg-green-800 text-white' : 'bg-dark-700 text-green-500'}`}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 font-semibold rounded-r ${tab === 'register' ? 'bg-green-800 text-white' : 'bg-dark-700 text-green-500'}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
          />
          {tab === 'register' && (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email (must be Gmail)"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
              />
              <div className="text-xs text-green-400 mb-1">Only Gmail addresses are accepted (e.g., example@gmail.com)</div>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {form.role === 'player' && (
                <>
                  <input
                    type="text"
                    name="kfupm_id"
                    placeholder="KFUPM ID (4 digits)"
                    value={form.kfupm_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name (letters only)"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
                  />
                  <input
                    type="date"
                    name="date_of_birth"
                    placeholder="Date of Birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
                  />
                  <select
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
                  >
                    <option value="">Select Position</option>
                    {positions.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="jersey_no"
                    placeholder="Jersey Number (1-99)"
                    min={1}
                    max={99}
                    value={form.jersey_no}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
                  />
                </>
              )}
            </>
          )}
          <button
            type="submit"
            className="w-full bg-green-800 text-white py-2 rounded hover:bg-green-900 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
} 