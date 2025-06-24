/**
 * @file Home page component displaying tournament history and a button to create new tournaments.
 * @description Fetches and displays a list of past tournaments from Supabase and provides
 * functionality to open a modal for creating a new tournament.
 *
 * @components
 * - Layout: Provides the main layout structure for the page.
 * - ui/button: A styled button component.
 * - ui/card: A styled card component.
 * - integrations/supabase/client: Provides the Supabase client for data fetching.
 * - components/home/MultiStepTournamentForm: The multi-step form for creating new tournaments.
 *
 * @hooks
 * - react-router-dom: Used for navigation between pages.
 * - react: Used for state management and lifecycle methods.
 *
 * @dependencies
 * - react
 * - react-router-dom
 * - date-fns
 * - lucide-react
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trophy, Eye } from 'lucide-react';
import { format } from 'date-fns';
import MultiStepTournamentForm from '@/components/home/MultiStepTournamentForm';
// Import useTournament context if needed here, though it's mainly used by MultiStepForm
// import { useTournament } from '@/context/TournamentContext';


/**
 * Interface for a tournament object fetched from Supabase.
 * Ensure this matches the structure returned by your Supabase query.
 */
interface Tournament {
  id: string; // Ensure ID is a string (UUID)
  name: string;
  start_date: string;
  status: string;
  no_of_players?: number; // Make optional as it might not be set initially
  winner?: string; // Make optional
  // Add any other relevant fields fetched from the 'tournaments' table
}

/**
 * HomePage component.
 * @returns JSX.Element
 */
const HomePage = () => {
  const [tournaments, setTournaments] = useState<Tournament[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const navigate = useNavigate();
  // const { dispatch } = useTournament(); // Uncomment if HomePage needs to dispatch context actions


  useEffect(() => {
    /**
     * Fetches the tournament history from Supabase.
     */
    const fetchTournaments = async () => {
      try {
        // Fetch tournaments, including the ID
        const { data, error } = await supabase
          .from('tournaments')
          .select('id, name, start_date, status, no_of_players, winner') // Explicitly select needed fields
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tournaments:', error);
          // TODO: Display user-friendly error message (e.g., toast notification)
          return;
        }

        // Ensure data is treated as Tournament[]
        setTournaments((data as Tournament[]) || []);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        // TODO: Display user-friendly error message (e.g., toast notification)
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Handles the event when a new tournament is created.
   * Closes the create tournament modal and navigates to the setup page for the new tournament.
   * This callback receives the newly created tournament data, including the ID.
   * @param newTournamentData - The data of the newly created tournament (from MultiStepTournamentForm).
   */
  const handleTournamentCreated = (newTournamentData: { id: string | null }) => {
    setShowCreateTournament(false);
    // Navigate to the setup page for the specific tournament using its ID
    if (newTournamentData?.id) { // Check if ID exists
        // Use the new route structure defined in App.tsx
        // Navigate to the setup page for the new tournament
        navigate(`/tournaments/${newTournamentData.id}/setup`, { replace: true });
        // Optional: Dispatch action to context if context needs to load the new tournament as active
        // dispatch({ type: 'LOAD_TOURNAMENT', payload: { id: newTournamentData.id } }); // Example dispatch
    } else {
        console.error("Tournament created but no valid ID received for navigation.");
        // Fallback navigation or error message
        // Navigate to the dashboard or homepage if ID is missing
        navigate('/'); // Example fallback
    }
  };

  /**
   * Handles the event when a user wants to view a tournament.
   * Navigates to the tournament dashboard page using the tournament ID.
   * @param tournamentId - The ID of the tournament to view.
   */
  const handleViewTournament = (tournamentId: string) => {
    navigate(`/tournaments/${tournamentId}/dashboard`);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Poker Tournaments</h1>
          <Button onClick={() => setShowCreateTournament(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Tournament
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : tournaments.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Trophy className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Tournaments Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first poker tournament to get started
              </p>
              <Button onClick={() => setShowCreateTournament(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Tournament
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tournament History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm text-muted-foreground">
                        <th className="pb-2 text-left font-medium">Name</th>
                        <th className="pb-2 text-left font-medium">Date</th>
                        <th className="pb-2 text-left font-medium">Status</th>
                        <th className="pb-2 text-left font-medium">Players</th>
                        <th className="pb-2 text-left font-medium">Winner</th>
                        <th className="pb-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tournaments.map((tournament) => (
                        <tr
                          key={tournament.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 font-medium">{tournament.name || 'Untitled Tournament'}</td>
                          <td className="py-3 text-muted-foreground">
                            {tournament.start_date
                              ? format(new Date(tournament.start_date), 'MMM d, yyyy') // Corrected format string
                              : 'Not set'}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                tournament.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : tournament.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {tournament.status || 'Not Started'}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">{tournament.no_of_players || 0}</td>
                          <td className="py-3 text-muted-foreground">{tournament.winner || '-'}</td>
                          <td className="py-3">
                            {/* Ensure tournament.id is valid before creating the button/link */}
                            {tournament.id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewTournament(tournament.id)}
                                  className="flex items-center"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <MultiStepTournamentForm
          open={showCreateTournament}
          onOpenChange={setShowCreateTournament}
          onTournamentCreated={handleTournamentCreated}
        />
      </div>
    </Layout>
  );
};

export default HomePage;