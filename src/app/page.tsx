"use client";

import { useState, useMemo, useEffect } from "react";
import type { Player, PlayerStatus, Team, Match, Result } from "@/types";
import { initialPlayers } from "@/lib/initial-players";
import { Header } from "@/components/game/Header";
import { UpcomingGame } from "@/components/game/UpcomingGame";
import { PlayerLeaderboard } from "@/components/game/PlayerLeaderboard";
import { GameControls } from "@/components/game/GameControls";
import { TeamDisplay } from "@/components/game/TeamDisplay";
import { Confetti } from "@/components/game/Confetti";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Plus, Users, Clock } from "lucide-react";
import { MatchHistory } from "@/components/game/MatchHistory";
import { PlayerDialog } from "@/components/game/PlayerDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const MAX_PLAYERS_IN = 14;

export default function Home() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [teams, setTeams] = useState<Team | null>(null);
  const [gamePhase, setGamePhase] = useState<"availability" | "teams" | "results">("availability");
  const [winner, setWinner] = useState<Result | null>(null);
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [lastToastInfo, setLastToastInfo] = useState<{ title: string, description: string } | null>(null);

  const { toast } = useToast();
  
  useEffect(() => {
    if(lastToastInfo) {
      toast(lastToastInfo);
      setLastToastInfo(null); // Reset after showing
    }
  }, [lastToastInfo, toast]);

  const sortedPlayers = useMemo(() => {
    // Sort by points for all lists
    return [...players].sort((a, b) => b.points - a.points);
  }, [players]);

  const playersIn = useMemo(() => sortedPlayers.filter(p => p.status === 'in'), [sortedPlayers]);
  const playersWaiting = useMemo(() => sortedPlayers.filter(p => p.status === 'waiting'), [sortedPlayers]);
  const otherPlayers = useMemo(() => sortedPlayers.filter(p => p.status !== 'in' && p.status !== 'waiting'), [sortedPlayers]);

  const handleOpenPlayerDialog = (player: Player | null) => {
    setEditingPlayer(player);
    setIsPlayerDialogOpen(true);
  };

  const handleSavePlayer = (playerData: Omit<Player, 'id' | 'status' | 'matchesPlayed' | 'wins' | 'draws' | 'losses' | 'form'> & { id?: number }) => {
    let toastInfo: { title: string, description: string };
    if (playerData.id) { // Editing existing player
      const updatedPlayer = players.find(p => p.id === playerData.id);
      if (updatedPlayer) {
          setPlayers(prev => prev.map(p => p.id === playerData.id ? { ...p, name: playerData.name, points: playerData.points } : p));
          toastInfo = { title: "Player Updated", description: `${playerData.name}'s details have been saved.` };
      } else {
        return; // Should not happen
      }
    } else { // Adding new player
      const newPlayer: Player = {
        id: Date.now(),
        name: playerData.name,
        points: playerData.points,
        status: 'undecided',
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        form: [],
      };
      setPlayers(prev => [...prev, newPlayer]);
      toastInfo = { title: "Player Added", description: `${newPlayer.name} has joined the roster.` };
    }
    setLastToastInfo(toastInfo);
    setIsPlayerDialogOpen(false);
  };

  const handleDeletePlayer = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    if(player) {
      setLastToastInfo({ variant: 'destructive', title: "Player Removed", description: `${player.name} has been removed.` });
    }
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };


  const handleSetAvailability = (playerId: number, newStatus: PlayerStatus) => {
    if (gamePhase !== 'availability') {
        setLastToastInfo({
            variant: "destructive",
            title: "Action Locked",
            description: "Cannot change availability after teams are drafted.",
        });
        return;
    }

    setPlayers(currentPlayers => {
        const playersInCount = currentPlayers.filter(p => p.status === 'in').length;
        const targetPlayer = currentPlayers.find(p => p.id === playerId);
        if (!targetPlayer) return currentPlayers;

        let newPlayers = [...currentPlayers];
        let primaryToast: { title: string, description: string } | null = null;
        let secondaryToast: { title: string, description: string } | null = null;

        // Player wants to be IN
        if (newStatus === 'in') {
            if (playersInCount < MAX_PLAYERS_IN) {
                newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, status: 'in' } : p);
                primaryToast = { title: "You're In!", description: `${targetPlayer.name} is confirmed for the game.` };
            } else {
                newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, status: 'waiting' } : p);
                primaryToast = { title: "Waiting List", description: `The game is full. ${targetPlayer.name} has been added to the waiting list.` };
            }
        } 
        // Player wants to be OUT
        else if (newStatus === 'out' || newStatus === 'undecided') {
            const wasPlayerIn = targetPlayer.status === 'in';
            newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, status: newStatus } : p);
            
            if (wasPlayerIn) {
                const waitingList = newPlayers.filter(p => p.status === 'waiting').sort((a,b) => b.points - a.points);
                if (waitingList.length > 0) {
                    const nextPlayerInId = waitingList[0].id;
                    newPlayers = newPlayers.map(p => p.id === nextPlayerInId ? { ...p, status: 'in' } : p);
                    const promotedPlayer = newPlayers.find(p => p.id === nextPlayerInId);
                    if(promotedPlayer) {
                      secondaryToast = { title: "Player Promoted", description: `${promotedPlayer.name} has been moved from the waiting list to 'in'.`};
                    }
                }
            }
        } else {
             // For 'undecided' or other statuses
             newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, status: newStatus } : p);
        }
        
        if (primaryToast) {
            setLastToastInfo(primaryToast);
        }
        if (secondaryToast) {
            // This is a simplification; handling multiple toasts would require a queue.
            // For now, secondary toast will overwrite primary if it exists.
             setLastToastInfo(secondaryToast);
        }


        return newPlayers;
    });
};

  const handleDraftTeams = () => {
    const rankedPlayersIn = playersIn.sort((a, b) => b.points - a.points);
    if (rankedPlayersIn.length < 2) {
      setLastToastInfo({
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
    setLastToastInfo({
      title: "Teams Drafted!",
      description: "Team A and Team B have been selected.",
    });
  };

  const updatePlayerStats = (
    playersToUpdate: Player[],
    result: 'W' | 'D' | 'L'
  ) => {
    const playerIds = new Set(playersToUpdate.map(p => p.id));
    setPlayers(prev => prev.map(p => {
      if (playerIds.has(p.id)) {
        return {
          ...p,
          points: p.points + (result === 'W' ? 3 : result === 'D' ? 2 : 0),
          matchesPlayed: p.matchesPlayed + 1,
          wins: p.wins + (result === 'W' ? 1 : 0),
          draws: p.draws + (result === 'D' ? 1 : 0),
          losses: p.losses + (result === 'L' ? 1 : 0),
          form: [result, ...p.form].slice(0, 5),
        }
      }
      return p;
    }));
  };

  const handleRecordResult = (result: Result) => {
    if (!teams) return;

    let toastMessage = "";
    
    if (result === "A") {
      updatePlayerStats(teams.teamA, 'W');
      updatePlayerStats(teams.teamB, 'L');
      toastMessage = "Team A wins! +3 points for each player.";
    } else if (result === "B") {
      updatePlayerStats(teams.teamB, 'W');
      updatePlayerStats(teams.teamA, 'L');
      toastMessage = "Team B wins! +3 points for each player.";
    } else {
      updatePlayerStats([...teams.teamA, ...teams.teamB], 'D');
      toastMessage = "It's a draw! +2 points for all players.";
    }

    const newMatch: Match = {
      id: Date.now(),
      date: new Date().toISOString(),
      teams: teams,
      result: result,
    };
    setMatchHistory(prev => [newMatch, ...prev]);
    
    setGamePhase("results");
    setWinner(result);
    setLastToastInfo({
      title: "Game Over!",
      description: toastMessage,
    });
  };
  
  const handleResetGame = () => {
    setTeams(null);
    setGamePhase("availability");
    setWinner(null);
    setPlayers(prev => prev.map(p => ({...p, status: 'undecided'})));
    setLastToastInfo({
        title: "New Game Started",
        description: "Player availability has been reset. Good luck!",
    });
  };

  return (
    <>
      <main className="container mx-auto p-4 md:p-8 relative">
        {winner && <Confetti />}
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-headline">
                      Player Roster
                  </CardTitle>
                  <Button onClick={() => handleOpenPlayerDialog(null)} size="sm">
                      <Plus className="mr-2" /> Add Player
                  </Button>
              </CardHeader>
              <CardContent>
                  <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-green-500">
                                <Users /> Confirmed Players ({playersIn.length}/{MAX_PLAYERS_IN})
                            </h3>
                            <PlayerLeaderboard
                                players={playersIn}
                                onSetAvailability={handleSetAvailability}
                                isLocked={gamePhase !== 'availability'}
                                onEditPlayer={handleOpenPlayerDialog}
                                onDeletePlayer={handleDeletePlayer}
                                rankOffset={0}
                            />
                        </div>

                        {playersWaiting.length > 0 && (
                            <div>
                                <Separator className="my-4"/>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-amber-500">
                                    <Clock /> Waiting List ({playersWaiting.length})
                                </h3>
                                <PlayerLeaderboard
                                    players={playersWaiting}
                                    onSetAvailability={handleSetAvailability}
                                    isLocked={gamePhase !== 'availability'}
                                    onEditPlayer={handleOpenPlayerDialog}
                                    onDeletePlayer={handleDeletePlayer}
                                    rankOffset={playersIn.length}
                                />
                            </div>
                        )}
                        
                        {otherPlayers.length > 0 && (
                            <div>
                                <Separator className="my-4"/>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-muted-foreground">
                                    Other Players
                                </h3>
                                <PlayerLeaderboard
                                    players={otherPlayers}
                                    onSetAvailability={handleSetAvailability}
                                    isLocked={gamePhase !== 'availability'}
                                    onEditPlayer={handleOpenPlayerDialog}
                                    onDeletePlayer={handleDeletePlayer}
                                    rankOffset={playersIn.length + playersWaiting.length}
                                    hideRank={true}
                                />
                            </div>
                        )}
                  </div>
              </CardContent>
            </Card>
            <MatchHistory matches={matchHistory} />
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
              <TeamDisplay teams={teams} winner={winner} />
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
      <PlayerDialog
        isOpen={isPlayerDialogOpen}
        onOpenChange={setIsPlayerDialogOpen}
        onSave={handleSavePlayer}
        player={editingPlayer}
      />
    </>
  );
}
