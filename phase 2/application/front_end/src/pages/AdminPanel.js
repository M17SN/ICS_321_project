import React from 'react';
import AddTournamentForm from '../components/admin/AddTournamentForm';
import AddTeamToTournamentForm from '../components/admin/AddTeamToTournamentForm';
import SelectCaptainForm from '../components/admin/SelectCaptainForm';
import ApprovePlayerRequestsTable from '../components/admin/ApprovePlayerRequestsTable';
import DeleteTournamentForm from '../components/admin/DeleteTournamentForm';
import AdminScheduleMatchForm from '../components/admin/AdminScheduleMatchForm';
import CreateTeamForm from '../components/admin/CreateTeamForm';
import MatchAttendanceChart from '../components/admin/matchAttandanceChart';
import { MatchResultEntryForm } from '../components/admin';

export default function AdminPanel() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-green-500">Admin Dashboard</h1>
      <div className="space-y-8">
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Create Team</h2>
          <CreateTeamForm />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Add Tournament</h2>
          <AddTournamentForm />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Add Team to Tournament</h2>
          <AddTeamToTournamentForm />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Select Captain</h2>
          <SelectCaptainForm />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Approve Player Requests</h2>
          <ApprovePlayerRequestsTable />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Schedule Match</h2>
          <AdminScheduleMatchForm />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Match Result Entry</h2>
          <MatchResultEntryForm />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Match Attendance Chart</h2>
          <MatchAttendanceChart />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Delete Tournament</h2>
          <DeleteTournamentForm />
        </section>
      </div>
    </div>
  );
} 
