"use client";

import type { Player, PlayerStatus, Form } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Star, Edit, Trash, MoreVertical } from "lucide-react";
import { Badge } from "../ui/badge";
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
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

interface PlayerLeaderboardProps {
  players: Player[];
  onSetAvailability: (playerId: number, status: PlayerStatus) => void;
  isLocked: boolean;
  onEditPlayer: (player: Player) => void;
  onDeletePlayer: (playerId: number) => void;
}

const FormIndicator = ({ result }: { result: 'W' | 'D' | 'L'}) => {
    const baseClass = "w-3 h-5 rounded-sm";
    const colorClass = result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-yellow-500' : 'bg-red-500';
    const tooltipText = result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss';
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <div className={cn(baseClass, colorClass)} />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export function PlayerLeaderboard({ players, onSetAvailability, isLocked, onEditPlayer, onDeletePlayer }: PlayerLeaderboardProps) {

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />;
    if (rank === 2) return <Star className="w-5 h-5 text-slate-300 fill-slate-300" />;
    if (rank === 3) return <Star className="w-5 h-5 text-amber-600 fill-amber-600" />;
    return <span className="font-mono text-sm">{rank}</span>;
  }

  return (
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Form</TableHead>
              <TableHead className="text-center hidden md:table-cell">W/D/L</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead className="text-center">Availability</TableHead>
              <TableHead className="w-[50px] text-right"></TableHead>
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
                  <div className="text-xs text-muted-foreground md:hidden">
                    {player.wins}/{player.draws}/{player.losses}
                  </div>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                        {player.form.map((res, i) => <FormIndicator key={i} result={res} />)}
                    </div>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  <span className="font-mono text-sm">
                    {player.wins}/{player.draws}/{player.losses}
                  </span>
                </TableCell>
                <TableCell className="text-center font-mono font-bold text-primary">
                  {player.points}
                </TableCell>
                <TableCell className="text-center">
                    {!isLocked ? (
                        <div className="flex justify-center gap-1">
                            <Button
                                size="icon"
                                variant={player.status === 'in' ? 'default' : 'outline'}
                                className="h-8 w-8 bg-green-500 hover:bg-green-600 border-green-500 text-white data-[state=selected]:bg-green-600"
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
                    ) : (
                        <div className="flex justify-center items-center gap-2">
                            {player.status === 'in' && <Badge variant="default" className="bg-green-500 hover:bg-green-500">IN</Badge>}
                            {player.status === 'out' && <Badge variant="destructive">OUT</Badge>}
                            {player.status === 'undecided' && <Badge variant="secondary">UNDECIDED</Badge>}
                        </div>
                    )}
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
  );
}
