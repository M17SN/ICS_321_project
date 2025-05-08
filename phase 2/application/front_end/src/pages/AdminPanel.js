import React from 'react';
import AddTournamentForm from '../components/admin/AddTournamentForm';
import AddTeamToTournamentForm from '../components/admin/AddTeamToTournamentForm';
import SelectCaptainForm from '../components/admin/SelectCaptainForm';
import ApprovePlayerRequestsTable from '../components/admin/ApprovePlayerRequestsTable';
import DeleteTournamentForm from '../components/admin/DeleteTournamentForm';
import AdminScheduleMatchForm from '../components/admin/AdminScheduleMatchForm';
import CreateTeamForm from '../components/admin/CreateTeamForm';

export default function AdminPanel() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="space-y-8">
        <section className="bg-white p-6 rounded shadow">
          <CreateTeamForm />
        </section>
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Add a New Tournament</h2>
          <AddTournamentForm />
        </section>
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Add a Team to a Tournament</h2>
          <AddTeamToTournamentForm />
        </section>
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Select Team Captain</h2>
          <SelectCaptainForm />
        </section>
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Approve Player Join Requests</h2>
          <ApprovePlayerRequestsTable />
        </section>
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Schedule a Match</h2>
          <AdminScheduleMatchForm />
        </section>
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Delete Tournament</h2>
          <DeleteTournamentForm />
        </section>
      </div>
    </div>
  );
} 