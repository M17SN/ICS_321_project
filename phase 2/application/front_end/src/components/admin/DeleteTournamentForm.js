import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function DeleteTournamentForm() {
  const [tournament_name, setTournamentName] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:4000/tournaments')
      .then(res => setTournaments(res.data))
      .catch(() => setTournaments([]));
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    if (!tournament_name) return;
    setShowModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete('http://localhost:4000/admin/delete-tournament', { data: { tournament_name } });
      toast.success('Tournament deleted successfully!');
      setTournamentName('');
      setShowModal(false);
      // Refresh tournaments list
      const res = await axios.get('http://localhost:4000/tournaments');
      setTournaments(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete tournament.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-center">
        <select
          name="tournament_name"
          value={tournament_name}
          onChange={e => setTournamentName(e.target.value)}
          className="px-3 py-2 border rounded w-full sm:w-auto focus:ring-2 focus:ring-blue-300"
          required
        >
          <option value="" disabled>Select Tournament</option>
          {tournaments.map(t => (
            <option key={t.tr_id} value={t.tr_name}>{t.tr_name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-60"
          disabled={loading || !tournament_name}
        >
          {loading ? 'Deleting...' : 'Delete Tournament'}
        </button>
      </form>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-xl font-semibold mb-4 text-red-700">Warning!</div>
            <div className="mb-6 text-gray-700">
              Are you sure you want to delete tournament <span className="font-bold text-red-600">"{tournament_name}"</span>?<br />
              <span className="text-red-500 font-semibold">Everything related to it will be deleted!</span>
            </div>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-60"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 