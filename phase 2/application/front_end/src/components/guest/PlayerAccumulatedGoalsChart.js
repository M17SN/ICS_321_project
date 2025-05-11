import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PlayerAccumulatedGoalsChart() {
  const [players, setPlayers] = useState([]);
  const [playerId, setPlayerId] = useState('');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:4000/players')
      .then(res => setPlayers(res.data))
      .catch(() => setPlayers([]));
  }, []);

  const handleFetch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setChartData([]);
    try {
      const res = await axios.get(`http://localhost:4000/player/${playerId}/stats`);
      setChartData(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch goal data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <select
          value={playerId}
          onChange={e => setPlayerId(e.target.value)}
          className="px-3 py-2 border rounded w-full sm:w-auto focus:ring-2 focus:ring-blue-300"
          required
        >
          <option value="" disabled>Select Player</option>
          {players.map(player => (
            <option key={player.player_id} value={player.player_id}>
              {player.name || `Player #${player.player_id}`}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
          disabled={loading || !playerId}
        >
          {loading ? 'Loading...' : 'Show Accumulated Goals'}
        </button>
      </form>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="play_date" angle={-45} textAnchor="end" interval={0} tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}/>
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="accumulated_goals" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        playerId && !loading && <div className="text-center text-gray-500 mt-4">No goals found for this player.</div>
      )}
    </div>
  );
}
