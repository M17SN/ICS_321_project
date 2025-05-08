import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function RedCardedPlayersTable() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:4000/redcards');
        setPlayers(res.data);
      } catch (err) {
        setError('Failed to fetch red-carded players.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm shadow rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Team</th>
                <th className="border px-2 py-1">Player</th>
                <th className="border px-2 py-1">Position</th>
                <th className="border px-2 py-1">Booking Time</th>
                <th className="border px-2 py-1">Schedule</th>
                <th className="border px-2 py-1">Half</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-2">No red-carded players found.</td></tr>
              ) : (
                players.map((p, i) => (
                  <tr key={i} className="hover:bg-blue-50 transition">
                    <td className="border px-2 py-1">{p.team_name}</td>
                    <td className="border px-2 py-1">{p.name}</td>
                    <td className="border px-2 py-1">{p.position_to_play}</td>
                    <td className="border px-2 py-1">{p.booking_time}</td>
                    <td className="border px-2 py-1">{p.play_schedule}</td>
                    <td className="border px-2 py-1">{p.play_half}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 