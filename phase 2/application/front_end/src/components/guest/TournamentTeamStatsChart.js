import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function TournamentTeamStatsChart() {
  const [tournamentName, setTournamentName] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all tournaments
  useEffect(() => {
    axios.get('http://localhost:4000/tournaments')
      .then(res => setTournaments(res.data))
      .catch(() => toast.error('Failed to load tournaments.'));
  }, []);

  const handleSearch = async e => {
    e.preventDefault();
    setLoading(true);
    setTeamStats([]);

    try {
      // First get the tournament ID using the name
      const tournament = tournaments.find(t => t.tr_name === tournamentName);
      if (!tournament) {
        toast.error('Tournament not found.');
        return;
      }

      const res = await axios.get(`http://localhost:4000/tournaments/${tournament.tr_id}/stats`);
      setTeamStats(res.data);
      console.log(res.data, 1)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch team stats.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <select
          value={tournamentName}
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
          disabled={loading || !tournamentName}
        >
          {loading ? 'Loading...' : 'Show Stats'}
        </button>
      </form>

      {teamStats.length > 0 && (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={teamStats}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team_name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="won" stackId="a" fill="#296531" name="Wins" />
              <Bar dataKey="draw" stackId="a" fill="#facc15" name="Draws" />
              <Bar dataKey="lost" stackId="a" fill="#FF0000" name="Losses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {teamStats.length === 0 && tournamentName && !loading && (
        <div className="text-center text-gray-500 mt-4">No team stats available for this tournament yet.</div>
      )}
    </div>
  );
}
