
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users, Swords, Trophy, RefreshCw } from "lucide-react";
import { ScoreInput } from "./ScoreInput";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface GameControlsProps {
  onDraftTeams: (method: 'points' | 'manual') => void;
  onRecordResult: () => void;
  onResetGame: () => void;
  gamePhase: "availability" | "teams" | "results" | "manual-draft";
  playersInCount: number;
  unassignedCount: number; // For manual draft
  scores: { teamA: number; teamB: number };
  setScores: (scores: { teamA: number; teamB: number }) => void;
}

export function GameControls({
  onDraftTeams,
  onRecordResult,
  onResetGame,
  gamePhase,
  playersInCount,
  unassignedCount,
  scores,
  setScores,
}: GameControlsProps) {
  const handleScoreChange = (team: 'teamA' | 'teamB', value: number) => {
    setScores({ ...scores, [team]: Math.max(0, value) });
  };

  const isDraftingLocked = playersInCount < 2 || gamePhase !== 'availability';
  const isConfirmDraftLocked = gamePhase === 'manual-draft' && unassignedCount > 0;

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full" disabled={isDraftingLocked}>
                  <Users className="mr-2 h-4 w-4" />
                  Draft Teams ({playersInCount} In)
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuItem onClick={() => onDraftTeams('points')} disabled={isDraftingLocked}>Draft by Points</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDraftTeams('manual')} disabled={isDraftingLocked}>Draft Manually</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        )}

        {gamePhase === "manual-draft" && (
          <div className="space-y-4">
              <Button onClick={onResetGame} className="w-full" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Cancel Draft
              </Button>
          </div>
        )}

        {gamePhase === "teams" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamA-score" className="text-blue-400 font-semibold">Team A Score</Label>
                <ScoreInput
                  value={scores.teamA}
                  onChange={(value) => handleScoreChange('teamA', value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamB-score" className="text-red-400 font-semibold">Team B Score</Label>
                <ScoreInput
                  value={scores.teamB}
                  onChange={(value) => handleScoreChange('teamB', value)}
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
          <div className="space-y-2">
            <Button onClick={onResetGame} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Start New Game
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
