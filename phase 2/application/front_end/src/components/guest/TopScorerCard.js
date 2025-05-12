import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TopScorerCard() {
  const [scorer, setScorer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScorer = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:4000/topscorer');
        setScorer(res.data);
      } catch (err) {
        setError('Failed to fetch top scorer.');
      } finally {
        setLoading(false);
      }
    };
    fetchScorer();
  }, []);

  return (
    <div className="bg-dark-800 p-4 rounded shadow flex flex-col items-center">
      {loading ? (
        <div className="text-gray-300">Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : scorer ? (
        <>
          <div className="text-lg font-bold mb-2 text-green-400">{scorer.name}</div>
          <div className="mb-1">Jersey #: <span className="font-semibold text-white">{scorer.jersey_no}</span></div>
          <div className="mb-1">Position: <span className="font-semibold text-white">{scorer.position_to_play}</span></div>
          <div className="mb-1">Total Goals: <span className="font-bold text-green-400">{scorer.total_goals}</span></div>
        </>
      ) : (
        <div className="text-gray-400">No scorer data available.</div>
      )}
    </div>
  );
} 