
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Timer, Users, LayoutGrid, Settings, Home, 
  ChevronRight, Menu, X, LayoutDashboard 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTournament } from "@/context/TournamentContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { state } = useTournament();
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === "/";

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/timer", label: "Timer", icon: Timer },
    { path: "/players", label: "Players", icon: Users },
    { path: "/tables", label: "Tables", icon: LayoutGrid },
    { path: "/setup", label: "Setup", icon: Settings }
  ];
  
  // Current level information
  const currentLevel = state.settings.levels[state.currentLevel];
  const isBreak = currentLevel?.isBreak;
  const nextLevel = state.currentLevel < state.settings.levels.length - 1 
    ? state.settings.levels[state.currentLevel + 1] 
    : null;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
      {/* Header - Show only for tournament pages, not home page */}
      {!isHomePage && (
        <header className="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-foreground tracking-tight">Poker Master</h1>
              
              {/* Tournament status badge */}
              {state.isRunning ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-poker-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-poker-green"></span>
                </span>
              ) : null}
            </div>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary",
                    isActive(item.path) 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </header>
      )}
      
      {/* Mobile navigation - Hide on home page */}
      {!isHomePage && menuOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-sm animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 p-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.path) 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                onClick={() => setMenuOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
      
      {/* Tournament status bar - Hide on home page */}
      {!isHomePage && state.players.length > 0 && (
        <div className="bg-muted/30 border-b border-border/30">
          <div className="container mx-auto px-4 py-2 flex flex-wrap justify-between items-center gap-y-2 text-sm">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-muted-foreground">Players: </span>
                <span className="font-medium">{state.players.filter(p => !p.eliminated).length}/{state.players.length}</span>
              </div>
              
              <div>
                <span className="text-muted-foreground">Prize Pool: </span>
                <span className="font-medium">${state.totalPrizePool}</span>
              </div>
            </div>
            
            {currentLevel && (
              <div className="flex items-center space-x-2">
                <div className="text-muted-foreground">
                  {isBreak ? (
                    <span className="font-medium text-poker-green">Break</span>
                  ) : (
                    <>
                      <span>Level {currentLevel.level}: </span>
                      <span className="font-medium">{currentLevel.smallBlind}/{currentLevel.bigBlind}</span>
                      {currentLevel.ante > 0 && <span className="font-medium"> (ante: {currentLevel.ante})</span>}
                    </>
                  )}
                </div>
                
                {nextLevel && (
                  <div className="flex items-center text-muted-foreground/70">
                    <ChevronRight size={14} />
                    <span>
                      {nextLevel.isBreak ? (
                        "Break"
                      ) : (
                        <>{nextLevel.smallBlind}/{nextLevel.bigBlind}</>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className={cn(
        "flex-1 container mx-auto px-4",
        isHomePage ? "py-6" : "py-6 md:py-8 lg:py-10"
      )}>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-background border-t border-border/60">
        <div className="container mx-auto px-4 py-4 text-center text-muted-foreground text-sm">
          <p>Poker Tournament Manager</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
