"use client";

import type { Player, Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, UserX, Shield, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamDisplayProps {
  teams: Team;
  onApplyPenalty: (playerId: number, penalty: "late" | "noshow") => void;
  winner: "A" | "B" | "Draw" | null;
}

const TeamCard = ({
  team,
  title,
  titleColor,
  onApplyPenalty,
  isWinner,
}: {
  team: Player[];
  title: string;
  titleColor: string;
  onApplyPenalty: (playerId: number, penalty: "late" | "noshow") => void;
  isWinner: boolean;
}) => (
  <Card className={cn(isWinner && "border-accent ring-2 ring-accent bg-accent/10", "transition-all duration-300")}>
    <CardHeader>
      <CardTitle className={cn("flex items-center gap-2 font-headline", titleColor)}>
        <Shield />
        {title}
        {isWinner && <Trophy className="w-6 h-6 text-accent" />}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {team.map((player) => (
        <div
          key={player.id}
          className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{player.name}</span>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              onClick={() => onApplyPenalty(player.id, "late")}
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              onClick={() => onApplyPenalty(player.id, "noshow")}
            >
              <UserX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export function TeamDisplay({ teams, onApplyPenalty, winner }: TeamDisplayProps) {
  return (
    <div className="space-y-6">
      <TeamCard
        team={teams.teamA}
        title="Team A"
        titleColor="text-blue-400"
        onApplyPenalty={onApplyPenalty}
        isWinner={winner === "A" || winner === "Draw"}
      />
      <TeamCard
        team={teams.teamB}
        title="Team B"
        titleColor="text-red-400"
        onApplyPenalty={onApplyPenalty}
        isWinner={winner === "B" || winner === "Draw"}
      />
    </div>
  );
}
