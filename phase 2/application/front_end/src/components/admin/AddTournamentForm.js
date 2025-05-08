import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AddTournamentForm() {
  const [form, setForm] = useState({ tr_name: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/admin/add-tournament', form);
      toast.success('Tournament added successfully!');
      setForm({ tr_name: '', start_date: '', end_date: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add tournament.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="tr_name"
        placeholder="Tournament Name"
        value={form.tr_name}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
        required
      />
      <div>
        <label className="block mb-1 font-medium">Start Date</label>
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
          required
        />
        <span className="text-xs text-gray-500">The date the tournament begins.</span>
      </div>
      <div>
        <label className="block mb-1 font-medium">End Date</label>
        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
          required
        />
        <span className="text-xs text-gray-500">The date the tournament ends.</span>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Tournament'}
      </button>
    </form>
  );
} 