"use client";

import type { Match, Player } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar, Shield, Users, Trophy, Clock, UserX, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchHistoryProps {
  matches: Match[];
  players: Player[];
  onDeleteMatch: (matchId: string) => void;
}

const PlayerListItem = ({ player, penalty }: { player: Player | undefined, penalty: 'late' | 'no-show' | undefined }) => {
    if (!player) return null;
    return (
        <li className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {player.name}
            </div>
            {penalty === 'late' && <Clock className="w-4 h-4 text-orange-400" />}
            {penalty === 'no-show' && <UserX className="w-4 h-4 text-red-500" />}
        </li>
    );
};

export function MatchHistory({ matches, players, onDeleteMatch }: MatchHistoryProps) {
  const getPlayerById = (id: string) => players.find(p => p.id === id);

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
                                {match.teams.teamA.map(p => <PlayerListItem key={p.id} player={getPlayerById(p.id)} penalty={match.penalties?.[p.id]} />)}
                            </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2 text-red-400"><Shield/>Team B</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {match.teams.teamB.map(p => <PlayerListItem key={p.id} player={getPlayerById(p.id)} penalty={match.penalties?.[p.id]} />)}
                            </ul>
                            </div>
                        </div>
                        <div className="flex justify-end">
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
