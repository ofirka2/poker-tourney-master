// src/components/share/ShareTournament.tsx
import React, { useState } from "react";
import { Share2, Copy, CheckCheck, Link as LinkIcon, Loader2 } from "lucide-react";
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
import { shortenUrl } from "@/utils/urlShortener";

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
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    players: true,
    tables: false,
    payouts: true
  });
  const { state } = useTournament();
  
  // Create a shareable URL with tournament state encoded
  const generateFullUrl = () => {
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
    const encodedData = btoa(JSON.stringify(shareState));
    const baseUrl = window.location.origin;
    return `${baseUrl}/tournament/view?data=${encodedData}`;
  };

  // Generate and return a shortened URL
  const generateShareUrl = async () => {
    setIsGenerating(true);
    try {
      // Generate the full URL first
      const fullUrl = generateFullUrl();
      
      // If we already have a short URL for this configuration, return it
      if (shortUrl) {
        return shortUrl;
      }
      
      // Otherwise, create a new short URL
      const newShortUrl = shortenUrl(fullUrl);
      setShortUrl(newShortUrl);
      return newShortUrl;
    } catch (error) {
      console.error("Error generating share URL:", error);
      toast.error("Failed to generate share link");
      // Fall back to the full URL if shortening fails
      return generateFullUrl();
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = async () => {
    setIsGenerating(true);
    try {
      const url = await generateShareUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error("Failed to copy link");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const shareViaChannel = async (channel: 'whatsapp' | 'email' | 'message') => {
    setIsGenerating(true);
    try {
      const url = await generateShareUrl();
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
    } catch (error) {
      toast.error("Failed to share tournament");
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset short URL when share options change
  const updateShareOptions = (newOptions: typeof shareOptions) => {
    setShareOptions(newOptions);
    setShortUrl(null); // Reset short URL as the content has changed
  };

  // Handle dialog open to pre-generate the short URL
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Pre-generate the short URL when the dialog opens
      generateShareUrl();
    }
  };
  
  return (
    <div className="flex-1"> {/* Container div with flex-1 class */}
      <Button 
        variant="outline" 
        onClick={() => handleOpenChange(true)} 
        className="w-full" // Make button take full width of container
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share Tournament
      </Button>
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  onCheckedChange={(checked) => updateShareOptions({...shareOptions, players: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="tables" className="flex-1">Table Assignments</Label>
                <Switch 
                  id="tables" 
                  checked={shareOptions.tables}
                  onCheckedChange={(checked) => updateShareOptions({...shareOptions, tables: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="payouts" className="flex-1">Payout Information</Label>
                <Switch 
                  id="payouts" 
                  checked={shareOptions.payouts}
                  onCheckedChange={(checked) => updateShareOptions({...shareOptions, payouts: checked})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                onClick={() => shareViaChannel('whatsapp')}
                className="col-span-2 sm:col-span-1"
                disabled={isGenerating}
              >
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                onClick={() => shareViaChannel('email')}
                className="col-span-2 sm:col-span-1"
                disabled={isGenerating}
              >
                Email
              </Button>
              <Button 
                variant="outline" 
                onClick={() => shareViaChannel('message')}
                className="col-span-2 sm:col-span-1"
                disabled={isGenerating}
              >
                Message
              </Button>
              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                className="col-span-2 sm:col-span-1"
                disabled={isGenerating}
              >
                {copied ? (
                  <CheckCheck className="h-4 w-4 mr-1" />
                ) : isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            
            <div className="relative">
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Share link:</span>
              </div>
              <div className="relative mt-1">
                <Input 
                  value={shortUrl || "Generating short link..."}
                  readOnly 
                  className="pr-10"
                  disabled={isGenerating || !shortUrl}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full"
                  onClick={copyToClipboard}
                  disabled={isGenerating || !shortUrl}
                >
                  {copied ? (
                    <CheckCheck className="h-4 w-4" />
                  ) : isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
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