import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Timer as TimerIcon, Users, LayoutGrid, Settings, ChevronRight,
  LayoutDashboard, Trophy // Added Trophy icon for the "No Tournament Selected" state
} from "lucide-react";
import { useTournament } from "@/context/TournamentContext";
import { toast } from "sonner"; // Import toast for messages

const Index = () => {
  // Assume the useTournament context now stores the ID of the currently active tournament
  // This ID should be set when a tournament is created, loaded, or selected.
  const { state } = useTournament();
  const activeTournamentId = state.id; // Correctly referencing `state.id` for the active tournament ID

  // Render a message or redirect if no active tournament is selected
  if (!activeTournamentId) {
    // You might want to redirect to the homepage or dashboard if no tournament is active
    // const navigate = useNavigate();
    // useEffect(() => {
    //    toast.info("Please select or create a tournament first.");
    //    navigate('/'); // Example: Redirect to homepage
    // }, [navigate]);

    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center">
            <Trophy className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium mb-2">No Tournament Selected</p>
            <p>Please select or create a tournament from the homepage.</p>
            {/* Optional: Add a link back to the homepage */}
            <Link to="/" className="mt-4 text-primary hover:underline">Go to Homepage</Link>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Dashboard Link - Update path */}
        <Card className="hover:border-primary/50 transition-colors">
          {/* Link to the dashboard for the specific tournament */}
          <Link to={`/tournaments/${activeTournamentId}/dashboard`} className="block p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Dashboard</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tournament dashboard
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-primary">
              <span className="font-medium">View Dashboard</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </Card>

        {/* Players Link - Update path */}
        <Card className="hover:border-primary/50 transition-colors">
          {/* Link to the players page for the specific tournament */}
          <Link to={`/tournaments/${activeTournamentId}/players`} className="block p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Players</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage players
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-primary">
              <span className="font-medium">View Players</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </Card>

        {/* Tables Link - Update path */}
        <Card className="hover:border-primary/50 transition-colors">
          {/* Link to the tables page for the specific tournament */}
          <Link to={`/tournaments/${activeTournamentId}/tables`} className="block p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Tables</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Assign & manage tables
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-primary">
              <span className="font-medium">View Tables</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </Card>

        {/* Timer Link - Update path */}
        <Card className="hover:border-primary/50 transition-colors">
          {/* Link to the timer page for the specific tournament */}
          <Link to={`/tournaments/${activeTournamentId}/timer`} className="block p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Timer</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Full screen timer
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TimerIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-primary">
              <span className="font-medium">View Timer</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </Card>

        {/* Setup Link - Update path */}
        <Card className="hover:border-primary/50 transition-colors">
          {/* Link to the setup page for the specific tournament */}
          <Link to={`/tournaments/${activeTournamentId}/setup`} className="block p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">Setup</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tournament settings
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-primary">
              <span className="font-medium">View Setup</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;