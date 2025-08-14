
"use client";

import type { Player, Team, Result, Penalty, Settings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Trophy, Clock, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface TeamDisplayProps {
  teams: Team;
  winner: Result | null;
  penalties: Record<string, Penalty>;
  onSetPenalty: (playerId: string, penalty: Penalty) => void;
  isLocked: boolean;
  settings: Settings;
}

const PenaltyIcons = ({ 
  playerId, 
  currentPenalty, 
  onSetPenalty,
  isLocked,
  settings
} : {
  playerId: string,
  currentPenalty: Penalty,
  onSetPenalty: (playerId: string, penalty: Penalty) => void,
  isLocked: boolean,
  settings: Settings
}) => {
  if (isLocked) {
    return (
      <div className="flex gap-1 items-center">
        {currentPenalty === 'late' && <Clock className="w-4 h-4 text-orange-400" />}
        {currentPenalty === 'no-show' && <UserX className="w-4 h-4 text-red-500" />}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-6 w-6 text-muted-foreground hover:text-orange-400",
                currentPenalty === 'late' && 'text-orange-400 bg-orange-400/10'
              )}
              onClick={() => onSetPenalty(playerId, 'late')}
            >
              <Clock className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark as Late (-{settings.latePenalty} Pts)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-6 w-6 text-muted-foreground hover:text-red-500",
                currentPenalty === 'no-show' && 'text-red-500 bg-red-500/10'
              )}
              onClick={() => onSetPenalty(playerId, 'no-show')}
            >
              <UserX className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark as No-Show (-{settings.noShowPenalty} Pts)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

const TeamCard = ({
  team,
  title,
  titleColor,
  isWinner,
  isDraw,
  penalties,
  onSetPenalty,
  isLocked,
  settings
}: {
  team: Player[];
  title: string;
  titleColor: string;
  isWinner: boolean;
  isDraw: boolean;
  penalties: Record<string, Penalty>;
  onSetPenalty: (playerId: string, penalty: Penalty) => void;
  isLocked: boolean;
  settings: Settings;
}) => (
  <Card className={cn(
      "transition-all duration-300",
      isWinner && !isDraw && "border-primary ring-2 ring-primary bg-primary/10",
      isDraw && "border-yellow-400/50 ring-2 ring-yellow-400/50 bg-yellow-400/10"
    )}>
    <CardHeader>
      <CardTitle className={cn("flex items-center gap-2 font-headline", titleColor)}>
        <Shield />
        {title}
        {isWinner && !isDraw && <Trophy className="w-6 h-6 text-primary" />}
        {isDraw && <Trophy className="w-6 h-6 text-yellow-400" />}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
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
          <div className="flex items-center gap-2">
            <PenaltyIcons 
              playerId={player.id}
              currentPenalty={penalties[player.id]}
              onSetPenalty={onSetPenalty}
              isLocked={isLocked}
              settings={settings}
            />
            <div className="font-mono text-sm text-muted-foreground w-14 text-right">
              {player.points} pts
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export function TeamDisplay({ teams, winner, penalties, onSetPenalty, isLocked, settings }: TeamDisplayProps) {
  const isDraw = winner === "Draw";
  return (
    <div className="space-y-6">
      <TeamCard
        team={teams.teamA}
        title="Team A"
        titleColor="text-blue-400"
        isWinner={winner === "A"}
        isDraw={isDraw}
        penalties={penalties}
        onSetPenalty={onSetPenalty}
        isLocked={isLocked}
        settings={settings}
      />
      <TeamCard
        team={teams.teamB}
        title="Team B"
        titleColor="text-red-400"
        isWinner={winner === "B"}
        isDraw={isDraw}
        penalties={penalties}
        onSetPenalty={onSetPenalty}
        isLocked={isLocked}
        settings={settings}
      />
    </div>
  );
}
