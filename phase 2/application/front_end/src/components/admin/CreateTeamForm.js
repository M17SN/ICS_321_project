import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CreateTeamForm() {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/admin/create-team', { team_name: teamName });
      toast.success('Team created successfully!');
      setTeamName('');
    } catch (err) {
      const errorMsg = err.response?.data?.error;
      toast.error(typeof errorMsg === 'string' ? errorMsg : errorMsg?.sqlMessage || 'Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-dark-800 p-6 rounded shadow text-white">
      <h2 className="text-lg font-bold mb-2">Create a New Team</h2>
      <input
        type="text"
        name="team_name"
        placeholder="Team Name"
        value={teamName}
        onChange={e => setTeamName(e.target.value)}
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
        required
      />
      <button
        type="submit"
        className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900 focus:ring-2 focus:ring-green-700 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Team'}
      </button>
    </form>
  );
} 