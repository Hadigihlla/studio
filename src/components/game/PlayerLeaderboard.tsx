
"use client";

import type { Player, PlayerStatus } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PlayerLeaderboardProps {
  players: (Player)[];
  onSetAvailability?: (playerId: string, status: PlayerStatus) => void;
  gamePhase?: "availability" | "teams" | "results" | "manual-draft";
  onAssignPlayer?: (playerId: string, team: 'teamA' | 'teamB' | null) => void;
}

const AvailabilityControls = ({ player, onSetAvailability }: { player: Player, onSetAvailability: (id: string, status: PlayerStatus) => void }) => {
    const isPlayerIn = player.status === 'in' || player.status === 'waiting';
    
    const handleSwitchChange = (checked: boolean) => {
        onSetAvailability(player.id, checked ? 'in' : 'out');
    };

    return (
        <div className="flex items-center justify-center space-x-2">
             <Label htmlFor={`availability-${player.id}`} className={cn("text-xs font-semibold", !isPlayerIn && "text-muted-foreground/80")}>OUT</Label>
             <Switch
                id={`availability-${player.id}`}
                checked={isPlayerIn}
                onCheckedChange={handleSwitchChange}
                className="data-[state=checked]:bg-green-500"
             />
             <Label htmlFor={`availability-${player.id}`} className={cn("text-xs font-semibold", isPlayerIn && "text-primary")}>IN</Label>
        </div>
    );
};

const ManualDraftControls = ({ player, onAssignPlayer }: { player: Player, onAssignPlayer: (id: string, team: 'teamA' | 'teamB' | null) => void }) => (
    <div className="flex justify-center items-center gap-2">
        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10 hover:text-blue-400" onClick={() => onAssignPlayer(player.id, 'teamA')}>A</Button>
        <Button size="sm" variant="outline" className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-400" onClick={() => onAssignPlayer(player.id, 'teamB')}>B</Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onAssignPlayer(player.id, null)}><X className="h-4 w-4" /></Button>
    </div>
);

const StatusBadge = ({ player }: { player: Player }) => {
    if (player.isGuest) {
      if (player.status === 'waiting') {
        return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="w-3 h-3 mr-1"/>WAITING</Badge>;
      }
      return <Badge variant="secondary">GUEST</Badge>;
    }
    switch (player.status) {
        case 'in': return <Badge variant="default" className="bg-green-500 hover:bg-green-500">IN</Badge>;
        case 'out': return <Badge variant="destructive">OUT</Badge>;
        case 'undecided': return <Badge variant="secondary">UNDECIDED</Badge>;
        case 'waiting': return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="w-3 h-3 mr-1"/>WAITING</Badge>;
        default: return null;
    }
};

export function PlayerLeaderboard({ players, onSetAvailability, gamePhase, onAssignPlayer }: PlayerLeaderboardProps) {
  const showAvailabilityControls = gamePhase === 'availability' && onSetAvailability;
  const showManualDraftControls = gamePhase === 'manual-draft' && onAssignPlayer;

  return (
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead className="text-center w-[120px] md:w-[150px]">
                {showManualDraftControls ? 'Assign Team' : 'Status'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                        No players in this category.
                    </TableCell>
                </TableRow>
            )}
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="p-2 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={player.photoURL} alt={player.name} />
                       <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm md:text-base">{player.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono font-bold text-primary p-2 md:p-4">
                  {player.isGuest ? '-' : player.points}
                </TableCell>
                <TableCell className="text-center p-2 md:p-4">
                    {showAvailabilityControls && <AvailabilityControls player={player} onSetAvailability={onSetAvailability} />}
                    {showManualDraftControls && <ManualDraftControls player={player} onAssignPlayer={onAssignPlayer} />}
                    {!showAvailabilityControls && !showManualDraftControls && <StatusBadge player={player} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  );
}
