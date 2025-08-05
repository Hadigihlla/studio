"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Swords, Trophy, RefreshCw } from "lucide-react";

interface GameControlsProps {
  onDraftTeams: () => void;
  onRecordResult: () => void;
  onResetGame: () => void;
  gamePhase: "availability" | "teams" | "results";
  playersInCount: number;
  scores: { teamA: number; teamB: number };
  setScores: (scores: { teamA: number; teamB: number }) => void;
}

export function GameControls({
  onDraftTeams,
  onRecordResult,
  onResetGame,
  gamePhase,
  playersInCount,
  scores,
  setScores,
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamA-score" className="text-blue-400 font-semibold">Team A Score</Label>
                <Input
                  id="teamA-score"
                  type="number"
                  value={scores.teamA}
                  onChange={(e) => setScores({ ...scores, teamA: parseInt(e.target.value) || 0 })}
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamB-score" className="text-red-400 font-semibold">Team B Score</Label>
                <Input
                  id="teamB-score"
                  type="number"
                  value={scores.teamB}
                  onChange={(e) => setScores({ ...scores, teamB: parseInt(e.target.value) || 0 })}
                  className="text-center"
                />
              </div>
            </div>
            <Button
              onClick={onRecordResult}
              className="w-full"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Record Final Score
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
