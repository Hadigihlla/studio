

"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
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
import { Edit, Trash, MoreVertical, Plus, Trophy, Download, Settings, Upload, FileDown, RefreshCcw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
import { Label } from "../ui/label";

interface LeagueStandingsProps {
  players: Player[];
  leagueName: string;
  onEditPlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
  onAddPlayer: () => void;
  onOpenSettings: () => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetLeague: () => void;
}

export function LeagueStandings({ 
    players, 
    leagueName,
    onEditPlayer, 
    onDeletePlayer, 
    onAddPlayer, 
    onOpenSettings,
    onExportData,
    onImportData,
    onResetLeague
}: LeagueStandingsProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const getRankContent = (rank: number) => {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-6 w-6 rounded-full font-mono text-sm",
          rank <= 7 && "bg-green-500/20 text-green-400 font-bold"
        )}
      >
        {rank}
      </div>
    );
  };

  const handleDownloadStandings = () => {
    if (printRef.current) {
        html2canvas(printRef.current, {
            scale: 2, // Higher scale for better quality
            useCORS: true, 
            backgroundColor: '#020817'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'hirafus-league-standings.jpg';
            link.href = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG format
            link.click();
        });
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };


  return (
    <>
      <Card className="no-print">
          <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Trophy className="text-primary"/>
                    League Standings
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={onAddPlayer} size="sm">
                    <Plus className="mr-2" /> Add Player
                </Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="outline">
                            <Settings className="h-4 w-4" />
                            <span className="sr-only">Settings & Data</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onOpenSettings}>
                            <Settings className="mr-2"/> League Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDownloadStandings}>
                            <Download className="mr-2"/> Download Standings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onExportData}>
                            <FileDown className="mr-2"/> Export Data
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleImportClick}>
                           <Upload className="mr-2"/> Import Data
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                    <RefreshCcw className="mr-2" /> Reset League Data
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Reset Entire League?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all players, matches, and settings, resetting the league to its original state.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onResetLeague} className="bg-destructive hover:bg-destructive/90">Reset League</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
                 <input
                    type="file"
                    ref={importInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={onImportData}
                />
              </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
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
                        <TableHead className="text-center">Late</TableHead>
                        <TableHead className="text-center">No Show</TableHead>
                        <TableHead className="text-center">Points</TableHead>
                        <TableHead className="w-[50px] text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-muted-foreground h-24">
                                    No players yet. Add one to get started!
                                </TableCell>
                            </TableRow>
                        )}
                        {players.map((player, index) => (
                        <TableRow 
                            key={player.id}
                            className={cn(index < 7 && "bg-green-500/10 hover:bg-green-500/20")}
                        >
                            <TableCell className="font-medium text-center">
                            <div className="flex justify-center items-center h-full">
                                {getRankContent(index + 1)}
                            </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={player.photoURL} alt={player.name} />
                                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-semibold">{player.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center font-mono">{player.matchesPlayed}</TableCell>
                            <TableCell className="text-center font-mono">{player.wins}</TableCell>
                            <TableCell className="text-center font-mono">{player.draws}</TableCell>
                            <TableCell className="text-center font-mono">{player.losses}</TableCell>
                            <TableCell className="text-center font-mono text-orange-400">{player.lateCount || 0}</TableCell>
                            <TableCell className="text-center font-mono text-red-500">{player.noShowCount || 0}</TableCell>
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
      </Card>

      {/* Printable version */}
      <div className="printable-area" ref={printRef}>
        <Card className="printable-content">
            <CardHeader className="printable-header text-center">
                <CardTitle className="printable-title text-3xl font-headline">{leagueName}</CardTitle>
                <CardDescription className="printable-subtitle text-lg">League Standings</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[50px] text-center">Rank</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-center">MP</TableHead>
                        <TableHead className="text-center">W</TableHead>
                        <TableHead className="text-center">D</TableHead>
                        <TableHead className="text-center">L</TableHead>
                        <TableHead className="text-center">Late</TableHead>
                        <TableHead className="text-center">No Show</TableHead>
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
                                    <div className={cn(
                                        "flex items-center justify-center h-7 w-7 rounded-full font-mono font-bold",
                                        index < 7 && "bg-green-500/20 text-green-300"
                                      )}>
                                        {index + 1}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={player.photoURL} alt={player.name} />
                                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-semibold text-lg">{player.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center font-mono text-base">{player.matchesPlayed}</TableCell>
                            <TableCell className="text-center font-mono text-base">{player.wins}</TableCell>
                            <TableCell className="text-center font-mono text-base">{player.draws}</TableCell>
                            <TableCell className="text-center font-mono text-base">{player.losses}</TableCell>
                            <TableCell className="text-center font-mono text-base text-orange-400">{player.lateCount || 0}</TableCell>
                            <TableCell className="text-center font-mono text-base text-red-500">{player.noShowCount || 0}</TableCell>
                            <TableCell className="text-center font-mono font-bold text-lg printable-points">
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


    
