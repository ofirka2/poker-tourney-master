import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TournamentProvider } from "@/context/TournamentContext";
import Index from "./pages/Index";
import Players from "./pages/Players";
import Tables from "./pages/Tables";
import Setup from "./pages/Setup";
import Timer from "./pages/Timer";
import TournamentView from "./pages/TournamentView"; // Import the new view page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TournamentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/players" element={<Players />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/tournament/view" element={<TournamentView />} /> {/* Add the view route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TournamentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;