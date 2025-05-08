import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function MyRequestsTable() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`http://localhost:4000/player/my-requests/${encodeURIComponent(user.username)}`);
        setRequests(res.data.requests || []);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setRequests([]); // treat as no requests
        } else {
          setError('Failed to fetch your requests.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?.username) fetchRequests();
  }, [user]);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm shadow rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Team</th>
                <th className="border px-2 py-1">Tournament</th>
                <th className="border px-2 py-1">Request Date</th>
                <th className="border px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-2 text-gray-500">You have not made any join requests yet.</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.request_id} className="hover:bg-blue-50 transition">
                    <td className="border px-2 py-1">{req.team_name}</td>
                    <td className="border px-2 py-1">{req.tournament_name}</td>
                    <td className="border px-2 py-1">{req.request_date}</td>
                    <td className="border px-2 py-1">
                      <span
                        className={
                          req.status === 'pending'
                            ? 'bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-semibold'
                            : req.status === 'approved'
                            ? 'bg-green-200 text-green-800 px-2 py-1 rounded font-semibold'
                            : req.status === 'rejected'
                            ? 'bg-red-200 text-red-800 px-2 py-1 rounded font-semibold'
                            : ''
                        }
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 