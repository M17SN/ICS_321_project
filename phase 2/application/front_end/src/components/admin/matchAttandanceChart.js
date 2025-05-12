import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function MatchAttendanceChart() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:4000/tournaments')
      .then(res => setTournaments(res.data))
      .catch(() => setTournaments([]));
  }, []);

  const fetchAttendance = async () => {
    if (!selectedTournament) return;
    setLoading(true);
    try {
        
      const tr = tournaments.find(t => t.tr_name === selectedTournament);
      console.log(tr.tr_id)
      const res = await axios.get(`http://localhost:4000/admin/${tr.tr_id}/stats`);
      console.log(res.data)
      setAttendanceData(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          fetchAttendance();
        }}
        className="flex flex-col sm:flex-row gap-2 mb-4 items-center bg-dark-800 p-4 rounded shadow text-white"
      >
        <select
          value={selectedTournament}
          onChange={e => setSelectedTournament(e.target.value)}
          className="px-3 py-2 border rounded w-full sm:w-auto focus:ring-2 focus:ring-green-700 bg-dark-700 text-white"
          required
        >
          <option value="" disabled>Select Tournament</option>
          {tournaments.map(t => (
            <option key={t.tr_id} value={t.tr_name}>{t.tr_name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-900 focus:ring-2 focus:ring-green-700 transition disabled:opacity-60"
          disabled={loading || !selectedTournament}
        >
          {loading ? 'Loading...' : 'Show Attendance'}
        </button>
      </form>

      {attendanceData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="matchLabel" angle={-30} textAnchor="end" interval={0} height={70} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="audience" name="Audience Count" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : selectedTournament && !loading ? (
        <div className="text-center text-gray-500 mt-4">No attendance data available for this tournament.</div>
      ) : null}
    </div>
  );
}
