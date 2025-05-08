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
        const res = await axios.get(`http://localhost:4000/admin/player-requests?username=${encodeURIComponent(user.username)}`);
        setRequests(res.data.pending_requests || []);
      } catch (err) {
        setError('Failed to fetch your requests.');
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
                <tr><td colSpan={4} className="text-center py-2">No requests found.</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.request_id} className="hover:bg-blue-50 transition">
                    <td className="border px-2 py-1">{req.team_name}</td>
                    <td className="border px-2 py-1">{req.tournament_name}</td>
                    <td className="border px-2 py-1">{req.request_date}</td>
                    <td className="border px-2 py-1">{req.status}</td>
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