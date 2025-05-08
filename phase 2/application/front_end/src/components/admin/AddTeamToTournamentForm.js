import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AddTeamToTournamentForm() {
  const [form, setForm] = useState({ team_name: '', tournament_name: '', team_group: '' });
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');

  useEffect(() => {
    // Fetch teams
    axios.get('http://localhost:4000/teams').then(res => setTeams(res.data)).catch(() => setTeams([]));
    // Fetch tournaments
    axios.get('http://localhost:4000/tournaments').then(res => setTournaments(res.data)).catch(() => setTournaments([]));
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      axios.get(`http://localhost:4000/tournament-groups/${selectedTournamentId}`)
        .then(res => setGroups(res.data))
        .catch(() => setGroups([]));
    } else {
      setGroups([]);
    }
  }, [selectedTournamentId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTournamentChange = e => {
    const tournamentId = e.target.value;
    setSelectedTournamentId(tournamentId);
    const tournament = tournaments.find(t => t.tr_id?.toString() === tournamentId);
    setForm({ ...form, tournament_name: tournament ? tournament.tr_name : '', team_group: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/admin/add-team-to-tournament', form);
      toast.success('Team added to tournament successfully!');
      setForm({ team_name: '', tournament_name: '', team_group: '' });
      setSelectedTournamentId('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add team to tournament.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        name="team_name"
        value={form.team_name}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
        required
      >
        <option value="">Select Team</option>
        {teams.map(team => (
          <option key={team.team_id} value={team.team_name}>{team.team_name}</option>
        ))}
      </select>
      <select
        name="tournament_name"
        value={selectedTournamentId}
        onChange={handleTournamentChange}
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
        required
      >
        <option value="">Select Tournament</option>
        {tournaments.map(tournament => (
          <option key={tournament.tr_id} value={tournament.tr_id}>{tournament.tr_name}</option>
        ))}
      </select>
      {groups.length === 0 ? (
        <input
          type="text"
          name="team_group"
          placeholder="Enter new group (e.g. A)"
          value={form.team_group}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
          required
        />
      ) : (
        <select
          name="team_group"
          value={form.team_group}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
          required
        >
          <option value="">Select Group</option>
          {groups.map((group, idx) => (
            <option key={idx} value={group}>{group}</option>
          ))}
        </select>
      )}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Team to Tournament'}
      </button>
    </form>
  );
} 