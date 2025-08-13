
"use client";

import { useState, useMemo, useEffect } from "react";
import type { Player, PlayerStatus, Team, Match, Result, Penalty } from "@/types";
import { Header } from "@/components/game/Header";
import { UpcomingGame } from "@/components/game/UpcomingGame";
import { PlayerLeaderboard } from "@/components/game/PlayerLeaderboard";
import { GameControls } from "@/components/game/GameControls";
import { TeamDisplay } from "@/components/game/TeamDisplay";
import { ManualDraft } from "@/components/game/ManualDraft";
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
  const [manualTeams, setManualTeams] = useState<Team>({ teamA: [], teamB: [] });
  const [gamePhase, setGamePhase] = useState<"availability" | "teams" | "results" | "manual-draft">("availability");
  const [winner, setWinner] = useState<Result | null>(null);
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [penalties, setPenalties] = useState<Record<string, Penalty>>({});
  const [scores, setScores] = useState<{ teamA: number; teamB: number }>({ teamA: 0, teamB: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedPlayers = localStorage.getItem("players");
      const savedMatches = localStorage.getItem("matchHistory");

      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      } else {
        const playersWithIds = initialPlayers.map((p, index) => ({...p, id: `p${index + 1}`}));
        setPlayers(playersWithIds);
      }
      
      if (savedMatches) {
        setMatchHistory(JSON.parse(savedMatches));
      }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        toast({
            variant: 'destructive',
            title: 'Error Loading Data',
            description: 'Could not fetch data. Your saved data might be corrupted.'
        });
    } finally {
        setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save state to localStorage whenever it changes, but not on initial load
  useEffect(() => {
    if (!isLoading) {
        try {
            localStorage.setItem("players", JSON.stringify(players));
            localStorage.setItem("matchHistory", JSON.stringify(matchHistory));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
            toast({
                variant: 'destructive',
                title: 'Error Saving Data',
                description: 'Could not save your changes.'
            });
        }
    }
  }, [players, matchHistory, isLoading, toast]);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.points - a.points);
  }, [players]);

  const playersIn = useMemo(() => sortedPlayers.filter(p => p.status === 'in'), [sortedPlayers]);
  const playersWaiting = useMemo(() => {
    return sortedPlayers
        .filter(p => p.status === 'waiting')
        .sort((a, b) => (a.waitingTimestamp || 0) - (b.waitingTimestamp || 0));
  }, [sortedPlayers]);
  const otherPlayers = useMemo(() => sortedPlayers.filter(p => p.status === 'undecided' || p.status === 'out'), [sortedPlayers]);
  
  const unassignedPlayers = useMemo(() => {
    if (gamePhase !== 'manual-draft') return [];
    const assignedIds = new Set([...manualTeams.teamA.map(p => p.id), ...manualTeams.teamB.map(p => p.id)]);
    return playersIn.filter(p => !assignedIds.has(p.id));
  }, [playersIn, manualTeams, gamePhase]);

  const handleOpenPlayerDialog = (player: Player | null) => {
    setEditingPlayer(player);
    setIsPlayerDialogOpen(true);
  };

  const handleSavePlayer = (playerData: Omit<Player, 'id' | 'status' | 'matchesPlayed' | 'wins' | 'draws' | 'losses' | 'form' | 'waitingTimestamp'> & { id?: string }) => {
    if (playerData.id) { // Editing existing player
      setPlayers(prev => prev.map(p => p.id === playerData.id ? { ...p, name: playerData.name, points: playerData.points } : p));
      toast({ title: "Player Updated", description: `${playerData.name}'s details have been saved.` });
    } else { // Adding new player
      const newPlayer: Player = {
        id: `p${Date.now()}`,
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
      toast({ title: "Player Added", description: `${newPlayer.name} has joined the roster.` });
    }
    setIsPlayerDialogOpen(false);
  };

  const handleDeletePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if(player) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      toast({ variant: 'destructive', title: "Player Removed", description: `${player.name} has been removed.` });
    }
  };

  const handleSetAvailability = (playerId: string, newStatus: PlayerStatus) => {
    if (gamePhase !== 'availability') {
        toast({
            variant: "destructive",
            title: "Action Locked",
            description: "Cannot change availability after teams are drafted.",
        });
        return;
    }

    setPlayers(currentPlayers => {
        let newPlayers = [...currentPlayers];
        const targetPlayer = newPlayers.find(p => p.id === playerId);
        if (!targetPlayer) return currentPlayers;
        
        const playersInCount = newPlayers.filter(p => p.status === 'in').length;
        
        const updateStatus = (id: string, status: PlayerStatus) => {
            return newPlayers.map(p => p.id === id ? { ...p, status, waitingTimestamp: status === 'waiting' ? Date.now() : null } : p);
        };

        if (newStatus === 'in') {
            if (targetPlayer.status !== 'in') {
                if (playersInCount < MAX_PLAYERS_IN) {
                    newPlayers = updateStatus(playerId, 'in');
                    toast({ title: "You're In!", description: `${targetPlayer.name} is confirmed.` });
                } else {
                    newPlayers = updateStatus(playerId, 'waiting');
                    toast({ title: "Waiting List", description: `${targetPlayer.name} added to waiting list.` });
                }
            }
        } else if (newStatus === 'out' || newStatus === 'undecided') {
            const wasPlayerIn = targetPlayer.status === 'in';
            newPlayers = updateStatus(playerId, newStatus);
            toast({ title: `Status Updated`, description: `${targetPlayer.name} is now ${newStatus}.` });

            if (wasPlayerIn) {
                const waitingList = newPlayers
                    .filter(p => p.status === 'waiting')
                    .sort((a, b) => (a.waitingTimestamp || 0) - (b.waitingTimestamp || 0));

                if (waitingList.length > 0) {
                    const promotedPlayerId = waitingList[0].id;
                    const promotedPlayer = newPlayers.find(p => p.id === promotedPlayerId);
                    if (promotedPlayer) {
                        newPlayers = newPlayers.map(p => p.id === promotedPlayerId ? { ...p, status: 'in', waitingTimestamp: null } : p);
                        toast({ title: "Player Promoted!", description: `${promotedPlayer.name} moved from waiting list to 'in'.` });
                    }
                }
            }
        }
        return newPlayers;
    });
};

  const handleDraftTeams = (method: "points" | "manual") => {
    if (playersIn.length < 2) {
      toast({ variant: "destructive", title: "Not Enough Players", description: "Need at least 2 players to draft teams." });
      return;
    }

    if (method === "manual") {
      setManualTeams({ teamA: [], teamB: [] });
      setGamePhase("manual-draft");
      toast({ title: "Manual Draft", description: "Assign players to Team A or Team B." });
      return;
    }

    const rankedPlayersIn = [...playersIn].sort((a, b) => b.points - a.points);
    const teamA: Player[] = [];
    const teamB: Player[] = [];

    rankedPlayersIn.forEach((player, index) => {
      if (index % 2 === 0) teamA.push(player); else teamB.push(player);
    });

    setTeams({ teamA, teamB });
    setGamePhase("teams");
    toast({ title: "Teams Drafted by Points!", description: "Team A and Team B have been selected." });
  };

  const handleAssignPlayer = (playerId: string, team: 'teamA' | 'teamB' | null) => {
    const playerToAssign = playersIn.find(p => p.id === playerId);
    if (!playerToAssign) return;

    setManualTeams(currentTeams => {
        let newTeamA = currentTeams.teamA.filter(p => p.id !== playerId);
        let newTeamB = currentTeams.teamB.filter(p => p.id !== playerId);

        if (team === 'teamA') newTeamA.push(playerToAssign);
        if (team === 'teamB') newTeamB.push(playerToAssign);
        
        return { teamA: newTeamA, teamB: newTeamB };
    });
  };

  const handleConfirmManualDraft = () => {
    setTeams(manualTeams);
    setGamePhase('teams');
    toast({ title: "Manual Teams Confirmed!", description: "The teams you selected have been locked in." });
  }

  const updatePlayerStats = (playersToUpdate: Player[], result: 'W' | 'D' | 'L', penaltiesForMatch: Record<string, Penalty>) => {
    const playerIdsToUpdate = new Set(playersToUpdate.map(p => p.id));
    
    setPlayers(prev => prev.map(p => {
        if (playerIdsToUpdate.has(p.id)) {
            const wasNoShow = penaltiesForMatch[p.id] === 'no-show';
            const pointsGained = result === 'W' ? 3 : result === 'D' ? 2 : 0;
            const shouldGetPoints = !wasNoShow || result === 'L';

            return {
                ...p,
                points: p.points + (shouldGetPoints ? pointsGained : 0),
                matchesPlayed: p.matchesPlayed + 1,
                wins: p.wins + (result === 'W' ? 1 : 0),
                draws: p.draws + (result === 'D' ? 1 : 0),
                losses: p.losses + (result === 'L' ? 1 : 0),
                form: [result, ...p.form].slice(0, 5),
            };
        }
        return p;
    }));
  };

  const handleRecordResult = () => {
    if (!teams) return;

    let result: Result;
    
    // Apply penalty point deductions
    const penaltyMessages: string[] = [];
    setPlayers(prevPlayers => {
        return prevPlayers.map(player => {
            const penalty = penalties[player.id];
            if (penalty) {
                const deduction = penalty === 'late' ? 2 : 3;
                penaltyMessages.push(`${player.name} -${deduction}pts`);
                return { ...player, points: player.points - deduction };
            }
            return player;
        });
    });

    const penaltyToastDescription = penaltyMessages.length > 0
        ? " Penalties applied: " + penaltyMessages.join(', ') + '.'
        : "";

    if (scores.teamA > scores.teamB) {
      result = 'A';
      updatePlayerStats(teams.teamA, 'W', penalties);
      updatePlayerStats(teams.teamB, 'L', penalties);
    } else if (scores.teamB > scores.teamA) {
      result = 'B';
      updatePlayerStats(teams.teamB, 'W', penalties);
      updatePlayerStats(teams.teamA, 'L', penalties);
    } else {
      result = 'Draw';
      updatePlayerStats([...teams.teamA, ...teams.teamB], 'D', penalties);
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

    const resultMessage = result === 'A' ? "Team A wins!" : result === 'B' ? "Team B wins!" : "It's a draw!";
    toast({ title: "Game Over!", description: resultMessage + penaltyToastDescription });
  };
  
  const handleResetGame = () => {
    setTeams(null);
    setManualTeams({ teamA: [], teamB: [] });
    setGamePhase("availability");
    setWinner(null);
    setPenalties({});
    setScores({ teamA: 0, teamB: 0 });
    setPlayers(prev => prev.map(p => ({...p, status: 'undecided', waitingTimestamp: null})));
    toast({ title: "New Game Started", description: "Player availability has been reset. Good luck!" });
  };
  
  const handleSetPenalty = (playerId: string, penalty: Penalty) => {
    setPenalties(prev => {
      const newPenalties = {...prev};
      if (prev[playerId] === penalty) {
        delete newPenalties[playerId]; // Toggle off
      } else {
        newPenalties[playerId] = penalty; // Set or change penalty
      }
      return newPenalties;
    });
  };

  const handleDeleteMatch = (matchId: string) => {
    const matchToDelete = matchHistory.find(m => m.id === matchId);
    if (!matchToDelete) return;

    setPlayers(currentPlayers => {
        let tempPlayers = [...currentPlayers];

        // 1. Revert penalty deductions
        Object.entries(matchToDelete.penalties || {}).forEach(([playerId, penalty]) => {
            const playerIndex = tempPlayers.findIndex(p => p.id === playerId);
            if (playerIndex > -1 && penalty) {
                const deduction = penalty === 'late' ? 2 : 3;
                tempPlayers[playerIndex].points += deduction;
            }
        });

        // 2. Revert game results
        const teamAPlayerIds = new Set(matchToDelete.teams.teamA.map(p => p.id));
        const teamBPlayerIds = new Set(matchToDelete.teams.teamB.map(p => p.id));

        tempPlayers = tempPlayers.map(player => {
            let result: 'W' | 'D' | 'L' | null = null;
            if (teamAPlayerIds.has(player.id)) {
                result = matchToDelete.result === 'A' ? 'W' : matchToDelete.result === 'B' ? 'L' : 'D';
            } else if (teamBPlayerIds.has(player.id)) {
                result = matchToDelete.result === 'B' ? 'W' : matchToDelete.result === 'A' ? 'L' : 'D';
            }

            if (result) {
                const wasNoShow = matchToDelete.penalties?.[player.id] === 'no-show';
                const shouldRevertPoints = !(wasNoShow && (result === 'W' || result === 'D'));
                const pointsToRevert = result === 'W' ? 3 : result === 'D' ? 2 : 0;

                return {
                    ...player,
                    points: player.points - (shouldRevertPoints ? pointsToRevert : 0),
                    matchesPlayed: player.matchesPlayed - 1,
                    wins: player.wins - (result === 'W' ? 1 : 0),
                    draws: player.draws - (result === 'D' ? 1 : 0),
                    losses: player.losses - (result === 'L' ? 1 : 0),
                    form: player.form.slice(1),
                };
            }
            return player;
        });

        return tempPlayers;
    });

    setMatchHistory(currentHistory => currentHistory.filter(m => m.id !== matchId));
    toast({ title: "Match Deleted", description: "The match has been removed and player stats have been reverted." });
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen no-print">
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
      <main className="container mx-auto p-4 md:p-8 relative no-print">
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
                
                {gamePhase === 'availability' && (
                  <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Set Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-green-500">
                                <Users /> Confirmed Players ({playersIn.length}/{MAX_PLAYERS_IN})
                            </h3>
                            <PlayerLeaderboard players={playersIn} onSetAvailability={handleSetAvailability} gamePhase={gamePhase} />
                        </div>

                        {playersWaiting.length > 0 && (
                            <div>
                                <Separator className="my-4"/>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-amber-500">
                                    <Clock /> Waiting List ({playersWaiting.length})
                                </h3>
                                <PlayerLeaderboard players={playersWaiting} onSetAvailability={handleSetAvailability} gamePhase={gamePhase} />
                            </div>
                        )}
                        
                        <div>
                            <Separator className="my-4"/>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-muted-foreground">
                                Undecided / Out
                            </h3>
                            <PlayerLeaderboard players={otherPlayers} onSetAvailability={handleSetAvailability} gamePhase={gamePhase} />
                        </div>
                    </CardContent>
                  </Card>
                )}
                 
                 {gamePhase === 'manual-draft' && (
                    <ManualDraft
                        manualTeams={manualTeams}
                        unassignedPlayers={unassignedPlayers}
                        onAssignPlayer={handleAssignPlayer}
                        onConfirmDraft={handleConfirmManualDraft}
                    />
                 )}
                 
                {(gamePhase === 'teams' || gamePhase === 'results') && teams && (
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
            <MatchHistory matches={matchHistory} players={players} onDeleteMatch={handleDeleteMatch} />
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
