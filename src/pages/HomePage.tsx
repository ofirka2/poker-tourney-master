
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Eye, Trophy, Calendar, Users, ChevronRight, ChevronLeft } from "lucide-react";
import { useTournament } from "@/context/TournamentContext";
import { MultiStepTournamentForm } from "@/components/home/MultiStepTournamentForm";

interface Tournament {
  id: string;
  name: string;
  start_date: string;
  no_of_players: number | null;
  winner: string | null;
  status: string;
}

const HomePage = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useTournament();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, start_date, no_of_players, winner, status')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const viewTournament = async (tournamentId: string) => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) throw error;
      
      if (data) {
        // Update tournament context with the selected tournament data
        dispatch({ 
          type: 'LOAD_TOURNAMENT', 
          payload: {
            id: data.id,
            name: data.name,
            settings: {
              buyInAmount: data.buy_in || 0,
              rebuyAmount: data.rebuy_amount || 0,
              addOnAmount: data.addon_amount || 0,
              initialChips: data.starting_chips || 1000,
              rebuyChips: data.rebuy_amount || 0,
              addOnChips: data.addon_amount || 0,
              maxRebuys: data.max_rebuys || 0,
              maxAddOns: data.max_addons || 0,
              lastRebuyLevel: data.last_rebuy_level || 0,
              lastAddOnLevel: data.last_addon_level || 0,
              levels: data.blind_levels ? JSON.parse(data.blind_levels as string) : [],
              payoutStructure: {
                places: []
              }
            },
            players: [],
            tables: [],
            status: data.status,
            startDate: data.start_date,
            endDate: data.end_date,
            allowRebuy: data.allow_rebuy || false,
            allowAddon: data.allow_addon || false,
            format: data.format || 'Freezeout',
            chipset: data.chipset || '',
            desiredDuration: data.desired_duration || null,
            noOfPlayers: data.no_of_players || 0
          }
        });
        
        // Navigate to tournament dashboard
        navigate('/tournament/view');
      }
    } catch (error) {
      console.error('Error loading tournament:', error);
      toast.error('Failed to load tournament');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'not started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Poker Tournament Manager</h1>
            <p className="text-muted-foreground">View past tournaments or create a new one</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="mr-2 h-4 w-4" /> Create Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <MultiStepTournamentForm onFinish={() => {
                setCreateDialogOpen(false);
                navigate('/setup');
              }} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Tournament History
            </CardTitle>
            <CardDescription>
              View past tournaments and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tournaments found</p>
                <p className="text-sm text-muted-foreground mt-2">Create a new tournament to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tournament Name</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" /> Date
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" /> Players
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Winner</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tournaments.map((tournament) => (
                      <TableRow key={tournament.id}>
                        <TableCell className="font-medium">{tournament.name}</TableCell>
                        <TableCell>{formatDate(tournament.start_date)}</TableCell>
                        <TableCell>{tournament.no_of_players || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(tournament.status)}`}>
                            {tournament.status}
                          </span>
                        </TableCell>
                        <TableCell>{tournament.winner || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => viewTournament(tournament.id)}
                          >
                            <Eye className="mr-1 h-4 w-4" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HomePage;
