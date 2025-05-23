import React from 'react';
import TournamentMatchesSearch from '../components/guest/TournamentMatchesSearch';
import TopScorerCard from '../components/guest/TopScorerCard';
import RedCardedPlayersTable from '../components/guest/RedCardedPlayersTable';
import TeamMembersViewer from '../components/guest/TeamMembersViewer';
import TournamentTeamStatsChart from '../components/guest/TournamentTeamStatsChart';
import PlayerAccumulatedGoalsChart from '../components/guest/PlayerAccumulatedGoalsChart'

export default function GuestPanel() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-green-500">Guest Panel</h1>
      <div className="space-y-8">
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Browse Tournament Matches</h2>
          <TournamentMatchesSearch />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Top Scorer</h2>
          <TopScorerCard />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Red Carded Players</h2>
          <RedCardedPlayersTable />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Team Members</h2>
          <TeamMembersViewer />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Team stats</h2>
          <TournamentTeamStatsChart />
        </section>
        <section className="bg-dark-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-400">Player Accumulated Goals </h2>
          <PlayerAccumulatedGoalsChart />
        </section>
      </div>
    </div>
  );
} 
