// src/components/share/ShareTournament.tsx
import React, { useState } from "react";
import { Share2, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { useTournament } from "@/context/TournamentContext";
import { toast } from "sonner";
import { Player, Table, TournamentLevel, PayoutStructure } from "@/types/types";

// Define interface for our shared tournament state
interface SharedTournamentState {
  id: string;
  timestamp: string;
  tournament: {
    currentLevel: number;
    isRunning: boolean;
    timeRemaining: number;
    activePlayers: number;
    totalPlayers: number;
    totalPrizePool: number;
    settings: {
      levels: TournamentLevel[];
      payoutStructure: PayoutStructure;
    };
    players?: Partial<Player>[];
    tables?: Partial<Table>[];
  };
}

const ShareTournament: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    players: true,
    tables: false,
    payouts: true
  });
  const { state } = useTournament();
  
  // Create a shareable URL with tournament state encoded
  const generateShareUrl = () => {
    // Create a simplified version of the tournament state for sharing
    const shareState: SharedTournamentState = {
      id: crypto.randomUUID(), // Generate a unique ID for this share
      timestamp: new Date().toISOString(),
      tournament: {
        currentLevel: state.currentLevel,
        isRunning: state.isRunning,
        timeRemaining: state.timeRemaining,
        activePlayers: state.players.filter(p => !p.eliminated).length,
        totalPlayers: state.players.length,
        totalPrizePool: state.totalPrizePool,
        settings: {
          levels: state.settings.levels,
          payoutStructure: state.settings.payoutStructure
        }
      }
    };
    
    // Include optional data based on share options
    if (shareOptions.players) {
      shareState.tournament.players = state.players.map(p => ({
        id: p.id,
        name: p.name,
        chips: p.chips,
        eliminated: p.eliminated,
        eliminationPosition: p.eliminationPosition
      }));
    }
    
    if (shareOptions.tables) {
      shareState.tournament.tables = state.tables;
    }
    
    // Generate the actual URL
    // In a real implementation, we might use a server endpoint or localStorage
    // Here we'll use base64 encoding of JSON for simplicity
    const encodedData = btoa(JSON.stringify(shareState));
    const baseUrl = window.location.origin;
    return `${baseUrl}/tournament/view?data=${encodedData}`;
  };
  
  const copyToClipboard = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };
  
  const shareViaChannel = (channel: 'whatsapp' | 'email' | 'message') => {
    const url = generateShareUrl();
    const text = `Check out my poker tournament: ${url}`;
    
    switch (channel) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=Poker Tournament&body=${encodeURIComponent(text)}`);
        break;
      case 'message':
        // SMS sharing is limited on web, but we can try
        if (navigator.share) {
          navigator.share({
            title: 'Poker Tournament',
            text: 'Check out my poker tournament',
            url: url
          }).catch(err => {
            console.error('Error sharing:', err);
          });
        } else {
          toast.error("SMS sharing not supported on this device");
        }
        break;
    }
    
    setOpen(false);
  };
  
  return (
    <div className="flex-1"> {/* Added container div with flex-1 class */}
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)} 
        className="w-full" // Make button take full width of container
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share Tournament
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Tournament View</DialogTitle>
            <DialogDescription>
              Create a read-only link to share tournament details with others
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>What to include:</Label>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="players" className="flex-1">Players & Scoreboard</Label>
                <Switch 
                  id="players" 
                  checked={shareOptions.players}
                  onCheckedChange={(checked) => setShareOptions({...shareOptions, players: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="tables" className="flex-1">Table Assignments</Label>
                <Switch 
                  id="tables" 
                  checked={shareOptions.tables}
                  onCheckedChange={(checked) => setShareOptions({...shareOptions, tables: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="payouts" className="flex-1">Payout Information</Label>
                <Switch 
                  id="payouts" 
                  checked={shareOptions.payouts}
                  onCheckedChange={(checked) => setShareOptions({...shareOptions, payouts: checked})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                onClick={() => shareViaChannel('whatsapp')}
                className="col-span-2 sm:col-span-1"
              >
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                onClick={() => shareViaChannel('email')}
                className="col-span-2 sm:col-span-1"
              >
                Email
              </Button>
              <Button 
                variant="outline" 
                onClick={() => shareViaChannel('message')}
                className="col-span-2 sm:col-span-1"
              >
                Message
              </Button>
              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                className="col-span-2 sm:col-span-1"
              >
                {copied ? <CheckCheck className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            
            <div className="relative">
              <Input 
                value={generateShareUrl()} 
                readOnly 
                className="pr-10"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
                onClick={copyToClipboard}
              >
                {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShareTournament;