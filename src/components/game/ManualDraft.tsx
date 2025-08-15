
"use client";

import type { Player, GuestPlayer, Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerLeaderboard } from "./PlayerLeaderboard";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface ManualDraftProps {
    manualTeams: Team;
    unassignedPlayers: (Player | GuestPlayer)[];
    onAssignPlayer: (playerId: string, team: 'teamA' | 'teamB' | null) => void;
    onConfirmDraft: () => void;
}

export function ManualDraft({
    manualTeams,
    unassignedPlayers,
    onAssignPlayer,
    onConfirmDraft
}: ManualDraftProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Edit /> Manual Draft
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-blue-400">Team A ({manualTeams.teamA.length})</h3>
            {manualTeams.teamA.length > 0 ? (
                <PlayerLeaderboard
                    players={manualTeams.teamA}
                    gamePhase="manual-draft"
                    onAssignPlayer={onAssignPlayer}
                />
            ) : <p className="text-muted-foreground text-center p-4">Assign players to Team A</p>}
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-red-400">Team B ({manualTeams.teamB.length})</h3>
            {manualTeams.teamB.length > 0 ? (
                <PlayerLeaderboard
                    players={manualTeams.teamB}
                    gamePhase="manual-draft"
                    onAssignPlayer={onAssignPlayer}
                />
            ) : <p className="text-muted-foreground text-center p-4">Assign players to Team B</p>}
          </div>
        </div>
        <Separator className="my-6" />
        <div>
          <h3 className="font-semibold text-lg text-muted-foreground mb-2">Unassigned Players ({unassignedPlayers.length})</h3>
           {unassignedPlayers.length > 0 ? (
              <PlayerLeaderboard
                players={unassignedPlayers}
                gamePhase="manual-draft"
                onAssignPlayer={onAssignPlayer}
              />
           ) : <p className="text-muted-foreground text-center p-4">All players have been assigned.</p>}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onConfirmDraft}>Confirm Teams</Button>
        </div>
      </CardContent>
    </Card>
  );
}
