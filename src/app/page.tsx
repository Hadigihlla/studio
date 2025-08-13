
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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

  const showToast = useCallback((props: Parameters<typeof toast>[0]) => {
    toast(props);
  }, [toast]);

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
        showToast({
            variant: 'destructive',
            title: 'Error Loading Data',
            description: 'Could not fetch data. Your saved data might be corrupted.'
        });
    } finally {
        setIsLoading(false);
    }
  }, [showToast]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
        try {
            localStorage.setItem("players", JSON.stringify(players));
            localStorage.setItem("matchHistory", JSON.stringify(matchHistory));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
            showToast({
                variant: 'destructive',
                title: 'Error Saving Data',
                description: 'Could not save your changes.'
            });
        }
    }
  }, [players, matchHistory, isLoading, showToast]);

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
        showToast({
            variant: "destructive",
            title: "Action Locked",
            description: "Cannot change availability after teams are drafted.",
        });
        return;
    }

    setPlayers(currentPlayers => {
        let newPlayers = [...currentPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return currentPlayers;

        const playerToUpdate = newPlayers[playerIndex];
        const wasPlayerIn = playerToUpdate.status === 'in';
        let finalStatus = newStatus;
        let waitingTimestamp: number | null = playerToUpdate.waitingTimestamp || null;

        if (newStatus === 'in') {
            const playersInCount = newPlayers.filter(p => p.status === 'in').length;
            if (playersInCount >= MAX_PLAYERS_IN && !wasPlayerIn) {
                finalStatus = 'waiting';
                waitingTimestamp = Date.now();
                showToast({ title: "Waiting List", description: `${playerToUpdate.name} added to waiting list.` });
            } else {
                finalStatus = 'in';
                waitingTimestamp = null;
                showToast({ title: "You're In!", description: `${playerToUpdate.name} is confirmed.` });
            }
        } else { // 'out' or 'undecided'
            waitingTimestamp = null;
            showToast({ title: `Status Updated`, description: `${playerToUpdate.name} is now ${newStatus}.` });
        }

        // Update the target player's status
        newPlayers[playerIndex] = { ...playerToUpdate, status: finalStatus, waitingTimestamp };

        // If a player who was 'in' is now not 'in', try to promote from waiting list
        if (wasPlayerIn && finalStatus !== 'in') {
            const waitingList = newPlayers
                .filter(p => p.status === 'waiting')
                .sort((a, b) => (a.waitingTimestamp || 0) - (b.waitingTimestamp || 0));

            if (waitingList.length > 0) {
                const promotedPlayerId = waitingList[0].id;
                const promotedPlayerIndex = newPlayers.findIndex(p => p.id === promotedPlayerId);
                if (promotedPlayerIndex > -1) {
                    newPlayers[promotedPlayerIndex] = { ...newPlayers[promotedPlayerIndex], status: 'in', waitingTimestamp: null };
                    showToast({ title: "Player Promoted!", description: `${newPlayers[promotedPlayerIndex].name} moved from waiting list to 'in'.` });
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

    // Clone players to avoid direct mutation
    const rankedPlayersIn = [...playersIn].sort((a, b) => b.points - a.points);
    const teamA: Player[] = [];
    const teamB: Player[] = [];

    // Serpent/snake draft logic
    let teamATotal = 0;
    let teamBTotal = 0;

    rankedPlayersIn.forEach((player) => {
        // Assign player to the team with the lower total points
        if (teamATotal <= teamBTotal) {
            teamA.push(player);
            teamATotal += player.points;
        } else {
            teamB.push(player);
            teamBTotal += player.points;
        }
    });

    setTeams({ teamA, teamB });
    setGamePhase("teams");
    toast({ title: "Teams Drafted by Points!", description: "Team A and Team B have been selected." });
  };

  const handleAssignPlayer = (playerId: string, team: 'teamA' | 'teamB' | null) => {
    const playerToAssign = playersIn.find(p => p.id === playerId);
    if (!playerToAssign) return;

    setManualTeams(currentTeams => {
        // Create new arrays by filtering out the player from both teams first
        const newTeamA = currentTeams.teamA.filter(p => p.id !== playerId);
        const newTeamB = currentTeams.teamB.filter(p => p.id !== playerId);

        // Add the player to the correct new team if specified
        if (team === 'teamA') newTeamA.push(playerToAssign);
        if (team === 'teamB') newTeamB.push(playerToAssign);
        
        return { teamA: newTeamA, teamB: newTeamB };
    });
  };

  const handleConfirmManualDraft = () => {
    // Prevent confirming if not all "in" players are assigned
    if (unassignedPlayers.length > 0) {
      toast({
        variant: 'destructive',
        title: "Unassigned Players",
        description: `Please assign all ${playersIn.length} confirmed players to a team.`,
      });
      return;
    }

    setTeams(manualTeams);
    setGamePhase('teams');
    toast({ title: "Manual Teams Confirmed!", description: "The teams you selected have been locked in." });
  }

  const updatePlayerStats = (playersToUpdate: Player[], result: 'W' | 'D' | 'L', penaltiesForMatch: Record<string, Penalty>) => {
    const playerIdsToUpdate = new Set(playersToUpdate.map(p => p.id));
    
    setPlayers(prev => prev.map(p => {
        if (playerIdsToUpdate.has(p.id)) {
            const wasNoShow = penaltiesForMatch[p.id] === 'no-show';
            const pointsGained = result === 'W' ? 3 : result === 'D' ? 2 : 1;
            
            // No-show players don't get points for a Win or Draw
            const shouldGetPoints = !(wasNoShow && (result === 'W' || result === 'D'));

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
        let tempPlayers = [...prevPlayers];
        Object.entries(penalties).forEach(([playerId, penalty]) => {
            const playerIndex = tempPlayers.findIndex(p => p.id === playerId);
            if (playerIndex > -1 && penalty) {
                const deduction = penalty === 'late' ? 2 : 3;
                penaltyMessages.push(`${tempPlayers[playerIndex].name} -${deduction}pts`);
                tempPlayers[playerIndex] = {
                    ...tempPlayers[playerIndex],
                    points: tempPlayers[playerIndex].points - deduction
                };
            }
        });
        return tempPlayers;
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
        delete newPenalties[playerId];
      } else {
        newPenalties[playerId] = penalty;
      }
      return newPenalties;
    });
  };

  const handleDeleteMatch = (matchId: string) => {
    const matchToDelete = matchHistory.find(m => m.id === matchId);
    if (!matchToDelete) return;

    setPlayers(currentPlayers => {
        let tempPlayers = JSON.parse(JSON.stringify(currentPlayers));

        const allPlayerIdsInMatch = [
            ...matchToDelete.teams.teamA.map(p => p.id),
            ...matchToDelete.teams.teamB.map(p => p.id)
        ];
        const playerMap = new Map(tempPlayers.map((p: Player) => [p.id, p]));

        // 1. Revert penalty deductions from the deleted match
        Object.entries(matchToDelete.penalties || {}).forEach(([playerId, penalty]) => {
            const player = playerMap.get(playerId);
            if (player && penalty) {
                const deduction = penalty === 'late' ? 2 : 3;
                player.points += deduction;
            }
        });

        // 2. Revert game result stats from the deleted match
        allPlayerIdsInMatch.forEach(playerId => {
            const player = playerMap.get(playerId);
            if (!player) return;

            let result: 'W' | 'D' | 'L' | null = null;
            const wasInTeamA = matchToDelete.teams.teamA.some(p => p.id === playerId);
            const wasInTeamB = matchToDelete.teams.teamB.some(p => p.id === playerId);

            if (wasInTeamA) {
                result = matchToDelete.result === 'A' ? 'W' : matchToDelete.result === 'B' ? 'L' : 'D';
            } else if (wasInTeamB) {
                result = matchToDelete.result === 'B' ? 'W' : matchToDelete.result === 'A' ? 'L' : 'D';
            }

            if (result) {
                // Revert stats
                player.matchesPlayed -= 1;
                if (result === 'W') player.wins -= 1;
                else if (result === 'D') player.draws -= 1;
                else if (result === 'L') player.losses -= 1;

                // Revert points, accounting for no-show penalties
                const wasNoShow = matchToDelete.penalties?.[playerId] === 'no-show';
                const shouldRevertPoints = !(wasNoShow && (result === 'W' || result === 'D'));

                if (shouldRevertPoints) {
                    const pointsToRevert = result === 'W' ? 3 : result === 'D' ? 2 : 1;
                    player.points -= pointsToRevert;
                }
                
                // This is complex: we need to find the correct form to remove.
                // The form is an array of the last 5 results. If this match is one of them, it should be removed.
                // However, we don't store which match corresponds to which form entry.
                // The simplest correct approach is to rebuild the form from the remaining match history.
            }
        });
        
        let finalPlayers = Array.from(playerMap.values());

        // 3. Rebuild form for affected players from remaining match history
        const remainingMatches = matchHistory.filter(m => m.id !== matchId);
        
        finalPlayers = finalPlayers.map(player => {
            if (allPlayerIdsInMatch.includes(player.id)) {
                 const newForm: ('W' | 'D' | 'L')[] = [];
                 remainingMatches.forEach(match => {
                     let result: 'W' | 'D' | 'L' | null = null;
                     if (match.teams.teamA.some(p => p.id === player.id)) {
                         result = match.result === 'A' ? 'W' : match.result === 'B' ? 'L' : 'D';
                     } else if (match.teams.teamB.some(p => p.id === player.id)) {
                         result = match.result === 'B' ? 'W' : match.result === 'A' ? 'L' : 'D';
                     }
                     if(result) newForm.unshift(result);
                 });
                 player.form = newForm.slice(0, 5);
            }
            return player;
        });

        return finalPlayers;
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
                  unassignedCount={unassignedPlayers.length}
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
            <MatchHistory matches={matchHistory} onDeleteMatch={handleDeleteMatch} />
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

    
