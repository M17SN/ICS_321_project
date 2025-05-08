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
    <div className="bg-blue-50 p-4 rounded shadow flex flex-col items-center">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : scorer ? (
        <>
          <div className="text-lg font-bold mb-2">{scorer.name}</div>
          <div className="mb-1">Jersey #: <span className="font-semibold">{scorer.jersey_no}</span></div>
          <div className="mb-1">Position: <span className="font-semibold">{scorer.position_to_play}</span></div>
          <div className="mb-1">Total Goals: <span className="font-bold text-blue-700">{scorer.total_goals}</span></div>
        </>
      ) : (
        <div>No scorer data available.</div>
      )}
    </div>
  );
} 