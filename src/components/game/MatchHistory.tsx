"use client";

import type { Match, Player } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { Calendar, Shield, Users, Trophy, Clock, UserX } from "lucide-react";

interface MatchHistoryProps {
  matches: Match[];
}

const PlayerListItem = ({ player, penalty }: { player: Player, penalty: 'late' | 'no-show' | undefined }) => (
    <li className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {player.name}
        </div>
        {penalty === 'late' && <Clock className="w-4 h-4 text-orange-400" />}
        {penalty === 'no-show' && <UserX className="w-4 h-4 text-red-500" />}
    </li>
);

export function MatchHistory({ matches }: MatchHistoryProps) {
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2 text-blue-400"><Shield/>Team A</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {match.teams.teamA.map(p => <PlayerListItem key={p.id} player={p} penalty={match.penalties?.[p.id]} />)}
                      </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-red-400"><Shield/>Team B</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {match.teams.teamB.map(p => <PlayerListItem key={p.id} player={p} penalty={match.penalties?.[p.id]} />)}
                      </ul>
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
