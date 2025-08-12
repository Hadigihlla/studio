"use client";

import type { Player, PlayerStatus } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface PlayerLeaderboardProps {
  players: Player[];
  onSetAvailability?: (playerId: string, status: PlayerStatus) => void;
  gamePhase?: "availability" | "teams" | "results" | "manual-draft";
  onAssignPlayer?: (playerId: string, team: 'teamA' | 'teamB' | null) => void;
}

export function PlayerLeaderboard({ 
  players, 
  onSetAvailability, 
  gamePhase,
  onAssignPlayer
}: PlayerLeaderboardProps) {

  const isLocked = gamePhase !== 'availability';
  const showAvailability = gamePhase === 'availability' && onSetAvailability;
  const showManualDraftControls = gamePhase === 'manual-draft' && onAssignPlayer;

  const getAssignTeamButtons = (player: Player) => {
    if (!onAssignPlayer) return null;
    return (
      <div className="flex justify-center items-center gap-2">
        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10 hover:text-blue-400" onClick={() => onAssignPlayer(player.id, 'teamA')}>
            A
        </Button>
        <Button size="sm" variant="outline" className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-400" onClick={() => onAssignPlayer(player.id, 'teamB')}>
            B
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onAssignPlayer(player.id, null)}>
            <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead className="text-center">
                {showManualDraftControls ? 'Assign Team' : 'Availability'}
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
              <TableRow key={player.id} className={player.status === 'in' ? 'bg-primary/5' : ''}>
                <TableCell>
                  <div className="font-semibold">{player.name}</div>
                </TableCell>
                <TableCell className="text-center font-mono font-bold text-primary">
                  {player.points}
                </TableCell>
                <TableCell className="text-center">
                    {showAvailability && !isLocked && onSetAvailability ? (
                        <div className="flex justify-center items-center bg-muted p-1 rounded-full">
                           <Button
                                size="sm"
                                variant={player.status === 'in' || player.status === 'waiting' ? 'default' : 'ghost'}
                                className={cn(
                                    "rounded-full h-8 w-12 font-semibold",
                                    player.status === 'in' || player.status === 'waiting'
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                                        : 'text-muted-foreground'
                                )}
                                onClick={() => onSetAvailability(player.id, "in")}
                            >
                                IN
                            </Button>
                             <Button
                                size="sm"
                                variant={player.status === 'out' ? 'default' : 'ghost'}
                                className={cn(
                                    "rounded-full h-8 w-12 font-semibold",
                                    player.status === 'out'
                                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                                        : 'text-muted-foreground'
                                )}
                                onClick={() => onSetAvailability(player.id, "out")}
                            >
                                OUT
                            </Button>
                        </div>
                    ) : showManualDraftControls ? (
                       getAssignTeamButtons(player)
                    ) : (
                        <div className="flex justify-center items-center gap-2">
                            {player.status === 'in' && <Badge variant="default" className="bg-green-500 hover:bg-green-500">IN</Badge>}
                            {player.status === 'out' && <Badge variant="destructive">OUT</Badge>}
                            {player.status === 'undecided' && <Badge variant="secondary">UNDECIDED</Badge>}
                            {player.status === 'waiting' && <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="w-3 h-3 mr-1"/>WAITING</Badge>}
                        </div>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  );
}
