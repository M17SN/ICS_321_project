import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const goalTypes = [
  { value: 'N', label: 'Normal' },
  { value: 'P', label: 'Penalty' },
  { value: 'O', label: 'Own Goal' },
  { value: 'F', label: 'Free Kick' },
  { value: 'H', label: 'Header' },
  { value: 'S', label: 'Shootout' },
];

// Add new options for halves
const halfOptions = [
  { value: 1, label: '1st Half', min: 0, max: 45 },
  { value: 2, label: '2nd Half', min: 46, max: 90 },
  { value: 3, label: 'ET 1', min: 91, max: 105 },
  { value: 4, label: 'ET 2', min: 106, max: 120 },
];

// Add playStage options for mapping
const playStages = [
  { value: 'G', label: 'Group' },
  { value: 'R', label: 'Round of 16' },
  { value: 'Q', label: 'Quarter Final' },
  { value: 'S', label: 'Semi Final' },
  { value: 'F', label: 'Final' },
];

// Add goalSchedule options for mapping (if needed)
const goalSchedules = [
  { value: 'NT', label: 'Normal Time' },
  { value: 'ET', label: 'Extra Time' },
  { value: 'P', label: 'Penalties' },
];

// Sent off options for bookings
const sentOffOptions = [
  { value: 'N', label: 'No (sent off)' },
  { value: 'Y', label: 'Yes (sent off)' },
];

