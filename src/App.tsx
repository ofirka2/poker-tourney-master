// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TournamentProvider } from "@/context/TournamentContext";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard"; // Keep this import as it's used in routes
import Players from "./pages/Players";
import Tables from "./pages/Tables";
import Setup from "./pages/Setup";
import Timer from "./pages/Timer";
import TournamentView from "./pages/TournamentView";
import ShortUrlRedirect from "./pages/ShortUrlRedirect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TournamentProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            {/* Public/General Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/tournament" element={<Index />} /> {/* Menu for active tournament */}
            {/* If you have a general dashboard, you can uncomment this. Otherwise, keep it commented as specific ones exist */}
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            <Route path="/t/:shortId" element={<ShortUrlRedirect />} /> {/* Short URL redirects */}
            <Route path="*" element={<NotFound />} /> {/* Catch-all */}

            {/* Tournament-Specific Routes (preferring this structure) */}
            <Route path="/tournaments/:tournamentId/" element={<TournamentView />} />
            <Route path="/tournaments/:tournamentId/dashboard" element={<Dashboard />} /> {/* Added this route */}
            <Route path="/tournaments/:tournamentId/players" element={<Players />} />
            <Route path="/tournaments/:tournamentId/tables" element={<Tables />} />
            <Route path="/tournaments/:tournamentId/setup" element={<Setup />} />
            <Route path="/tournaments/:tournamentId/timer" element={<Timer />} />
          </Routes>
        </HashRouter>
      </TournamentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;