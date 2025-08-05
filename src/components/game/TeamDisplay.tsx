"use client";

import type { Player, Team, Result } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamDisplayProps {
  teams: Team;
  winner: Result | null;
}

const TeamCard = ({
  team,
  title,
  titleColor,
  isWinner,
}: {
  team: Player[];
  title: string;
  titleColor: string;
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
          <div className="font-mono text-sm text-muted-foreground">
            {player.points} pts
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export function TeamDisplay({ teams, winner }: TeamDisplayProps) {
  return (
    <div className="space-y-6">
      <TeamCard
        team={teams.teamA}
        title="Team A"
        titleColor="text-blue-400"
        isWinner={winner === "A" || winner === "Draw"}
      />
      <TeamCard
        team={teams.teamB}
        title="Team B"
        titleColor="text-red-400"
        isWinner={winner === "B" || winner === "Draw"}
      />
    </div>
  );
}
