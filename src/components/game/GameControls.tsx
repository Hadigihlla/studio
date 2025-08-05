"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Swords, Trophy, RefreshCw } from "lucide-react";

interface GameControlsProps {
  onDraftTeams: () => void;
  onRecordResult: (result: "A" | "B" | "Draw") => void;
  onResetGame: () => void;
  gamePhase: "availability" | "teams" | "results";
  playersInCount: number;
}

export function GameControls({
  onDraftTeams,
  onRecordResult,
  onResetGame,
  gamePhase,
  playersInCount,
}: GameControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Swords className="text-primary" />
          Game Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gamePhase === "availability" && (
          <Button
            onClick={onDraftTeams}
            className="w-full"
            disabled={playersInCount < 2}
          >
            <Users className="mr-2 h-4 w-4" />
            Draft Teams ({playersInCount} In)
          </Button>
        )}

        {gamePhase === "teams" && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-center text-muted-foreground mb-2">
              Who Won?
            </h3>
            <Button
              onClick={() => onRecordResult("A")}
              className="w-full"
              variant="outline"
            >
              <Trophy className="mr-2 h-4 w-4 text-blue-400" />
              Team A Wins
            </Button>
            <Button
              onClick={() => onRecordResult("B")}
              className="w-full"
              variant="outline"
            >
              <Trophy className="mr-2 h-4 w-4 text-red-400" />
              Team B Wins
            </Button>
            <Button
              onClick={() => onRecordResult("Draw")}
              className="w-full"
              variant="outline"
            >
              Draw
            </Button>
          </div>
        )}

        {gamePhase === "results" && (
          <Button onClick={onResetGame} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Start New Game
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
