
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Timer as TimerIcon, Users, LayoutGrid, Settings, ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { useTournament } from "@/context/TournamentContext";

const Index = () => {
  const { state } = useTournament();
  
  return (
    <Layout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <Card className="hover:border-primary/50 transition-colors">
          <Link to="/dashboard" className="block p-6">
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
        
        <Card className="hover:border-primary/50 transition-colors">
          <Link to="/players" className="block p-6">
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
        
        <Card className="hover:border-primary/50 transition-colors">
          <Link to="/tables" className="block p-6">
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
        
        <Card className="hover:border-primary/50 transition-colors">
          <Link to="/timer" className="block p-6">
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
        
        <Card className="hover:border-primary/50 transition-colors">
          <Link to="/setup" className="block p-6">
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
