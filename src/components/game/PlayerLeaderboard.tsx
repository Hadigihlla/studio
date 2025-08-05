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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, ShieldCheck, Star, ThumbsUp } from "lucide-react";
import { Badge } from "../ui/badge";

interface PlayerLeaderboardProps {
  players: Player[];
  onSetAvailability: (playerId: number, status: PlayerStatus) => void;
  isLocked: boolean;
}

export function PlayerLeaderboard({ players, onSetAvailability, isLocked }: PlayerLeaderboardProps) {

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />;
    if (rank === 2) return <Star className="w-5 h-5 text-slate-300 fill-slate-300" />;
    if (rank === 3) return <Star className="w-5 h-5 text-amber-600 fill-amber-600" />;
    return <span className="font-mono text-sm">{rank}</span>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <ShieldCheck className="text-primary" />
          Player Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Points</TableHead>
                <TableHead className="text-right">Availability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, index) => (
                <TableRow key={player.id} className={player.status === 'in' ? 'bg-primary/5' : ''}>
                  <TableCell className="font-medium text-center">
                    <div className="flex justify-center items-center h-full">
                     {getRankIcon(index + 1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{player.name}</div>
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-primary">
                    {player.points}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                       {player.status === 'in' && <Badge variant="default" className="bg-green-500 hover:bg-green-500"><ThumbsUp className="w-3 h-3 mr-1" />IN</Badge>}
                       {player.status === 'out' && <Badge variant="destructive">OUT</Badge>}
                       {player.status === 'undecided' && <Badge variant="secondary">UNDECIDED</Badge>}
                      
                       {!isLocked && (
                         <div className="flex gap-1">
                            <Button
                                size="icon"
                                variant={player.status === 'in' ? 'default' : 'outline'}
                                className="h-8 w-8 bg-green-500 hover:bg-green-600 border-green-500 text-white"
                                onClick={() => onSetAvailability(player.id, "in")}
                            >
                                <LogIn className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant={player.status === 'out' ? 'destructive' : 'outline'}
                                className="h-8 w-8"
                                onClick={() => onSetAvailability(player.id, "out")}
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                         </div>
                       )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
