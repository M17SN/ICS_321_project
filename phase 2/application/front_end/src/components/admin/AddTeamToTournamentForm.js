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
  const [backendError, setBackendError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4000/teams').then(res => setTeams(res.data)).catch(() => setTeams([]));
    axios.get('http://localhost:4000/tournaments').then(res => setTournaments(res.data)).catch(() => setTournaments([]));
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      axios.get(`http://localhost:4000/tournament-groups-with-teams/${selectedTournamentId}`)
        .then(res => setGroups(res.data))
        .catch(() => setGroups([]));
    } else {
      setGroups([]);
    }
    setForm(f => ({ ...f, team_group: '' }));
    setBackendError('');
  }, [selectedTournamentId]);

  // Helper: get group map for table
  const groupMap = { A: [], B: [], C: [], D: [] };
  groups.forEach(g => {
    if (groupMap[g.group]) groupMap[g.group] = g.teams;
  });

  // Helper: check if selected group is full
  const selectedGroup = (form.team_group || '').toUpperCase();
  const isGroupFull = selectedGroup && groupMap[selectedGroup] && groupMap[selectedGroup].length >= 4;

  // Helper: validate group input
  const isValidGroup = /^[A-D]$/i.test(form.team_group);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setBackendError('');
  };

  const handleTournamentChange = e => {
    const tournamentId = e.target.value;
    setSelectedTournamentId(tournamentId);
    const tournament = tournaments.find(t => t.tr_id?.toString() === tournamentId);
    setForm({ ...form, tournament_name: tournament ? tournament.tr_name : '', team_group: '' });
    setBackendError('');
  };

  const handleGroupInput = e => {
    const val = e.target.value.toUpperCase();
    setForm({ ...form, team_group: val });
    setBackendError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setBackendError('');
    try {
      await axios.post('http://localhost:4000/admin/add-team-to-tournament', form);
      toast.success('Team added to tournament successfully!');
      setForm({ team_name: '', tournament_name: '', team_group: '' });
      setSelectedTournamentId('');
    } catch (err) {
      let msg = err.response?.data?.error || 'Failed to add team to tournament.';
      if (typeof msg !== 'string') msg = JSON.stringify(msg);
      setBackendError(msg);
      toast.error(msg);
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
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
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
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
        required
      >
        <option value="">Select Tournament</option>
        {tournaments.map(tournament => (
          <option key={tournament.tr_id} value={tournament.tr_id}>{tournament.tr_name}</option>
        ))}
      </select>
      {selectedTournamentId && (
        <>
          <input
            type="text"
            name="team_group"
            value={form.team_group}
            onChange={handleGroupInput}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white uppercase"
            placeholder="Enter group (A, B, C, or D)"
            maxLength={1}
            required
          />
          {!isValidGroup && form.team_group && (
            <div className="text-red-500 text-sm">Group must be A, B, C, or D.</div>
          )}
          {isGroupFull && (
            <div className="text-red-500 text-sm">This group already has 4 teams. Please choose another group.</div>
          )}
          {backendError && (
            <div className="text-red-500 text-sm">{backendError}</div>
          )}
          <div className="mt-4">
            <table className="min-w-full border text-sm shadow rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-dark-700 text-green-400">
                  <th className="border border-dark-600 px-2 py-1">Group</th>
                  <th className="border border-dark-600 px-2 py-1">Slot 1</th>
                  <th className="border border-dark-600 px-2 py-1">Slot 2</th>
                  <th className="border border-dark-600 px-2 py-1">Slot 3</th>
                  <th className="border border-dark-600 px-2 py-1">Slot 4</th>
                </tr>
              </thead>
              <tbody className="bg-dark-800">
                {['A','B','C','D'].map(g => (
                  <tr key={g}>
                    <td className="border border-dark-600 px-2 py-1 font-bold text-green-400">{g}</td>
                    {[0,1,2,3].map(i => (
                      <td className="border border-dark-600 px-2 py-1 text-white" key={i}>{groupMap[g][i] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <button
        type="submit"
        className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900 transition disabled:opacity-60"
        disabled={loading || !isValidGroup || isGroupFull || !form.team_name || !selectedTournamentId}
      >
        {loading ? 'Adding...' : 'Add Team to Tournament'}
      </button>
    </form>
  );
} 