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
import { Clock, Check, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface PlayerLeaderboardProps {
  players: Player[];
  onSetAvailability: (playerId: string, status: PlayerStatus) => void;
  isLocked: boolean;
}

export function PlayerLeaderboard({ players, onSetAvailability, isLocked }: PlayerLeaderboardProps) {

  return (
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead className="text-center">Availability</TableHead>
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
                    {!isLocked ? (
                        <div className="flex justify-center items-center bg-muted p-1 rounded-full">
                           <Button
                                size="sm"
                                variant={player.status === 'in' || player.status === 'waiting' ? 'default' : 'ghost'}
                                className={cn(
                                    "rounded-full flex-1 w-20 h-7 text-xs font-bold",
                                    player.status === 'in' || player.status === 'waiting'
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                                        : 'text-muted-foreground'
                                )}
                                onClick={() => onSetAvailability(player.id, "in")}
                            >
                                <Check className="mr-1 h-3 w-3"/> IN
                            </Button>
                             <Button
                                size="sm"
                                variant={player.status === 'out' ? 'default' : 'ghost'}
                                className={cn(
                                    "rounded-full flex-1 w-20 h-7 text-xs font-bold",
                                    player.status === 'out'
                                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                                        : 'text-muted-foreground'
                                )}
                                onClick={() => onSetAvailability(player.id, "out")}
                            >
                                <X className="mr-1 h-3 w-3"/> OUT
                            </Button>
                        </div>
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
