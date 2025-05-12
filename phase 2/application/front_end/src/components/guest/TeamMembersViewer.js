import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TeamMembersViewer() {
  const [teamName, setTeamName] = useState('');
  const [teams, setTeams] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:4000/teams')
      .then(res => setTeams(res.data))
      .catch(() => setTeams([]));
  }, []);

  const handleSearch = async e => {
    e.preventDefault();
    setLoading(true);
    setData(null);
    try {
      const res = await axios.get(`http://localhost:4000/team-members/by-name/${encodeURIComponent(teamName)}`);
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch team members.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-800 p-6 rounded shadow space-y-4">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <select
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          className="px-3 py-2 border rounded w-full sm:w-auto focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
          required
        >
          <option value="" disabled>Select Team</option>
          {teams.map(t => (
            <option key={t.team_id} value={t.team_name}>{t.team_name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900 focus:ring-2 focus:ring-green-700 transition disabled:opacity-60"
          disabled={loading || !teamName}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {data && (
        <div className="space-y-4">
          <div className="font-bold text-lg mb-2">Team: {data.team_name}</div>
          <div>
            <div className="font-semibold mb-1">Players:</div>
            <div className="overflow-x-auto">
              {data.players.length === 0 ? (
                <div className="text-center text-gray-400 py-2">This team doesn't contain any members.</div>
              ) : (
                <table className="min-w-full border text-sm shadow rounded-lg overflow-hidden mb-2">
                  <thead>
                    <tr className="bg-dark-700 text-green-400">
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.players.map((p, i) => (
                      <tr key={i} className="hover:bg-dark-800 transition">
                        <td className="border px-2 py-1 text-white">{p.name}</td>
                        <td className="border px-2 py-1 text-white">{p.position_to_play}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <hr className="my-2" />
          {data.captain && (
            <div className="mb-2">Captain: <span className="font-semibold">{data.captain.name}</span></div>
          )}
          {data.support && data.support.length > 0 && (
            <div>
              <div className="font-semibold mb-1">Support Staff:</div>
              <ul className="list-disc ml-6">
                {data.support.map((s, i) => (
                  <li key={i}>{s.name} - {s.role}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 