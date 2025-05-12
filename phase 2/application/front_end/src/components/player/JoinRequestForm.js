import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function JoinRequestForm() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [form, setForm] = useState({ team_name: '', tournament_name: '' });
  const [loading, setLoading] = useState(false);
  const [tournamentLoading, setTournamentLoading] = useState(false);
  const [noTournaments, setNoTournaments] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:4000/teams')
      .then(res => setTeams(res.data))
      .catch(() => setTeams([]));
  }, []);

  const handleTeamChange = e => {
    const team_id = e.target.value;
    const team = teams.find(t => t.team_id.toString() === team_id);
    setForm({ team_name: team ? team.team_name : '', tournament_name: '' });
    setTournaments([]);
    setNoTournaments(false);
    if (!team_id) return;
    setTournamentLoading(true);
    axios.get(`http://localhost:4000/team/${team_id}/tournaments`)
      .then(res => {
        if (res.data.length === 0) {
          setNoTournaments(true);
          setTournaments([]);
        } else {
          setNoTournaments(false);
          setTournaments(res.data);
        }
      })
      .catch(() => setNoTournaments(true))
      .finally(() => setTournamentLoading(false));
  };

  const handleTournamentChange = e => {
    const tr_id = e.target.value;
    const tournament = tournaments.find(t => t.tr_id.toString() === tr_id);
    setForm(f => ({ ...f, tournament_name: tournament ? tournament.tr_name : '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/player/send-request', {
        username: user.username,
        team_name: form.team_name,
        tournament_name: form.tournament_name,
      });
      toast.success('Join request sent successfully!');
      setForm({ team_name: '', tournament_name: '' });
      setTournaments([]);
      setNoTournaments(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send join request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        name="team_name"
        value={teams.find(t => t.team_name === form.team_name)?.team_id || ''}
        onChange={handleTeamChange}
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
        required
      >
        <option value="">Select Team</option>
        {teams.map(team => (
          <option key={team.team_id} value={team.team_id}>{team.team_name}</option>
        ))}
      </select>
      {form.team_name && (
        tournamentLoading ? (
          <div className="text-gray-500 text-sm">Loading tournaments...</div>
        ) : noTournaments ? (
          <div className="text-red-500 text-sm">
            Team {form.team_name} is not participating in any competition.
          </div>
        ) : (
          <select
            name="tournament_name"
            value={tournaments.find(t => t.tr_name === form.tournament_name)?.tr_id || ''}
            onChange={handleTournamentChange}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
            required
          >
            <option value="">Select Tournament</option>
            {tournaments.map(t => (
              <option key={t.tr_id} value={t.tr_id}>{t.tr_name}</option>
            ))}
          </select>
        )
      )}
      <button
        type="submit"
        className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900 transition disabled:opacity-60"
        disabled={loading || !form.team_name || !form.tournament_name || noTournaments}
      >
        {loading ? 'Sending...' : 'Send Join Request'}
      </button>
    </form>
  );
} 