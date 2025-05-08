import React from 'react';
import JoinRequestForm from '../components/player/JoinRequestForm';
import MyRequestsTable from '../components/player/MyRequestsTable';
import MyTeamDetails from '../components/player/MyTeamDetails';

export default function PlayerPanel() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Player Panel</h1>
      <div className="space-y-8">
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Submit Join Request</h2>
          <JoinRequestForm />
        </section>
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">My Requests & Status</h2>
          <MyRequestsTable />
        </section>
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">My Team & Tournament</h2>
          <MyTeamDetails />
        </section>
      </div>
    </div>
  );
} 