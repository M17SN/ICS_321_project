import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PLAY_STAGES = [
  { value: 'Group Stage', label: 'Group Stage' },
  { value: 'Round of 16 stage', label: 'Round of 16 stage'},
  { value: 'Quarter Finals', label: 'Quarter Finals (Round of 8)' },
  { value: 'Semi Final', label: 'Semi Final (Round of 4)' },
  { value: 'Final', label: 'Final' },
];

export default function AdminScheduleMatchForm() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    tr_id: '',
    team_id1: '',
    team_id2: '',
    play_date: '',
    play_stage: '',
    venue_id: '',
  });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [teamGroups, setTeamGroups] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch tournaments and venues on mount
  useEffect(() => {
    axios.get('http://localhost:4000/admin/tournaments').then(res => setTournaments(res.data));
    axios.get('http://localhost:4000/admin/venues').then(res => setVenues(res.data));
  }, []);

  // Fetch teams when tournament changes
  useEffect(() => {
    if (form.tr_id) {
      axios.get(`http://localhost:4000/admin/tournament/${form.tr_id}/teams`).then(res => {
        setTeams(res.data);
        // Save group info for group stage validation
        const groups = {};
        res.data.forEach(t => { groups[t.team_id] = t.team_group; });
        setTeamGroups(groups);
      });
      // Set date range for selected tournament
      const t = tournaments.find(t => t.tr_id === parseInt(form.tr_id));
      if (t) setDateRange({ start: t.start_date, end: t.end_date });
      else setDateRange({ start: '', end: '' });
      // Reset teams and selections
      setForm(f => ({ ...f, team_id1: '', team_id2: '' }));
    } else {
      setTeams([]);
      setDateRange({ start: '', end: '' });
      setForm(f => ({ ...f, team_id1: '', team_id2: '' }));
    }
  }, [form.tr_id, tournaments]);

  // Handle form changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Validate group stage teams
  const groupStageError =
    form.play_stage === 'Group Stage' &&
    form.team_id1 &&
    form.team_id2 &&
    teamGroups[form.team_id1] !== teamGroups[form.team_id2]
      ? 'For group stage, both teams must be in the same group.'
      : '';

  // Handle submit
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Frontend validations
    if (!form.tr_id || !form.team_id1 || !form.team_id2 || !form.play_date || !form.play_stage) {
      setError('All fields except venue are required.');
      setLoading(false);
      return;
    }
    if (form.team_id1 === form.team_id2) {
      setError('Teams must be different.');
      setLoading(false);
      return;
    }
    if (groupStageError) {
      setError(groupStageError);
      setLoading(false);
      return;
    }
    // Use play_date string directly (input type=date gives YYYY-MM-DD)
    let playDateStr = form.play_date;
    const startDateStr = dateRange.start.slice(0, 10);
    const endDateStr = dateRange.end.slice(0, 10);
    if (dateRange.start && dateRange.end) {
      if (playDateStr < startDateStr || playDateStr > endDateStr) {
        setError(`Play date must be between ${startDateStr} and ${endDateStr} (YYYY-MM-DD).`);
        setLoading(false);
        return;
      }
    }
    try {
      await axios.post('http://localhost:4000/admin/schedule-match', {
        ...form,
        play_date: playDateStr,
        team_id1: parseInt(form.team_id1),
        team_id2: parseInt(form.team_id2),
        tr_id: parseInt(form.tr_id),
        venue_id: form.venue_id ? parseInt(form.venue_id) : null,
      });
      toast.success('Match scheduled successfully!');
      setForm({ tr_id: '', team_id1: '', team_id2: '', play_date: '', play_stage: '', venue_id: '' });
      setTeams([]);
      setDateRange({ start: '', end: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule match.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Schedule a New Match</h2>
      <div>
        <label className="block font-medium mb-1">Tournament</label>
        <select name="tr_id" value={form.tr_id} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
          <option value="">Select Tournament</option>
          {tournaments.map(t => (
            <option key={t.tr_id} value={t.tr_id}>{t.tr_name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium mb-1">Team 1</label>
          <select name="team_id1" value={form.team_id1} onChange={handleChange} className="w-full border rounded px-3 py-2" required disabled={!teams.length}>
            <option value="">Select Team 1</option>
            {teams.map(t => (
              <option key={t.team_id} value={t.team_id}>{t.team_name} (Group {t.team_group})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Team 2</label>
          <select name="team_id2" value={form.team_id2} onChange={handleChange} className="w-full border rounded px-3 py-2" required disabled={!teams.length}>
            <option value="">Select Team 2</option>
            {teams.filter(t => t.team_id.toString() !== form.team_id1).map(t => (
              <option key={t.team_id} value={t.team_id}>{t.team_name} (Group {t.team_group})</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Play Date</label>
        <input
          type="date"
          name="play_date"
          value={form.play_date}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          min={dateRange.start}
          max={dateRange.end}
          required
          disabled={!form.tr_id}
        />
        {dateRange.start && dateRange.end && (
          <div className="text-xs text-gray-500 mt-1">
            Play date should be between <b>{dateRange.start.slice(0, 10)}</b> and <b>{dateRange.end.slice(0, 10)}</b> (inclusive)
            <span className="ml-2 text-gray-400">(YYYY-MM-DD)</span>
          </div>
        )}
      </div>
      <div>
        <label className="block font-medium mb-1">Play Stage</label>
        <select name="play_stage" value={form.play_stage} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
          <option value="">Select Stage</option>
          {PLAY_STAGES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Venue (optional)</label>
        <select name="venue_id" value={form.venue_id} onChange={handleChange} className="w-full border rounded px-3 py-2">
          <option value="">Select Venue (or leave blank for TBD)</option>
          {venues.map(v => (
            <option key={v.venue_id} value={v.venue_id}>{v.venue_name} (Capacity: {v.venue_capacity})</option>
          ))}
        </select>
      </div>
      {error && <div className="text-red-600 font-medium">{error}</div>}
      {groupStageError && <div className="text-red-600 font-medium">{groupStageError}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Scheduling...' : 'Schedule Match'}
      </button>
    </form>
  );
} 
