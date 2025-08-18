
"use client";

import type { Match, MatchPlayer, Penalty, Settings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { format } from "date-fns";
import { Calendar, Shield, Trophy, Clock, UserX, Trash, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MatchHistoryProps {
  matches: Match[];
  onDeleteMatch: (matchId: string) => void;
  onDownloadMatch: (match: Match) => void;
  settings: Settings;
}

const PlayerListItem = ({ 
    player,
    team,
    match,
    settings 
}: { 
    player: MatchPlayer, 
    team: 'A' | 'B',
    match: Match,
    settings: Settings 
}) => {
    if (!player) return null;
    const penalty = match.penalties?.[player.id];
    let pointsChange = 0;

    // Don't calculate for guests
    if(!player.isGuest) {
        const wasNoShow = penalty === 'no-show';
        
        // Points from result
        let resultPoints = 0;
        const playerResult = match.result === 'Draw' ? 'D' : (match.result === team ? 'W' : 'L');
        if (playerResult === 'W') resultPoints = 3;
        else if (playerResult === 'D') resultPoints = 2;
        
        // No-show players don't get points for Win or Draw
        if (!(wasNoShow && (playerResult === 'W' || playerResult === 'D'))) {
            pointsChange += resultPoints;
        }
        
        // Points from penalties
        if (penalty === 'late') pointsChange -= settings.latePenalty;
        if (penalty === 'no-show') pointsChange -= settings.noShowPenalty;

        // Points from bonus
        const teamANoShows = match.teams.teamA.filter(p => match.penalties?.[p.id] === 'no-show').length;
        const teamBNoShows = match.teams.teamB.filter(p => match.penalties?.[p.id] === 'no-show').length;
        if (team === 'A' && teamBNoShows > teamANoShows) pointsChange += settings.bonusPoint;
        if (team === 'B' && teamANoShows > teamBNoShows) pointsChange += settings.bonusPoint;
    }

    const pointsStr = pointsChange > 0 ? `+${pointsChange}` : `${pointsChange}`;

    return (
        <li className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={player.photoURL} alt={player.name} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {player.name}
                {player.isGuest && <span className="text-xs text-muted-foreground">(Guest)</span>}
            </div>
             <div className="flex items-center gap-2">
                {penalty === 'late' && <Clock className="w-4 h-4 text-orange-400" />}
                {penalty === 'no-show' && <UserX className="w-4 h-4 text-red-500" />}
                {!player.isGuest && (
                    <span className={cn(
                        "text-xs font-mono font-semibold",
                        pointsChange > 0 && "text-green-500",
                        pointsChange < 0 && "text-red-500"
                    )}>
                        ({pointsStr} Pts)
                    </span>
                )}
            </div>
        </li>
    );
};

export function MatchHistory({ matches, onDeleteMatch, onDownloadMatch, settings }: MatchHistoryProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Calendar className="text-primary" />
          Match History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <p className="text-muted-foreground text-center">No matches played yet.</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {matches.map((match) => (
              <AccordionItem value={`item-${match.id}`} key={match.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full pr-4">
                    <div className="flex items-center gap-2">
                      <Trophy className={`w-5 h-5 ${
                          match.result === 'A' ? 'text-blue-400' :
                          match.result === 'B' ? 'text-red-400' :
                          'text-yellow-400'
                      }`} />
                      <span className="font-semibold">
                        {match.result === 'Draw' 
                            ? `Draw (${match.scoreA} - ${match.scoreB})` 
                            : `Team ${match.result} Won (${match.scoreA} - ${match.scoreB})`
                        }
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(match.date), "MMMM d, yyyy")}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2 text-blue-400"><Shield/>Team A</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {match.teams.teamA.map(p => <PlayerListItem key={p.id} player={p} team='A' match={match} settings={settings} />)}
                            </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2 text-red-400"><Shield/>Team B</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {match.teams.teamB.map(p => <PlayerListItem key={p.id} player={p} team='B' match={match} settings={settings} />)}
                            </ul>
                            </div>
                        </div>
                        <div className="flex justify-end items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => onDownloadMatch(match)}>
                                <Download className="mr-2" /> Download
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash className="mr-2" /> Delete Match
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this match record and revert all player stats associated with it.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteMatch(match.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
