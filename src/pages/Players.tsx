<<<<<<< HEAD
import React from "react";
import Layout from "@/components/layout/Layout";
import PlayerList from "@/components/players/PlayerList";
// Assuming you are using react-router-dom and the tournamentId is a route parameter
import { useParams } from 'react-router-dom';

const Players = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();

  // You might want to handle the case where tournamentId is undefined
  if (!tournamentId) {
    // Render a loading state, error message, or redirect
    return (
      <Layout>
        <div className="text-center text-muted-foreground">Loading or invalid tournament ID...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Pass the tournamentId down to the PlayerList component */}
      <PlayerList tournamentId={tournamentId} />
=======

import React from "react";
import Layout from "@/components/layout/Layout";
import PlayerList from "@/components/players/PlayerList";

const Players = () => {
  return (
    <Layout>
      <PlayerList />
>>>>>>> c9af91c62fcaf3a7daa80ec56c6537ac01608061
    </Layout>
  );
};

export default Players;
