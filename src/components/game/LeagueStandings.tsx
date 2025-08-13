
"use client";

import { useRef } from "react";
import type { Player } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Star, Edit, Trash, MoreVertical, Plus, Trophy, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "../ui/card";
import { cn } from "@/lib/utils";

interface LeagueStandingsProps {
  players: Player[];
  onEditPlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
  onAddPlayer: () => void;
}

export function LeagueStandings({ players, onEditPlayer, onDeletePlayer, onAddPlayer }: LeagueStandingsProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const getRankContent = (rank: number) => {
    const rankNumber = <span className="font-mono text-sm">{rank}</span>;
    let rankIcon = null;

    if (rank === 1) rankIcon = <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />;
    else if (rank === 2) rankIcon = <Star className="w-5 h-5 text-slate-300 fill-slate-300" />;
    else if (rank === 3) rankIcon = <Star className="w-5 h-5 text-amber-600 fill-amber-600" />;
    
    return (
        <div className="flex items-center justify-center gap-1 w-8">
            {rankNumber}
            {rankIcon}
        </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Card className="no-print">
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-headline">
                  <Trophy className="text-primary"/>
                  League Standings
              </CardTitle>
              <Button onClick={onAddPlayer} size="sm">
                  <Plus className="mr-2" /> Add Player
              </Button>
          </CardHeader>
          <CardContent>
              <div className="w-full overflow-auto">
                  <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[50px] text-center">Rank</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-center">MP</TableHead>
                        <TableHead className="text-center">W</TableHead>
                        <TableHead className="text-center">D</TableHead>
                        <TableHead className="text-center">L</TableHead>
                        <TableHead className="text-center">Points</TableHead>
                        <TableHead className="w-[50px] text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground h-24">
                                    No players yet. Add one to get started!
                                </TableCell>
                            </TableRow>
                        )}
                        {players.map((player, index) => (
                        <TableRow key={player.id}>
                            <TableCell className="font-medium text-center">
                            <div className="flex justify-center items-center h-full">
                                {getRankContent(index + 1)}
                            </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-semibold">{player.name}</div>
                            </TableCell>
                            <TableCell className="text-center font-mono">{player.matchesPlayed}</TableCell>
                            <TableCell className="text-center font-mono">{player.wins}</TableCell>
                            <TableCell className="text-center font-mono">{player.draws}</TableCell>
                            <TableCell className="text-center font-mono">{player.losses}</TableCell>
                            <TableCell className="text-center font-mono font-bold text-primary">
                                {player.points}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEditPlayer(player)}>
                                        <Edit className="mr-2" /> Edit Player
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                <Trash className="mr-2" /> Delete Player
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete {player.name} and all their data.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDeletePlayer(player.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                  </Table>
              </div>
          </CardContent>
          <CardFooter className="flex justify-end">
                <Button onClick={handlePrint} variant="outline" size="sm">
                    <Printer className="mr-2" /> Print Standings
                </Button>
          </CardFooter>
      </Card>

      {/* Printable version */}
      <div className="hidden printable-area" ref={printRef}>
        <Card className="printable-content">
            <CardHeader className="printable-header text-center">
                <CardTitle className="printable-title text-2xl font-headline">Hirafus League</CardTitle>
                <CardDescription className="printable-subtitle">League Standings</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[50px] text-center">Rank</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-center">MP</TableHead>
                        <TableHead className="text-center">W</TableHead>
                        <TableHead className="text-center">D</TableHead>
                        <TableHead className="text-center">L</TableHead>
                        <TableHead className="text-center">Points</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.map((player, index) => (
                        <TableRow 
                            key={`print-${player.id}`}
                            className={cn(index < 7 && 'printable-top-7')}
                        >
                            <TableCell className="font-medium text-center">
                            <div className="flex justify-center items-center h-full">
                                {getRankContent(index + 1)}
                            </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-semibold">{player.name}</div>
                            </TableCell>
                            <TableCell className="text-center font-mono">{player.matchesPlayed}</TableCell>
                            <TableCell className="text-center font-mono">{player.wins}</TableCell>
                            <TableCell className="text-center font-mono">{player.draws}</TableCell>
                            <TableCell className="text-center font-mono">{player.losses}</TableCell>
                            <TableCell className="text-center font-mono font-bold">
                                {player.points}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                  </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
