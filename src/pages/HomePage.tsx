
import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '@/context/TournamentContext';
import { useSupabaseClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { toast } from 'sonner';
import MultiStepTournamentForm from '@/components/home/MultiStepTournamentForm';

const HomePage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useTournament();
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error fetching tournaments');
        console.error('Error fetching tournaments:', error);
      } else {
        setTournaments(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTournament = (tournament) => {
    // Convert from Supabase format to our app format
    const tournamentData = {
      name: tournament.name,
      startDate: tournament.start_date,
      isRunning: tournament.status === 'Running',
      currentLevel: tournament.current_level || 0,
      settings: {
        buyInAmount: tournament.buy_in,
        rebuyAmount: tournament.rebuy_amount,
        addOnAmount: tournament.addon_amount,
        initialChips: tournament.starting_chips,
        rebuyChips: tournament.rebuy_chips || tournament.starting_chips,
        addOnChips: tournament.addon_chips || tournament.starting_chips,
        maxRebuys: tournament.max_rebuys || 2,
        maxAddOns: tournament.max_addons || 1,
        lastRebuyLevel: tournament.last_rebuy_level || 6,
        lastAddOnLevel: tournament.last_addon_level || 6,
        levels: tournament.blind_levels || [],
        payoutStructure: tournament.payout_structure || {
          places: [
            { position: 1, percentage: 50 },
            { position: 2, percentage: 30 },
            { position: 3, percentage: 20 },
          ]
        }
      },
      players: tournament.players || []
    };

    dispatch({ type: 'LOAD_TOURNAMENT', payload: tournamentData });
    navigate('/tournament/view');
  };

  const handleCreateTournament = () => {
    setDialogOpen(true);
  };

  const onDialogClose = () => {
    setDialogOpen(false);
    fetchTournaments(); // Refresh list after creating
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tournament History</h1>
          <Button onClick={handleCreateTournament}>Create New Tournament</Button>
        </div>

        {isLoading ? (
          <div className="text-center">Loading tournaments...</div>
        ) : tournaments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tournaments.map((tournament) => (
                  <tr key={tournament.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{tournament.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tournament.start_date ? format(new Date(tournament.start_date), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${tournament.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          tournament.status === 'Running' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {tournament.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{tournament.no_of_players || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tournament.winner || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button size="sm" onClick={() => handleViewTournament(tournament)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No tournaments found. Create your first tournament!</p>
          </div>
        )}

        <MultiStepTournamentForm open={dialogOpen} onOpenChange={onDialogClose} />
      </div>
    </Layout>
  );
};

export default HomePage;
