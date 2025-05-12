import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SelectCaptainForm() {
  const [form, setForm] = useState({ team_name: '', tournament_name: '', player_name: '' });
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [matches, setMatches] = useState([]);
  const [selectedMatchNo, setSelectedMatchNo] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4000/teams').then(res => setTeams(res.data)).catch(() => setTeams([]));
    axios.get('http://localhost:4000/tournaments').then(res => setTournaments(res.data)).catch(() => setTournaments([]));
  }, []);

  useEffect(() => {
    if (selectedTeamId && selectedTournamentId) {
      axios.get(`http://localhost:4000/team-players?team_id=${selectedTeamId}&tr_id=${selectedTournamentId}`)
        .then(res => setPlayers(res.data))
        .catch(() => setPlayers([]));
    } else {
      setPlayers([]);
    }
  }, [selectedTeamId, selectedTournamentId]);

  useEffect(() => {
    if (selectedTeamId && selectedTournamentId) {
      axios.get(`http://localhost:4000/admin/tournament/${selectedTournamentId}/unplayed-matches`)
        .then(res => setMatches(res.data.filter(m => m.team_id1 == selectedTeamId || m.team_id2 == selectedTeamId)))
        .catch(() => setMatches([]));
    } else {
      setMatches([]);
    }
  }, [selectedTeamId, selectedTournamentId]);

  const handleTeamChange = e => {
    const teamId = e.target.value;
    setSelectedTeamId(teamId);
    const team = teams.find(t => t.team_id?.toString() === teamId);
    setForm({ ...form, team_name: team ? team.team_name : '', player_name: '' });
  };

  const handleTournamentChange = e => {
    const tournamentId = e.target.value;
    setSelectedTournamentId(tournamentId);
    const tournament = tournaments.find(t => t.tr_id?.toString() === tournamentId);
    setForm({ ...form, tournament_name: tournament ? tournament.tr_name : '', player_name: '' });
  };

  const handlePlayerChange = e => {
    setForm({ ...form, player_name: e.target.value });
  };

  const handleMatchChange = e => {
    setSelectedMatchNo(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/admin/select-captain', { ...form, match_no: selectedMatchNo });
      toast.success('Captain selected successfully!');
      setForm({ team_name: '', tournament_name: '', player_name: '' });
      setSelectedTeamId('');
      setSelectedTournamentId('');
      setPlayers([]);
      setMatches([]);
      setSelectedMatchNo('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to select captain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        name="team_name"
        value={selectedTeamId}
        onChange={handleTeamChange}
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
        required
      >
        <option value="">Select Team</option>
        {teams.map(team => (
          <option key={team.team_id} value={team.team_id}>{team.team_name}</option>
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
      <select
        name="player_name"
        value={form.player_name}
        onChange={handlePlayerChange}
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
        required
        disabled={!players.length}
      >
        <option value="">{players.length ? 'Select Player' : 'No players available'}</option>
        {players.map((player, idx) => (
          <option key={idx} value={player}>{player}</option>
        ))}
      </select>
      <select
        name="match_no"
        value={selectedMatchNo}
        onChange={handleMatchChange}
        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
        required
        disabled={!matches.length}
      >
        <option value="">{matches.length ? 'Select Match' : 'No matches available'}</option>
        {matches.map(m => (
          <option key={m.match_no} value={m.match_no}>
            #{m.match_no}: {m.play_stage} - {m.play_date?.split('T')[0]} (Teams: {m.team1_name} vs {m.team2_name})
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Selecting...' : 'Select Captain'}
      </button>
    </form>
  );
} 