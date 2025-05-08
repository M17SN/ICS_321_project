import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function MyTeamDetails() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`http://localhost:4000/player/my-team/${encodeURIComponent(user.username)}`);
        setTeam(res.data.team || []);
      } catch (err) {
        if (err.response && err.response.status === 404 && err.response.data?.error === 'Player is not registered with any team.') {
          setError('You are not registered with any team or tournament.');
        } else {
          setError('Failed to fetch your team.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?.username) fetchTeam();
  }, [user]);

  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : team && team.length > 0 ? (
        <div>
          <div className="font-bold mb-2 text-lg">Your Team(s):</div>
          <ul className="list-disc ml-6 text-blue-800 font-medium space-y-1">
            {team.map((t, i) => (
              <li key={i}>{t.team_name}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>You are not registered with any team or tournament.</div>
      )}
    </div>
  );
} 