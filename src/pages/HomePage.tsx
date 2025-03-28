
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trophy, Users, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import { MultiStepTournamentForm } from "@/components/home/MultiStepTournamentForm";

const HomePage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const navigate = useNavigate();

  // Fetch tournaments from Supabase
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTournaments(data || []);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const handleTournamentCreated = () => {
    // Refetch tournaments after creation
    setShowCreateTournament(false);
    navigate('/setup');
  };

  const viewTournament = (id) => {
    // Navigate to tournament view
    navigate('/tournament');
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
                        <th className="pb-2 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tournaments.map((tournament) => (
                        <tr key={tournament.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-medium">{tournament.name || 'Untitled Tournament'}</td>
                          <td className="py-3 text-muted-foreground">
                            {tournament.start_date 
                              ? format(new Date(tournament.start_date), 'MMM d, yyyy')
                              : 'Not set'}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tournament.status === 'Completed' 
                                ? 'bg-green-100 text-green-800'
                                : tournament.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {tournament.status || 'Not Started'}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            <div className="flex items-center">
                              <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              {tournament.no_of_players || 0}
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {tournament.winner || '-'}
                          </td>
                          <td className="py-3 text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => viewTournament(tournament.id)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
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

        {/* Tournament Creation Dialog */}
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
