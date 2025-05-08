import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ApprovePlayerRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:4000/admin/player-requests');
      setRequests((res.data.pending_requests || []).filter(r => r.status === 'pending'));
    } catch (err) {
      setError('Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request) => {
    try {
      await axios.post('http://localhost:4000/admin/approve-player', {
        player_name: request.player_name,
        team_name: request.team_name,
        tournament_name: request.tournament_name,
      });
      toast.success('Player approved successfully!');
      setRequests(prev => prev.map(r =>
        r.request_id === request.request_id ? { ...r, status: 'approved' } : r
      ));
    } catch (err) {
      const backendMsg = err.response?.data?.error || 'Failed to approve player.';
      toast.error(backendMsg);
    }
  };

  const handleReject = async (request) => {
    try {
      await axios.delete('http://localhost:4000/admin/reject-player', {
        data: {
          player_name: request.player_name,
          team_name: request.team_name,
          tournament_name: request.tournament_name,
        },
      });
      toast.success('Player join request rejected.');
      setRequests(prev => prev.map(r =>
        r.request_id === request.request_id ? { ...r, status: 'rejected' } : r
      ));
    } catch (err) {
      const backendMsg = err.response?.data?.error || 'Failed to reject player request.';
      toast.error(backendMsg);
    }
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-2">No pending requests.</div>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Player</th>
              <th className="border px-2 py-1">Team</th>
              <th className="border px-2 py-1">Tournament</th>
              <th className="border px-2 py-1">Request Date</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.request_id}>
                <td className="border px-2 py-1">{req.player_name}</td>
                <td className="border px-2 py-1">{req.team_name}</td>
                <td className="border px-2 py-1">{req.tournament_name}</td>
                <td className="border px-2 py-1">{req.request_date}</td>
                <td className="border px-2 py-1">
                  {req.status === 'pending' && (
                    <>
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition disabled:opacity-60"
                        onClick={() => handleApprove(req)}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition ml-2 disabled:opacity-60"
                        onClick={() => handleReject(req)}
                      >
                        Reject
                      </button>
                      <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-semibold">Pending</span>
                    </>
                  )}
                  {req.status === 'approved' && (
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">Approved</span>
                  )}
                  {req.status === 'rejected' && (
                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded font-semibold">Rejected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 