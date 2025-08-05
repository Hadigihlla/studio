"use client";

import { useState, useMemo } from "react";
import type { Player, PlayerStatus, Team } from "@/types";
import { initialPlayers } from "@/lib/initial-players";
import { Header } from "@/components/game/Header";
import { UpcomingGame } from "@/components/game/UpcomingGame";
import { PlayerLeaderboard } from "@/components/game/PlayerLeaderboard";
import { GameControls } from "@/components/game/GameControls";
import { TeamDisplay } from "@/components/game/TeamDisplay";
import { Confetti } from "@/components/game/Confetti";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function Home() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [teams, setTeams] = useState<Team | null>(null);
  const [gamePhase, setGamePhase] = useState<"availability" | "teams" | "results">("availability");
  const [winner, setWinner] = useState<"A" | "B" | "Draw" | null>(null);
  const { toast } = useToast();

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.points - a.points);
  }, [players]);

  const playersIn = useMemo(() => {
    return players.filter((p) => p.status === "in");
  }, [players]);

  const handleSetAvailability = (playerId: number, status: PlayerStatus) => {
    if (gamePhase !== 'availability') {
      toast({
        variant: "destructive",
        title: "Action Locked",
        description: "Cannot change availability after teams are drafted.",
      });
      return;
    }
    setPlayers((prevPlayers) =>
      prevPlayers.map((p) => (p.id === playerId ? { ...p, status } : p))
    );
  };

  const handleDraftTeams = () => {
    const rankedPlayersIn = playersIn.sort((a, b) => b.points - a.points);
    if (rankedPlayersIn.length < 2) {
      toast({
        variant: "destructive",
        title: "Not Enough Players",
        description: "Need at least 2 players to draft teams.",
      });
      return;
    }

    const teamA: Player[] = [];
    const teamB: Player[] = [];

    rankedPlayersIn.forEach((player, index) => {
      if (index % 2 === 0) {
        teamA.push(player);
      } else {
        teamB.push(player);
      }
    });

    setTeams({ teamA, teamB });
    setGamePhase("teams");
    toast({
      title: "Teams Drafted!",
      description: "Team A and Team B have been selected.",
    });
  };

  const updatePlayerPoints = (
    playerList: Player[],
    team: Player[],
    points: number
  ) => {
    const teamIds = new Set(team.map((p) => p.id));
    return playerList.map((p) =>
      teamIds.has(p.id) ? { ...p, points: p.points + points } : p
    );
  };

  const handleRecordResult = (result: "A" | "B" | "Draw") => {
    if (!teams) return;

    let updatedPlayers = [...players];
    let toastMessage = "";

    if (result === "A") {
      updatedPlayers = updatePlayerPoints(updatedPlayers, teams.teamA, 3);
      toastMessage = "Team A wins! +3 points for each player.";
      setWinner("A");
    } else if (result === "B") {
      updatedPlayers = updatePlayerPoints(updatedPlayers, teams.teamB, 3);
      toastMessage = "Team B wins! +3 points for each player.";
      setWinner("B");
    } else {
      updatedPlayers = updatePlayerPoints(updatedPlayers, teams.teamA, 2);
      updatedPlayers = updatePlayerPoints(updatedPlayers, teams.teamB, 2);
      toastMessage = "It's a draw! +2 points for all players.";
      setWinner("Draw");
    }

    setPlayers(updatedPlayers);
    setGamePhase("results");
    toast({
      title: "Game Over!",
      description: toastMessage,
    });
  };

  const handlePenalty = (playerId: number, penalty: "late" | "noshow") => {
    const pointsToDeduct = penalty === 'late' ? 3 : 2;
    setPlayers(prevPlayers => prevPlayers.map(p => 
      p.id === playerId ? {...p, points: p.points - pointsToDeduct} : p
    ));
    const playerName = players.find(p => p.id === playerId)?.name;
    toast({
        variant: "destructive",
        title: "Penalty Applied",
        description: `${playerName} has been deducted ${pointsToDeduct} points for being a ${penalty === 'late' ? 'late arrival' : 'no-show'}.`,
    });
  };
  
  const handleResetGame = () => {
    setTeams(null);
    setGamePhase("availability");
    setWinner(null);
    setPlayers(prev => prev.map(p => ({...p, status: 'undecided'})));
    toast({
        title: "New Game Started",
        description: "Player availability has been reset. Good luck!",
    });
  };

  return (
    <main className="container mx-auto p-4 md:p-8 relative">
      {winner && <Confetti />}
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <PlayerLeaderboard
            players={sortedPlayers}
            onSetAvailability={handleSetAvailability}
            isLocked={gamePhase !== 'availability'}
          />
        </div>
        
        <div className="space-y-6">
          <UpcomingGame />
          <GameControls 
            onDraftTeams={handleDraftTeams}
            onRecordResult={handleRecordResult}
            onResetGame={handleResetGame}
            gamePhase={gamePhase}
            playersInCount={playersIn.length}
          />

          {gamePhase !== 'availability' && teams && (
            <TeamDisplay teams={teams} onApplyPenalty={handlePenalty} winner={winner} />
          )}

          {gamePhase === 'results' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award className="text-primary"/>Game Result</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {winner === 'Draw' && 'The match was a draw.'}
                  {winner === 'A' && 'Team A is the winner!'}
                  {winner === 'B' && 'Team B is the winner!'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
