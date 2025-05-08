import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TournamentMatchesSearch() {
  const [tournamentName, setTournamentName] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:4000/tournaments')
      .then(res => setTournaments(res.data))
      .catch(() => setTournaments([]));
  }, []);

  const handleSearch = async e => {
    e.preventDefault();
    setLoading(true);
    setMatches([]);
    try {
      const res = await axios.get(`http://localhost:4000/tournament-matches/${encodeURIComponent(tournamentName)}`);
      setMatches(res.data.matches || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch matches.');
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
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {matches.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm shadow rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Team 1</th>
                <th className="border px-2 py-1">Team 2</th>
                <th className="border px-2 py-1">Result</th>
                <th className="border px-2 py-1">Score</th>
                <th className="border px-2 py-1">Venue</th>
                <th className="border px-2 py-1">Player of Match</th>
                <th className="border px-2 py-1">Audience</th>
                <th className="border px-2 py-1">Stage</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(match => {
                let resultText = match.results;
                if (!match.results) resultText = 'Not played yet';
                else if (match.results === 'WIN') resultText = `${match.team1} won`;
                else if (match.results === 'LOSS') resultText = `${match.team2} won`;
                else if (match.results === 'DRAW') resultText = 'Draw';
                return (
                  <tr key={match.match_no} className="hover:bg-blue-50 transition">
                    <td className="border px-2 py-1">{match.play_date || '-'}</td>
                    <td className="border px-2 py-1">{match.team1 || '-'}</td>
                    <td className="border px-2 py-1">{match.team2 || '-'}</td>
                    <td className="border px-2 py-1">{resultText}</td>
                    <td className="border px-2 py-1">{match.goal_score || '-'}</td>
                    <td className="border px-2 py-1">{match.venue_name || '-'}</td>
                    <td className="border px-2 py-1">{match.player_of_match || '-'}</td>
                    <td className="border px-2 py-1">{match.audience || '-'}</td>
                    <td className="border px-2 py-1">{match.stage || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {matches.length === 0 && tournamentName && !loading && (
        <div className="text-center text-gray-500 mt-4">No matches for this tournament yet.</div>
      )}
    </div>
  );
} 