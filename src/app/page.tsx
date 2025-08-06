"use client";

import { useState, useMemo, useEffect } from "react";
import type { Player, PlayerStatus, Team, Match, Result, Penalty } from "@/types";
import { Header } from "@/components/game/Header";
import { UpcomingGame } from "@/components/game/UpcomingGame";
import { PlayerLeaderboard } from "@/components/game/PlayerLeaderboard";
import { GameControls } from "@/components/game/GameControls";
import { TeamDisplay } from "@/components/game/TeamDisplay";
import { Confetti } from "@/components/game/Confetti";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Users, Clock } from "lucide-react";
import { MatchHistory } from "@/components/game/MatchHistory";
import { PlayerDialog } from "@/components/game/PlayerDialog";
import { Separator } from "@/components/ui/separator";
import { LeagueStandings } from "@/components/game/LeagueStandings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialPlayers } from "@/lib/initial-players";

const MAX_PLAYERS_IN = 14;

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team | null>(null);
  const [gamePhase, setGamePhase] = useState<"availability" | "teams" | "results">("availability");
  const [winner, setWinner] = useState<Result | null>(null);
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [lastToastInfo, setLastToastInfo] = useState<{ title: string, description: string, variant?: "default" | "destructive" } | null>(null);
  const [penalties, setPenalties] = useState<Record<string, Penalty>>({});
  const [scores, setScores] = useState<{ teamA: number; teamB: number }>({ teamA: 0, teamB: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Load state from localStorage on initial load
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedPlayers = localStorage.getItem("players");
      const savedMatches = localStorage.getItem("matchHistory");

      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      } else {
        // If no players in storage, initialize with sample data
        const playersWithIds = initialPlayers.map((p, index) => ({...p, id: `p${index + 1}`}));
        setPlayers(playersWithIds);
      }
      
      if (savedMatches) {
        setMatchHistory(JSON.parse(savedMatches));
      }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setLastToastInfo({
            variant: 'destructive',
            title: 'Error Loading Data',
            description: 'Could not fetch data. Your saved data might be corrupted.'
        });
    } finally {
        setIsLoading(false);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      if (players.length > 0) {
        localStorage.setItem("players", JSON.stringify(players));
      }
      if (matchHistory.length > 0) {
        localStorage.setItem("matchHistory", JSON.stringify(matchHistory));
      }
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
      setLastToastInfo({
        variant: 'destructive',
        title: 'Error Saving Data',
        description: 'Could not save your changes.'
      });
    }
  }, [players, matchHistory]);


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
  const playersWaiting = useMemo(() => {
    // Sort waiting list by timestamp, oldest first
    return sortedPlayers
        .filter(p => p.status === 'waiting')
        .sort((a, b) => (a.waitingTimestamp || 0) - (b.waitingTimestamp || 0));
    }, [sortedPlayers]);
  const otherPlayers = useMemo(() => sortedPlayers.filter(p => p.status !== 'in' && p.status !== 'waiting'), [sortedPlayers]);

  const handleOpenPlayerDialog = (player: Player | null) => {
    setEditingPlayer(player);
    setIsPlayerDialogOpen(true);
  };

  const handleSavePlayer = (playerData: Omit<Player, 'id' | 'status' | 'matchesPlayed' | 'wins' | 'draws' | 'losses' | 'form' | 'waitingTimestamp'> & { id?: string }) => {
    let toastInfo: { title: string, description: string };
    try {
      if (playerData.id) { // Editing existing player
        setPlayers(prev => prev.map(p => p.id === playerData.id ? { ...p, name: playerData.name, points: playerData.points } : p));
        toastInfo = { title: "Player Updated", description: `${playerData.name}'s details have been saved.` };
      } else { // Adding new player
        const newPlayer: Player = {
          id: `p${Date.now()}`, // Simple unique ID
          name: playerData.name,
          points: playerData.points,
          status: 'undecided',
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          form: [],
          waitingTimestamp: null,
        };
        setPlayers(prev => [...prev, newPlayer]);
        toastInfo = { title: "Player Added", description: `${newPlayer.name} has joined the roster.` };
      }
      setLastToastInfo(toastInfo);
      setIsPlayerDialogOpen(false);
    } catch (error) {
      console.error("Failed to save player:", error);
      setLastToastInfo({
        variant: "destructive",
        title: "Error",
        description: "Could not save player details. Please try again.",
      });
    }
  };

  const handleDeletePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if(player) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      setLastToastInfo({ variant: 'destructive', title: "Player Removed", description: `${player.name} has been removed.` });
    }
  };


  const handleSetAvailability = (playerId: string, newStatus: PlayerStatus) => {
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
        let primaryToast: { title: string, description: string, variant?: "default" | "destructive" } | null = null;
        let secondaryToast: { title: string, description: string, variant?: "default" | "destructive" } | null = null;

        const updatePlayerStatus = (id: string, status: PlayerStatus) => {
            const timestamp = status === 'waiting' ? Date.now() : null;
            return newPlayers.map(p => p.id === id ? { ...p, status, waitingTimestamp: timestamp } : p);
        }

        // Player wants to be IN
        if (newStatus === 'in') {
            if (playersInCount < MAX_PLAYERS_IN) {
                newPlayers = updatePlayerStatus(playerId, 'in');
                primaryToast = { title: "You're In!", description: `${targetPlayer.name} is confirmed for the game.` };
            } else {
                newPlayers = updatePlayerStatus(playerId, 'waiting');
                primaryToast = { title: "Waiting List", description: `The game is full. ${targetPlayer.name} has been added to the waiting list.` };
            }
        } 
        // Player wants to be OUT or UNDECIDED
        else if (newStatus === 'out' || newStatus === 'undecided') {
            const wasPlayerIn = targetPlayer.status === 'in';
            newPlayers = updatePlayerStatus(playerId, newStatus);
            
            if (wasPlayerIn) {
                const waitingList = newPlayers
                    .filter(p => p.status === 'waiting')
                    .sort((a, b) => (a.waitingTimestamp || 0) - (b.waitingTimestamp || 0));

                if (waitingList.length > 0) {
                    const nextPlayerInId = waitingList[0].id;
                    newPlayers = newPlayers.map(p => p.id === nextPlayerInId ? { ...p, status: 'in', waitingTimestamp: null } : p);
                    const promotedPlayer = newPlayers.find(p => p.id === nextPlayerInId);
                    if(promotedPlayer) {
                      secondaryToast = { title: "Player Promoted", description: `${promotedPlayer.name} has been moved from the waiting list to 'in'.`};
                    }
                }
            }
        } else {
             // For 'waiting' status (e.g. from undecided to waiting, though UI doesn't directly support this)
             newPlayers = updatePlayerStatus(playerId, newStatus);
        }
        
        if (primaryToast) {
            setLastToastInfo(primaryToast);
        }
        if (secondaryToast) {
            // This is a simplification; handling multiple toasts would require a queue.
            // For now, secondary toast will overwrite primary if it exists.
             setTimeout(() => setLastToastInfo(secondaryToast), 100);
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
    const eligiblePlayers = result === 'L' 
        ? playersToUpdate
        : playersToUpdate.filter(p => penalties[p.id] !== 'no-show');

    const playerIds = new Set(eligiblePlayers.map(p => p.id));
    
    setPlayers(prev => {
        const updatedPlayers = prev.map(p => {
          if (playerIds.has(p.id)) {
            return {
              ...p,
              points: p.points + (result === 'W' ? 3 : result === 'D' ? 2 : 0),
              matchesPlayed: p.matchesPlayed + 1,
              wins: p.wins + (result === 'W' ? 1 : 0),
              draws: p.draws + (result === 'D' ? 1 : 0),
              losses: p.losses + (result === 'L' ? 1 : 0),
              form: [result, ...p.form].slice(0, 5),
            };
          }
          return p;
        });
        return updatedPlayers;
    });
  };

  const handleRecordResult = () => {
    if (!teams) return;

    let toastMessage = "";
    let result: Result;
    
    // Apply penalties first
    let penaltyToastDescription = "";
    const penaltyDeductions: Record<string, number> = {};
    
    Object.entries(penalties).forEach(([playerId, penalty]) => {
      const player = players.find(p => p.id === playerId);
      if (player && penalty) {
        const deduction = penalty === 'late' ? 2 : 3;
        penaltyDeductions[player.name] = deduction;
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, points: p.points - deduction } : p));
      }
    });

    const penaltyMessages = Object.entries(penaltyDeductions);
    if (penaltyMessages.length > 0) {
        penaltyToastDescription = " Penalties applied: " + penaltyMessages.map(([name, points]) => `${name} -${points}pts`).join(', ') + '.';
    }


    if (scores.teamA > scores.teamB) {
      result = 'A';
      updatePlayerStats(teams.teamA, 'W');
      updatePlayerStats(teams.teamB, 'L');
      toastMessage = "Team A wins! +3 points for each player.";
    } else if (scores.teamB > scores.teamA) {
      result = 'B';
      updatePlayerStats(teams.teamB, 'W');
      updatePlayerStats(teams.teamA, 'L');
      toastMessage = "Team B wins! +3 points for each player.";
    } else {
      result = 'Draw';
      updatePlayerStats([...teams.teamA, ...teams.teamB], 'D');
      toastMessage = "It's a draw! +2 points for all players.";
    }

    const newMatch: Match = {
      id: `m${Date.now()}`,
      date: new Date().toISOString(),
      teams: {
        teamA: teams.teamA.map(p => ({id: p.id, name: p.name})),
        teamB: teams.teamB.map(p => ({id: p.id, name: p.name}))
      },
      result: result,
      scoreA: scores.teamA,
      scoreB: scores.teamB,
      penalties: penalties,
    };

    setMatchHistory(prev => [newMatch, ...prev]);

    setGamePhase("results");
    setWinner(result);
    setLastToastInfo({
      title: "Game Over!",
      description: toastMessage + penaltyToastDescription,
    });
  };
  
  const handleResetGame = () => {
    setTeams(null);
    setGamePhase("availability");
    setWinner(null);
    setPenalties({});
    setScores({ teamA: 0, teamB: 0 });
    setPlayers(prev => prev.map(p => ({...p, status: 'undecided', waitingTimestamp: null})));
    setLastToastInfo({
        title: "New Game Started",
        description: "Player availability has been reset. Good luck!",
    });
  };
  
  const handleSetPenalty = (playerId: string, penalty: Penalty) => {
    setPenalties(prev => {
      const newPenalties = {...prev};
      if (newPenalties[playerId] === penalty) {
        delete newPenalties[playerId];
      } else {
        newPenalties[playerId] = penalty;
      }
      return newPenalties;
    });
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-muted-foreground">Loading League Data...</p>
            </div>
        </div>
    )
  }

  return (
    <>
      <main className="container mx-auto p-4 md:p-8 relative">
        {winner && <Confetti />}
        <Header />
        
        <Tabs defaultValue="match-day">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="match-day">Match Day</TabsTrigger>
            <TabsTrigger value="standings">League Standings</TabsTrigger>
            <TabsTrigger value="history">Match History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="match-day">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Availability Section */}
                {gamePhase === 'availability' && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 font-headline">
                            Set Availability
                        </CardTitle>
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
                                      />
                                  </div>
                              )}
                              
                              <div>
                                  <Separator className="my-4"/>
                                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-muted-foreground">
                                      Undecided / Out
                                  </h3>
                                  <PlayerLeaderboard
                                      players={otherPlayers}
                                      onSetAvailability={handleSetAvailability}
                                      isLocked={gamePhase !== 'availability'}
                                  />
                              </div>
                        </div>
                    </CardContent>
                  </Card>
                )}
                 {/* Teams Display */}
                {gamePhase !== 'availability' && teams && (
                  <TeamDisplay 
                    teams={teams} 
                    winner={winner} 
                    penalties={penalties}
                    onSetPenalty={handleSetPenalty}
                    isLocked={gamePhase === 'results'}
                  />
                )}
              </div>
              <div className="space-y-6">
                 {/* Right Column */}
                <UpcomingGame />
                <GameControls 
                  onDraftTeams={handleDraftTeams}
                  onRecordResult={handleRecordResult}
                  onResetGame={handleResetGame}
                  gamePhase={gamePhase}
                  playersInCount={playersIn.length}
                  scores={scores}
                  setScores={setScores}
                />
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
          </TabsContent>
          
          <TabsContent value="standings">
            <LeagueStandings 
              players={sortedPlayers}
              onEditPlayer={handleOpenPlayerDialog}
              onDeletePlayer={handleDeletePlayer}
              onAddPlayer={() => handleOpenPlayerDialog(null)}
            />
          </TabsContent>

          <TabsContent value="history">
            <MatchHistory matches={matchHistory} players={players} />
          </TabsContent>
        </Tabs>
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

    