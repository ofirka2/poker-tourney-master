// src/App.tsx
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TournamentProvider } from "@/context/TournamentContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Tables from "./pages/Tables";
import Setup from "./pages/Setup";
import Timer from "./pages/Timer";
import TournamentView from "./pages/TournamentView";
import ShortUrlRedirect from "./pages/ShortUrlRedirect";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TournamentProvider>
          <Sonner />
          <HashRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/t/:shortId" element={<ShortUrlRedirect />} /> {/* Short URL redirects */}
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/tournament" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              
              {/* Tournament-Specific Protected Routes */}
              <Route path="/tournaments/:tournamentId/" element={
                <ProtectedRoute>
                  <TournamentView />
                </ProtectedRoute>
              } />
              <Route path="/tournaments/:tournamentId/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/tournaments/:tournamentId/players" element={
                <ProtectedRoute>
                  <Players />
                </ProtectedRoute>
              } />
              <Route path="/tournaments/:tournamentId/tables" element={
                <ProtectedRoute>
                  <Tables />
                </ProtectedRoute>
              } />
              <Route path="/tournaments/:tournamentId/setup" element={
                <ProtectedRoute>
                  <Setup />
                </ProtectedRoute>
              } />
              <Route path="/tournaments/:tournamentId/timer" element={
                <ProtectedRoute>
                  <Timer />
                </ProtectedRoute>
              } />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TournamentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;