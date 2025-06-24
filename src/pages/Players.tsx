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
    </Layout>
  );
};

export default Players;