export default function MatchResultEntryForm() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [matchDetails, setMatchDetails] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [form, setForm] = useState({
    play_date: '',
    goal_score1: '',
    goal_score2: '',
    decided_by: 'N',
    venue_id: '',
    audience: '',
    player_of_match: '',
    stop1_sec: '',
    stop2_sec: '',
    play_stage: '',
    goals: [],
    bookings: [],
    redCardCount: 0,
    hasRedCard: false,
  });
  const [venues, setVenues] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [penaltyScores, setPenaltyScores] = useState({ team1: '', team2: '' });
  const [penaltyScorers, setPenaltyScorers] = useState({ team1: [], team2: [] });

  // Fetch tournaments
  useEffect(() => {
    axios.get('http://localhost:4000/tournaments').then(res => setTournaments(res.data)).catch(() => setTournaments([]));
    axios.get('http://localhost:4000/admin/venues').then(res => setVenues(res.data)).catch(() => setVenues([]));
    console.log(1)
  }, []);

  // Fetch unplayed matches when tournament selected
  useEffect(() => {
    if (selectedTournament) {
      axios.get(`http://localhost:4000/admin/tournament/${selectedTournament}/unplayed-matches`)
        .then(res => setMatches(res.data)).catch(() => setMatches([]));
    } else {
      setMatches([]);
    }
    console.log(1)
    setSelectedMatch('');
    setMatchDetails(null);
    setTeam1Players([]);
    setTeam2Players([]);
    setForm(f => ({ ...f, goals: [], bookings: [], player_of_match: '', goal_score1: '', goal_score2: '', play_stage: '', venue_id: '', audience: '', stop1_sec: '', stop2_sec: '' }));
  }, [selectedTournament]);

  // Fetch match details and players when match selected
  useEffect(() => {
    if (selectedMatch) {
      const match = matches.find(m => m.match_no === parseInt(selectedMatch));
      setMatchDetails(match);
      setForm(f => ({ ...f, play_date: match?.play_date || '', play_stage: match?.play_stage || '', venue_id: match?.venue_id || '', audience: match?.audience || '', stop1_sec: match?.stop1_sec || '', stop2_sec: match?.stop2_sec || '' }));
      if (match) {
        axios.get(`http://localhost:4000/admin/team/${match.team_id1}/players`).then(res => setTeam1Players(res.data)).catch(() => setTeam1Players([]));
        axios.get(`http://localhost:4000/admin/team/${match.team_id2}/players`).then(res => setTeam2Players(res.data)).catch(() => setTeam2Players([]));
      }
    } else {
      setMatchDetails(null);
      setTeam1Players([]);
      setTeam2Players([]);
    }
    setForm(f => ({ ...f, goals: [], bookings: [], player_of_match: '', goal_score1: '', goal_score2: '' }));
  }, [selectedMatch, matches]);

  // Handle form changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'decided_by' && value !== 'P') {
      setPenaltyScores({ team1: '', team2: '' });
      setPenaltyScorers({ team1: [], team2: [] });
    }
  };

  // Handle score change and update goals array
  const handleScoreChange = (team, value) => {
    const num = value.replace(/\D/g, '');
    setForm(f => {
      const newForm = { ...f, [team === 1 ? 'goal_score1' : 'goal_score2']: num };
      // Update goals array length for this team
      const goals = [...(f.goals || [])].filter(g => g.team !== team);
      const players = team === 1 ? team1Players : team2Players;
      for (let i = 0; i < parseInt(num || 0); i++) {
        if (!goals.find(g => g.team === team && g.idx === i)) {
          goals.push({ team, idx: i, player_id: '', goal_time: '', goal_type: 'N', goal_half: 1 });
        }
      }
      return { ...newForm, goals: goals.filter(g => g.team !== team || g.idx < parseInt(num || 0)) };
    });
  };

  // Handle goal detail change
  const handleGoalDetail = (team, idx, field, value) => {
    setForm(f => {
      const goals = [...(f.goals || [])];
      const goalIdx = goals.findIndex(g => g.team === team && g.idx === idx);
      if (goalIdx !== -1) {
        goals[goalIdx] = { ...goals[goalIdx], [field]: value };
      }
      return { ...f, goals };
    });
  };

  // Handle red card logic
  const handleRedCardToggle = e => {
    setForm(f => ({ ...f, hasRedCard: e.target.checked, redCardCount: 0, bookings: [] }));
  };
  const handleRedCardCount = e => {
    const count = parseInt(e.target.value || 0);
    setForm(f => {
      const bookings = [];
      for (let i = 0; i < count; i++) {
        bookings.push({ idx: i, player_id: '', team_id: '', booking_time: '', play_half: 1 });
      }
      return { ...f, redCardCount: count, bookings };
    });
  };
  const handleBookingDetail = (idx, field, value) => {
    setForm(f => {
      const bookings = [...(f.bookings || [])];
      if (bookings[idx]) {
        bookings[idx] = { ...bookings[idx], [field]: value };
        // Set team_id when player_id is selected
        if (field === 'player_id') {
          const player = [...team1Players, ...team2Players].find(p => p.player_id.toString() === value.toString());
          bookings[idx].team_id = player
            ? (team1Players.some(tp => tp.player_id === player.player_id)
              ? matchDetails?.team_id1
              : matchDetails?.team_id2)
            : '';
        }
      }
      return { ...f, bookings };
    });
  };

  // Set team_id automatically for bookings
  useEffect(() => {
  setForm(f => {
    const bookings = (f.bookings || []).map(b => {
      if (b.player_id) {
        const player = [...team1Players, ...team2Players].find(p => p.player_id.toString() === b.player_id.toString());
        return {
          ...b,
          team_id: player
            ? (team1Players.some(tp => tp.player_id === player.player_id)
              ? matchDetails?.team_id1
              : matchDetails?.team_id2)
            : ''
        };
      }
      return b;
    });
    return { ...f, bookings };
  });
}, [team1Players, team2Players, matchDetails]);

  // Penalty score change handler
  const handlePenaltyScoreChange = (team, value) => {
    const num = value.replace(/\D/g, '');
    setPenaltyScores(ps => ({ ...ps, [team]: num }));
    setPenaltyScorers(psc => ({ ...psc, [team]: Array(parseInt(num || 0)).fill('') }));
  };

  // Penalty scorer change handler
  const handlePenaltyScorerChange = (team, idx, value) => {
    setPenaltyScorers(psc => {
      const arr = [...psc[team]];
      arr[idx] = value;
      return { ...psc, [team]: arr };
    });
  };

  // Helper to check if group stage
  const isGroupStage = form.play_stage === 'G' || matchDetails?.play_stage === 'G';

  // Handle submit
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    // Validate goals
    if (form.goals.length !== parseInt(form.goal_score1 || 0) + parseInt(form.goal_score2 || 0)) {
      toast.error('Number of goal entries must match total goals scored.');
      setSubmitting(false);
      return;
    }
    // Validate unique goal times
    const allGoalTimes = form.goals.map(g => g.goal_time);
    const hasDuplicateGoalTime = allGoalTimes.some((time, idx) => allGoalTimes.indexOf(time) !== idx);
    if (hasDuplicateGoalTime) {
      toast.error('No two goals can be at the same minute.');
      setSubmitting(false);
      return;
    }
    // Validate bookings
    if (form.hasRedCard && form.bookings.length !== parseInt(form.redCardCount || 0)) {
      toast.error('Number of red card entries must match the number specified.');
      setSubmitting(false);
      return;
    }
    // Validate penalty shootout
    if (form.decided_by === 'P') {
      if (form.goal_score1 !== form.goal_score2) {
        toast.error('For penalty shootout, the main score must be a draw.');
        setSubmitting(false);
        return;
      }
      if (!penaltyScores.team1 || !penaltyScores.team2) {
        toast.error('Enter both penalty scores.');
        setSubmitting(false);
        return;
      }
      if (penaltyScorers.team1.length !== parseInt(penaltyScores.team1) || penaltyScorers.team2.length !== parseInt(penaltyScores.team2)) {
        toast.error('Select a scorer for each penalty.');
        setSubmitting(false);
        return;
      }
    }
    // Red card/goal logic: no goals after red card
    const redCardTimes = {};
    if (form.hasRedCard) {
      for (const b of form.bookings) {
        if (b.player_id) {
          if (!redCardTimes[b.player_id] || b.booking_time < redCardTimes[b.player_id]) {
            redCardTimes[b.player_id] = b.booking_time;
          }
        }
      }
    }
    for (const g of form.goals) {
      if (redCardTimes[g.player_id] !== undefined && parseInt(g.goal_time) > parseInt(redCardTimes[g.player_id])) {
        toast.error('A player cannot score after being sent off.');
        setSubmitting(false);
        return;
      }
    }
    // Compose goal_score string
    const goal_score = `${form.goal_score1 || 0}-${form.goal_score2 || 0}`;
    // Compose payload
    const payload = {
      play_date: form.play_date,
      goal_score,
      decided_by: form.decided_by,
      venue_id: form.venue_id,
      audience: parseInt(form.audience),
      player_of_match: form.player_of_match,
      stop1_sec: parseInt(form.stop1_sec),
      stop2_sec: parseInt(form.stop2_sec),
      play_stage: form.play_stage,
      goals: form.goals.map(g => ({
        player_id: g.player_id,
        team_id: g.team === 1 ? matchDetails.team_id1 : matchDetails.team_id2,
        goal_time: parseInt(g.goal_time),
        goal_type: g.goal_type,
        goal_half: parseInt(g.goal_half),
      })),
      bookings: form.hasRedCard ? form.bookings.map(b => ({
        player_id: b.player_id,
        team_id: b.team_id,
        booking_time: parseInt(b.booking_time),
        sent_off: 'Y',
        play_half: parseInt(b.play_half),
      })) : [],
      penalty_shootout: form.decided_by === 'P' ? {
        team1: parseInt(penaltyScores.team1),
        team2: parseInt(penaltyScores.team2),
        scorers1: penaltyScorers.team1,
        scorers2: penaltyScorers.team2,
      } : undefined,
    };
    // Add validation in handleSubmit for goal_time and booking_time based on selected half
    for (const g of form.goals) {
      const opt = halfOptions.find(h => h.value === Number(g.goal_half));
      if (!opt) {
        toast.error('Invalid half selected for a goal.');
        setSubmitting(false);
        return;
      }
      if (g.goal_time < opt.min || g.goal_time > opt.max) {
        toast.error(`Goal time for ${opt.label} must be between ${opt.min} and ${opt.max}.`);
        setSubmitting(false);
        return;
      }
    }
    if (form.hasRedCard) {
      for (const b of form.bookings) {
        const opt = halfOptions.find(h => h.value === Number(b.play_half));
        if (!opt) {
          toast.error('Invalid half selected for a booking.');
          setSubmitting(false);
          return;
        }
        if (b.booking_time < opt.min || b.booking_time > opt.max) {
          toast.error(`Booking time for ${opt.label} must be between ${opt.min} and ${opt.max}.`);
          setSubmitting(false);
          return;
        }
      }
    }
    // Prevent submission if Penalty or Extra Time is selected for group stage
    if (isGroupStage && (form.decided_by === 'P' || form.decided_by === 'E')) {
      toast.error('Penalty and Extra Time are not allowed in group stage.');
      setSubmitting(false);
      return;
    }
    try {
      await axios.post(`http://localhost:4000/admin/match/${selectedMatch}/enter-details`, payload);
      toast.success('Match details saved!');
      setSelectedMatch('');
      setForm(f => ({ ...f, goals: [], bookings: [], player_of_match: '', goal_score1: '', goal_score2: '', play_stage: '', venue_id: '', audience: '', stop1_sec: '', stop2_sec: '', hasRedCard: false, redCardCount: 0 }));
      setMatches(m => m.filter(mch => mch.match_no !== parseInt(selectedMatch)));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save match details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-dark-800 p-6 rounded shadow max-w-2xl mx-auto text-white">
      <h2 className="text-xl font-bold mb-2">Enter Match Result & Details</h2>
      <div>
        <label className="block font-medium mb-1">Tournament</label>
        <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" required>
          <option value="">Select Tournament</option>
          {tournaments.map(t => (
            <option key={t.tr_id} value={t.tr_id}>{t.tr_name}</option>
          ))}
        </select>
      </div>
      {selectedTournament && (
        <div>
          <label className="block font-medium mb-1">Unplayed Match</label>
          <select value={selectedMatch} onChange={e => setSelectedMatch(e.target.value)} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" required>
            <option value="">Select Match</option>
            {matches.map(m => {
              const date = m.play_date ? m.play_date.split('T')[0] : '';
              return (
                <option key={m.match_no} value={m.match_no}>
                  #{m.match_no}: {m.play_stage} - {date} (Teams: {m.team1_name} vs {m.team2_name})
                </option>
              );
            })}
          </select>
        </div>
      )}
      {matchDetails && (
        <>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Play Date</label>
              <input type="text" value={form.play_date ? form.play_date.split('T')[0] : ''} disabled className="w-full border rounded px-3 py-2 bg-dark-700 text-white" readOnly />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Play Stage</label>
              <input type="text" value={form.play_stage} disabled className="w-full border rounded px-3 py-2 bg-dark-700 text-white" readOnly />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Venue</label>
              <input type="text" value={venues.find(v => v.venue_id === form.venue_id)?.venue_name + (venues.find(v => v.venue_id === form.venue_id) ? ` (Capacity: ${venues.find(v => v.venue_id === form.venue_id).venue_capacity})` : '') || ''} disabled className="w-full border rounded px-3 py-2 bg-dark-700 text-white" readOnly />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Audience</label>
              <input type="number" name="audience" value={form.audience} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" min={0} required />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Stoppage 1st Half (sec)</label>
              <input type="number" name="stop1_sec" value={form.stop1_sec} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" min={0} max={2700} required />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Stoppage 2nd Half (sec)</label>
              <input type="number" name="stop2_sec" value={form.stop2_sec} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" min={0} max={2700} required />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Decided By</label>
              <select name="decided_by" value={form.decided_by} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" required>
                <option value="N">Normal</option>
                <option value="P" disabled={isGroupStage}>Penalty</option>
                <option value="E" disabled={isGroupStage}>Extra Time</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Player of the Match</label>
              <select name="player_of_match" value={form.player_of_match} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" required>
                <option value="">Select Player</option>
                {[...team1Players, ...team2Players].map(p => (
                  <option key={p.player_id} value={p.player_id}>{p.name} (ID: {p.player_id})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Team 1 ({matchDetails?.team1_name || 'Team 1'}) Score</label>
              <input type="number" min={0} name="goal_score1" value={form.goal_score1} onChange={e => handleScoreChange(1, e.target.value)} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" required />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Team 2 ({matchDetails?.team2_name || 'Team 2'}) Score</label>
              <input type="number" min={0} name="goal_score2" value={form.goal_score2} onChange={e => handleScoreChange(2, e.target.value)} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" required />
            </div>
          </div>
          {/* Goals Entry */}
          {[1, 2].map(team => (
            <div key={team} className="border rounded p-3 mt-4">
              <h3 className="font-semibold mb-2">Team {team === 1 ? matchDetails?.team1_name : matchDetails?.team2_name} Goals</h3>
              {form[`goal_score${team}`] > 0 && Array.from({ length: parseInt(form[`goal_score${team}`] || 0) }).map((_, idx) => {
                const goal = (form.goals || []).find(g => g.team === team && g.idx === idx) || {};
                // All players from both teams
                const allPlayers = [...team1Players, ...team2Players];
                // Current team id
                const currentTeamId = team === 1 ? matchDetails?.team_id1 : matchDetails?.team_id2;
                // Is selected player from current team?
                const selectedPlayer = allPlayers.find(p => p.player_id?.toString() === goal.player_id?.toString());
                const isOwnGoal = selectedPlayer && selectedPlayer.player_id && selectedPlayer.player_id.toString() !== currentTeamId?.toString() && ((team === 1 && team2Players.some(p => p.player_id?.toString() === goal.player_id?.toString())) || (team === 2 && team1Players.some(p => p.player_id?.toString() === goal.player_id?.toString())));
                return (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <span className="text-sm">Goal #{idx + 1}</span>
                    <select value={goal.player_id || ''} onChange={e => handleGoalDetail(team, idx, 'player_id', e.target.value)} className="border rounded px-2 py-1 bg-dark-700 text-white focus:ring-2 focus:ring-green-700">
                      <option value="">Player</option>
                      {allPlayers.map(p => (
                        <option key={p.player_id} value={p.player_id}>{p.name} ({p.player_id})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={(() => {
                        const opt = halfOptions.find(h => h.value === Number(goal.goal_half));
                        return opt ? opt.min : 0;
                      })()}
                      max={(() => {
                        const opt = halfOptions.find(h => h.value === Number(goal.goal_half));
                        return opt ? opt.max : 45;
                      })()}
                      value={goal.goal_time || ''}
                      onChange={e => handleGoalDetail(team, idx, 'goal_time', e.target.value)}
                      className="border rounded px-2 py-1 w-20 bg-dark-700 text-white focus:ring-2 focus:ring-green-700"
                      placeholder="Time"
                    />
                    <select value={isOwnGoal ? 'O' : (goal.goal_type || 'N')} onChange={e => handleGoalDetail(team, idx, 'goal_type', e.target.value)} className="border rounded px-2 py-1 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" disabled={isOwnGoal}>
                      {goalTypes.map(gt => (
                        <option key={gt.value} value={gt.value}>{gt.label}</option>
                      ))}
                    </select>
                    <select value={goal.goal_half || 1} onChange={e => handleGoalDetail(team, idx, 'goal_half', e.target.value)} className="border rounded px-2 py-1 bg-dark-700 text-white focus:ring-2 focus:ring-green-700">
                      {halfOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {isOwnGoal && <span className="text-xs text-red-600">Own Goal</span>}
                  </div>
                );
              })}
            </div>
          ))}
          {/* Red Cards */}
          <div className="mt-4">
            <label className="block font-medium mb-1">Any Red Cards?</label>
            <input type="checkbox" checked={form.hasRedCard} onChange={handleRedCardToggle} />
            {form.hasRedCard && (
              <div className="mt-2">
                <label>Number of Red Cards:</label>
                <input type="number" min={0} value={form.redCardCount} onChange={handleRedCardCount} className="border rounded px-2 py-1 ml-2 w-20 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" />
                {form.redCardCount > 0 && Array.from({ length: form.redCardCount }).map((_, idx) => {
                  const booking = form.bookings[idx] || {};
                  return (
                    <div key={idx} className="flex gap-2 mb-2 items-center mt-2">
                      <span className="text-sm">Red Card #{idx + 1}</span>
                      <select value={booking.player_id || ''} onChange={e => handleBookingDetail(idx, 'player_id', e.target.value)} className="border rounded px-2 py-1 bg-dark-700 text-white focus:ring-2 focus:ring-green-700">
                        <option value="">Player</option>
                        {[...team1Players, ...team2Players].map(p => (
                          <option key={p.player_id} value={p.player_id}>{p.name}</option>
                        ))}
                      </select>
                      <input type="number" min={0} max={90} value={booking.booking_time || ''} onChange={e => handleBookingDetail(idx, 'booking_time', e.target.value)} className="border rounded px-2 py-1 w-20 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" placeholder="Time" />
                      <select value={booking.play_half || 1} onChange={e => handleBookingDetail(idx, 'play_half', e.target.value)} className="border rounded px-2 py-1 bg-dark-700 text-white focus:ring-2 focus:ring-green-700">
                        {halfOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {form.decided_by === 'P' && (
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <label className="block font-medium mb-1">Team 1 Penalties</label>
                <input type="number" min={0} value={penaltyScores.team1} onChange={e => handlePenaltyScoreChange('team1', e.target.value)} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" required />
                {Array.from({ length: parseInt(penaltyScores.team1 || 0) }).map((_, idx) => (
                  <select key={idx} value={penaltyScorers.team1[idx] || ''} onChange={e => handlePenaltyScorerChange('team1', idx, e.target.value)} className="w-full border rounded px-2 py-1 mt-1 bg-dark-700 text-white focus:ring-2 focus:ring-green-700">
                    <option value="">Select Scorer</option>
                    {team1Players.map(p => (
                      <option key={p.player_id} value={p.player_id}>{p.name} ({p.player_id})</option>
                    ))}
                  </select>
                ))}
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Team 2 Penalties</label>
                <input type="number" min={0} value={penaltyScores.team2} onChange={e => handlePenaltyScoreChange('team2', e.target.value)} className="w-full border rounded px-3 py-2 bg-dark-700 text-white focus:ring-2 focus:ring-green-700" required />
                {Array.from({ length: parseInt(penaltyScores.team2 || 0) }).map((_, idx) => (
                  <select key={idx} value={penaltyScorers.team2[idx] || ''} onChange={e => handlePenaltyScorerChange('team2', idx, e.target.value)} className="w-full border rounded px-2 py-1 mt-1 bg-dark-700 text-white focus:ring-2 focus:ring-green-700">
                    <option value="">Select Scorer</option>
                    {team2Players.map(p => (
                      <option key={p.player_id} value={p.player_id}>{p.name} ({p.player_id})</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          )}
          <button type="submit" className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900 focus:ring-2 focus:ring-green-700 transition disabled:opacity-60" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Match Details'}
          </button>
        </>
      )}
    </form>
  );
} 
