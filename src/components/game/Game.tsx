

"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import type { Player, PlayerStatus, Team, Match, Result, Penalty, Settings, GuestPlayer } from "@/types";
import { Header } from "@/components/game/Header";
import { UpcomingGame } from "@/components/game/UpcomingGame";
import { PlayerLeaderboard } from "@/components/game/PlayerLeaderboard";
import { GameControls } from "@/components/game/GameControls";
import { TeamDisplay } from "@/components/game/TeamDisplay";
import { ManualDraft } from "@/components/game/ManualDraft";
import { Confetti } from "@/components/game/Confetti";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Users, Clock, Trophy, Shield, UserX, UserPlus } from "lucide-react";
import { MatchHistory } from "@/components/game/MatchHistory";
import { PlayerDialog } from "@/components/game/PlayerDialog";
import { Separator } from "@/components/ui/separator";
import { LeagueStandings } from "@/components/game/LeagueStandings";
import { SettingsDialog } from "@/components/game/SettingsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialPlayers } from "@/lib/initial-players";
import { cn } from "@/lib/utils";
import { PlusOneManager } from "@/components/game/PlusOneManager";
import { Toaster } from "@/components/ui/toaster";
import { SeasonProgress } from "./SeasonProgress";

const MAX_PLAYERS_IN = 14;
const MAX_GUESTS = 4;

const defaultSettings: Settings = {
  leagueName: 'Hirafus League',
  location: 'City Arena',
  totalMatches: 38,
  latePenalty: 2,
  noShowPenalty: 3,
  bonusPoint: 1,
};

export function Game() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [guestPlayers, setGuestPlayers] = useState<GuestPlayer[]>([]);
  const [teams, setTeams] = useState<Team | null>(null);
  const [manualTeams, setManualTeams] = useState<Team>({ teamA: [], teamB: [] });
  const [gamePhase, setGamePhase] = useState<"availability" | "teams" | "results" | "manual-draft">("availability");
  const [winner, setWinner] = useState<Result | null>(null);
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [penalties, setPenalties] = useState<Record<string, Penalty>>({});
  const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [matchToPrint, setMatchToPrint] = useState<Match | null>(null);
  const [teamsToPrint, setTeamsToPrint] = useState<Team | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const printResultRef = useRef<HTMLDivElement>(null);
  const printTeamsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const showToast = useCallback((props: Parameters<typeof toast>[0]) => {
    toast(props);
  }, [toast]);
  
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.points - a.points);
  }, [players]);
  
  const playersIn = useMemo(() => {
    const allPlayers = [...sortedPlayers, ...guestPlayers];
    return allPlayers.filter(p => p.status === 'in');
  }, [sortedPlayers, guestPlayers]);

  const playersWaiting = useMemo(() => {
     const allPlayers = [...sortedPlayers, ...guestPlayers];
     return allPlayers.filter(p => p.status === 'waiting')
        .sort((a, b) => (a.waitingTimestamp || 0) - (b.waitingTimestamp || 0));
  }, [sortedPlayers, guestPlayers]);

  const otherPlayers = useMemo(() => sortedPlayers.filter(p => p.status === 'undecided' || p.status === 'out'), [sortedPlayers]);
  
  const rosterInCount = useMemo(() => sortedPlayers.filter(p => p.status === 'in').length, [sortedPlayers]);
  const guestsInCount = useMemo(() => guestPlayers.filter(p => p.status === 'in').length, [guestPlayers]);
  const rosterWaitingCount = useMemo(() => sortedPlayers.filter(p => p.status === 'waiting').length, [sortedPlayers]);
  const guestsWaitingCount = useMemo(() => guestPlayers.filter(p => p.status === 'waiting').length, [guestPlayers]);

  const unassignedPlayers = useMemo(() => {
    if (gamePhase !== 'manual-draft') return [];
    const assignedIds = new Set([...manualTeams.teamA.map(p => p.id), ...manualTeams.teamB.map(p => p.id)]);
    return playersIn.filter(p => !assignedIds.has(p.id));
  }, [playersIn, manualTeams, gamePhase]);

  const penaltiesInPrintableMatch = useMemo(() => {
    if (!matchToPrint) return [];
    
    const allPlayersInMatch = [...matchToPrint.teams.teamA, ...matchToPrint.teams.teamB];

    return Object.entries(matchToPrint.penalties || {})
      .map(([playerId, penalty]) => {
        if (!penalty) return null;
        
        const player = allPlayersInMatch.find(p => p.id === playerId);

        if (!player || player.isGuest) return null; // Don't show penalties for guests

        return { name: player.name, type: penalty, photoURL: player.photoURL };
      })
      .filter((p): p is { name: string; type: NonNullable<Penalty>; photoURL?: string } => p !== null);
  }, [matchToPrint]);


    // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedPlayers = localStorage.getItem("players");
      const savedGuests = localStorage.getItem("guestPlayers");
      const savedMatches = localStorage.getItem("matchHistory");
      const savedSettings = localStorage.getItem("settings");
      const savedGamePhase = localStorage.getItem("gamePhase");
      const savedTeams = localStorage.getItem("teams");
      const savedScores = localStorage.getItem("scores");
      const savedPenalties = localStorage.getItem("penalties");

      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      } else {
        const playersWithIds = initialPlayers.map((p, index) => ({...p, id: `p${index + 1}`}));
        setPlayers(playersWithIds);
      }
      
      if(savedGuests) setGuestPlayers(JSON.parse(savedGuests));
      if (savedMatches) setMatchHistory(JSON.parse(savedMatches));
      if (savedSettings) {
        // Ensure settings from older versions are compatible
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({...defaultSettings, ...parsedSettings});
      }

      // Restore in-progress game
      if (savedGamePhase) setGamePhase(JSON.parse(savedGamePhase));
      if (savedTeams) setTeams(JSON.parse(savedTeams));
      if (savedScores) setScores(JSON.parse(savedScores));
      if (savedPenalties) setPenalties(JSON.parse(savedPenalties));


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
            localStorage.setItem("guestPlayers", JSON.stringify(guestPlayers));
            localStorage.setItem("matchHistory", JSON.stringify(matchHistory));
            localStorage.setItem("settings", JSON.stringify(settings));

            // Save in-progress game state
            localStorage.setItem("gamePhase", JSON.stringify(gamePhase));
            localStorage.setItem("teams", JSON.stringify(teams));
            localStorage.setItem("scores", JSON.stringify(scores));
            localStorage.setItem("penalties", JSON.stringify(penalties));

        } catch (error) {
            console.error("Failed to save data to localStorage", error);
            showToast({
                variant: 'destructive',
                title: 'Error Saving Data',
                description: 'Could not save your changes.'
            });
        }
    }
  }, [players, guestPlayers, matchHistory, settings, gamePhase, teams, scores, penalties, isLoading, showToast]);
  
  useEffect(() => {
    if (matchToPrint && printResultRef.current) {
        html2canvas(printResultRef.current, {
            scale: 2,
            useCORS: true, 
            backgroundColor: '#020817'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `hirafus-league-result-${matchToPrint.id}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
            setMatchToPrint(null); // Reset after download
        });
    }
  }, [matchToPrint]);
  
  useEffect(() => {
    if (teamsToPrint && printTeamsRef.current) {
      html2canvas(printTeamsRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020817'
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `hirafus-league-teams-${format(new Date(), 'yyyy-MM-dd')}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        setTeamsToPrint(null); // Reset after download
      });
    }
  }, [teamsToPrint]);
  
  const handleSetAvailability = (playerId: string, newStatus: PlayerStatus) => {
    if (gamePhase !== 'availability') {
        return;
    }

    let allParticipants: (Player | GuestPlayer)[] = [...players, ...guestPlayers];
    let playerIndex = allParticipants.findIndex(p => p.id === playerId);

    if (playerIndex === -1) return;

    const playerToUpdate = { ...allParticipants[playerIndex] };
    const originalStatus = playerToUpdate.status;

    // Handle guest removal
    if (playerToUpdate.isGuest && newStatus === 'out') {
        allParticipants.splice(playerIndex, 1);
    } else {
        // Apply new status
        if (newStatus === 'in') {
            const currentlyInCount = allParticipants.filter(p => p.status === 'in').length;
            if (currentlyInCount < MAX_PLAYERS_IN) {
                playerToUpdate.status = 'in';
                playerToUpdate.waitingTimestamp = null;
            } else {
                playerToUpdate.status = 'waiting';
                if (originalStatus !== 'waiting') {
                    playerToUpdate.waitingTimestamp = Date.now();
                }
            }
        } else { // 'out' or 'undecided'
            playerToUpdate.status = newStatus;
            playerToUpdate.waitingTimestamp = null;
        }
        allParticipants[playerIndex] = playerToUpdate;
    }
    
    // Process promotions
    let currentInCount = allParticipants.filter(p => p.status === 'in').length;
    if (currentInCount < MAX_PLAYERS_IN) {
        const waitingList = allParticipants
            .filter(p => p.status === 'waiting')
            .sort((a, b) => (a.waitingTimestamp || 0) - (b.waitingTimestamp || 0));

        const spotsToFill = MAX_PLAYERS_IN - currentInCount;
        const playersToPromote = waitingList.slice(0, spotsToFill);

        playersToPromote.forEach(p => {
            const participantIndex = allParticipants.findIndex(participant => participant.id === p.id);
            if(participantIndex !== -1) {
                allParticipants[participantIndex].status = 'in';
                allParticipants[participantIndex].waitingTimestamp = null;
            }
        });
    }

    // Separate back into players and guests and update state
    const finalPlayers = allParticipants.filter(p => !p.isGuest) as Player[];
    const finalGuests = allParticipants.filter(p => p.isGuest) as GuestPlayer[];
    
    setPlayers(finalPlayers);
    setGuestPlayers(finalGuests);
};


  const handleOpenPlayerDialog = (player: Player | null) => {
    setEditingPlayer(player);
    setIsPlayerDialogOpen(true);
  };

  const handleSavePlayer = (playerData: Omit<Player, 'status' | 'form' | 'waitingTimestamp'>) => {
    if (playerData.id) { // Editing existing player
      setPlayers(prev => prev.map(p => p.id === playerData.id ? { 
        ...p, 
        name: playerData.name,
        photoURL: playerData.photoURL,
        points: playerData.points,
        matchesPlayed: playerData.matchesPlayed,
        wins: playerData.wins,
        draws: playerData.draws,
        losses: playerData.losses,
        lateCount: playerData.lateCount,
        noShowCount: playerData.noShowCount,
      } : p));
      toast({ title: "Player Updated", description: `${playerData.name}'s details have been saved.` });
    } else { // Adding new player
      const newPlayer: Player = {
        id: `p${Date.now()}`,
        name: playerData.name,
        points: playerData.points,
        photoURL: playerData.photoURL,
        status: 'undecided',
        matchesPlayed: playerData.matchesPlayed,
        wins: playerData.wins,
        draws: playerData.draws,
        losses: playerData.losses,
        lateCount: playerData.lateCount,
        noShowCount: playerData.noShowCount,
        form: [],
        waitingTimestamp: null,
      };
      setPlayers(prev => [...prev, newPlayer]);
      toast({ title: "Player Added", description: `${newPlayer.name} has joined the roster.` });
    }
    setIsPlayerDialogOpen(false);
  };
  
  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    toast({ title: "Settings Saved", description: "League settings have been updated." });
    setIsSettingsDialogOpen(false);
  };

  const handleDeletePlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if(player) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      toast({ variant: 'destructive', title: "Player Removed", description: `${player.name} has been removed.` });
    }
  };

  const handleDraftTeams = (method: "points" | "manual") => {
    if (playersIn.length !== 14) {
        toast({ variant: "destructive", title: "Incorrect Player Count", description: `Drafting requires exactly 14 players to be 'In' for a 7 vs 7 match. You have ${playersIn.length}.` });
        return;
    }

    if (method === "manual") {
      setManualTeams({ teamA: [], teamB: [] });
      setGamePhase("manual-draft");
      toast({ title: "Manual Draft", description: "Assign players to Team A or Team B." });
      return;
    }

    // Points-based draft
    const rankedPlayersIn = [...playersIn].sort((a, b) => b.points - a.points);
    const teamA: (Player | GuestPlayer)[] = [];
    const teamB: (Player | GuestPlayer)[] = [];
    
    // Serpent/snake draft logic to ensure balanced teams of 7
    const picks = [...rankedPlayersIn];

    // Distribute players 1-2-2-2-2-2-2-1
    teamA.push(picks.shift()!); // 1st pick -> Team A
    teamB.push(picks.pop()!);   // Last pick -> Team B

    while(picks.length > 0) {
        teamB.push(picks.shift()!); // Next highest -> Team B
        teamA.push(picks.pop()!);   // Next lowest -> Team A
        
        if (picks.length > 0) {
            teamA.push(picks.shift()!); // Next highest -> Team A
            teamB.push(picks.pop()!);   // Next lowest -> Team B
        }
    }

    setTeams({ teamA, teamB });
    setGamePhase("teams");
    toast({ title: "Teams Drafted by Points!", description: "7 vs 7 teams have been selected." });
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
    if (manualTeams.teamA.length !== 7 || manualTeams.teamB.length !== 7) {
      toast({
        variant: 'destructive',
        title: "Incorrect Team Size",
        description: `Both Team A and Team B must have exactly 7 players. Please adjust the teams.`,
      });
      return;
    }

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
    toast({ title: "Manual Teams Confirmed!", description: "The 7 vs 7 teams you selected are locked in." });
  }

  const updatePlayerStats = (
    playersToUpdate: (Player | GuestPlayer)[], 
    result: 'W' | 'D' | 'L', 
    penaltiesForMatch: Record<string, Penalty>,
    bonusPoints: number = 0,
  ) => {
    const playerIdsToUpdate = new Set(playersToUpdate.map(p => p.id));
    
    setPlayers(prev => prev.map(p => {
        if (!p.isGuest && playerIdsToUpdate.has(p.id)) {
            const wasNoShow = penaltiesForMatch[p.id] === 'no-show';
            const pointsGained = result === 'W' ? 3 : result === 'D' ? 2 : 0;
            
            // No-show players don't get points for a Win or Draw
            const shouldGetPoints = !(wasNoShow && (result === 'W' || result === 'D'));
            
            // No-show players don't get bonus points
            const bonusPointsToAdd = wasNoShow ? 0 : bonusPoints;

            return {
                ...p,
                points: p.points + (shouldGetPoints ? pointsGained : 0) + bonusPointsToAdd,
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
            if (playerIndex > -1 && penalty && !tempPlayers[playerIndex].isGuest) {
                const deduction = penalty === 'late' ? settings.latePenalty : settings.noShowPenalty;
                penaltyMessages.push(`${tempPlayers[playerIndex].name} -${deduction}pts`);
                const currentData = tempPlayers[playerIndex];
                tempPlayers[playerIndex] = {
                    ...currentData,
                    points: currentData.points - deduction,
                    lateCount: currentData.lateCount + (penalty === 'late' ? 1 : 0),
                    noShowCount: currentData.noShowCount + (penalty === 'no-show' ? 1 : 0),
                };
            }
        });
        return tempPlayers;
    });

    const penaltyToastDescription = penaltyMessages.length > 0
        ? " Penalties applied: " + penaltyMessages.join(', ') + '.'
        : "";
    
    // Calculate no-shows and bonus points
    const teamANoShows = teams.teamA.filter(p => penalties[p.id] === 'no-show').length;
    const teamBNoShows = teams.teamB.filter(p => penalties[p.id] === 'no-show').length;
    let bonusTeamA = 0;
    let bonusTeamB = 0;
    let bonusMessage = "";

    if (teamBNoShows > teamANoShows) { // Team A played with fewer players
        bonusTeamA = settings.bonusPoint;
        bonusMessage = ` Team A gets +${settings.bonusPoint} bonus point for the less player team.`;
    } else if (teamANoShows > teamBNoShows) { // Team B played with fewer players
        bonusTeamB = settings.bonusPoint;
        bonusMessage = ` Team B gets +${settings.bonusPoint} bonus point for the less player team.`;
    }

    if (scores.teamA > scores.teamB) {
      result = 'A';
      updatePlayerStats(teams.teamA, 'W', penalties, bonusTeamA);
      updatePlayerStats(teams.teamB, 'L', penalties, bonusTeamB);
    } else if (scores.teamB > scores.teamA) {
      result = 'B';
      updatePlayerStats(teams.teamB, 'W', penalties, bonusTeamB);
      updatePlayerStats(teams.teamA, 'L', penalties, bonusTeamA);
    } else {
      result = 'Draw';
      updatePlayerStats(teams.teamA, 'D', penalties, bonusTeamA);
      updatePlayerStats(teams.teamB, 'D', penalties, bonusTeamB);
    }

    const newMatch: Match = {
      id: `m${Date.now()}`,
      date: new Date().toISOString(),
      teams: {
        teamA: teams.teamA.map(p => ({id: p.id, name: p.name, photoURL: p.photoURL, isGuest: !!p.isGuest})),
        teamB: teams.teamB.map(p => ({id: p.id, name: p.name, photoURL: p.photoURL, isGuest: !!p.isGuest}))
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
    toast({ title: "Game Over!", description: resultMessage + bonusMessage + penaltyToastDescription });
  };
  
  const handleResetGame = () => {
    setTeams(null);
    setManualTeams({ teamA: [], teamB: [] });
    setGamePhase("availability");
    setWinner(null);
    setPenalties({});
    setScores({ teamA: 0, teamB: 0 });
    setGuestPlayers([]);
    setPlayers(prev => prev.map(p => ({...p, status: 'undecided', waitingTimestamp: null})));
    
    // Clear in-progress game from storage
    localStorage.removeItem('gamePhase');
    localStorage.removeItem('teams');
    localStorage.removeItem('scores');
    localStorage.removeItem('penalties');

    toast({ title: "New Game Started", description: "Player availability has been reset. Good luck!" });
  };

  const handleCancelDraft = () => {
    setTeams(null);
    setManualTeams({ teamA: [], teamB: [] });
    setGamePhase("availability");
    setPenalties({});
    setScores({ teamA: 0, teamB: 0 });
    toast({ title: "Draft Cancelled", description: "You have returned to the availability screen." });
  }
  
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

    // Create a deep copy to avoid direct state mutation issues
    let updatedPlayers = JSON.parse(JSON.stringify(players)) as Player[];
    const playerMap = new Map(updatedPlayers.map((p: Player) => [p.id, p]));

    const allPlayerIdsInMatch = [
      ...matchToDelete.teams.teamA.map(p => p.id),
      ...matchToDelete.teams.teamB.map(p => p.id)
    ];
    
    // Calculate bonus points that were awarded in the deleted match
    const teamANoShows = matchToDelete.teams.teamA.filter(p => matchToDelete.penalties?.[p.id] === 'no-show').length;
    const teamBNoShows = matchToDelete.teams.teamB.filter(p => matchToDelete.penalties?.[p.id] === 'no-show').length;
    let bonusTeamA = 0;
    let bonusTeamB = 0;
    if (teamBNoShows > teamANoShows) {
        bonusTeamA = settings.bonusPoint;
    } else if (teamANoShows > teamBNoShows) {
        bonusTeamB = settings.bonusPoint;
    }

    // 1. Revert penalty deductions and counts from the deleted match
    Object.entries(matchToDelete.penalties || {}).forEach(([playerId, penalty]) => {
      const player = playerMap.get(playerId);
      if (player && penalty && !player.isGuest) {
        const deduction = penalty === 'late' ? settings.latePenalty : settings.noShowPenalty;
        player.points += deduction;
        if (penalty === 'late') player.lateCount = Math.max(0, player.lateCount - 1);
        if (penalty === 'no-show') player.noShowCount = Math.max(0, player.noShowCount - 1);
      }
    });

    // 2. Revert game result stats from the deleted match
    allPlayerIdsInMatch.forEach(playerId => {
      const player = playerMap.get(playerId);
      if (!player || player.isGuest) return;

      let result: 'W' | 'D' | 'L' | null = null;
      let bonusPointsReverted = 0;

      if (matchToDelete.teams.teamA.some(p => p.id === playerId)) {
        result = matchToDelete.result === 'A' ? 'W' : matchToDelete.result === 'B' ? 'L' : 'D';
        bonusPointsReverted = bonusTeamA;
      } else if (matchToDelete.teams.teamB.some(p => p.id === playerId)) {
        result = matchToDelete.result === 'B' ? 'W' : matchToDelete.result === 'A' ? 'L' : 'D';
        bonusPointsReverted = bonusTeamB;
      }

      if (result) {
        // Revert stats
        player.matchesPlayed = Math.max(0, player.matchesPlayed - 1);
        if (result === 'W') player.wins = Math.max(0, player.wins - 1);
        else if (result === 'D') player.draws = Math.max(0, player.draws - 1);
        else if (result === 'L') player.losses = Math.max(0, player.losses - 1);

        // Revert points, accounting for no-show penalties
        const wasNoShow = matchToDelete.penalties?.[playerId] === 'no-show';
        const shouldRevertPoints = !(wasNoShow && (result === 'W' || result === 'D'));

        if (shouldRevertPoints) {
          const pointsToRevert = result === 'W' ? 3 : result === 'D' ? 2 : 0;
          player.points -= pointsToRevert;
        }
        
        // Revert bonus points, accounting for no-show
        if (!wasNoShow) {
            player.points -= bonusPointsReverted;
        }
      }
    });

    const remainingMatches = matchHistory.filter(m => m.id !== matchId);
    
    // 3. Rebuild form for all affected players from the remaining (and now authoritative) match history
    allPlayerIdsInMatch.forEach(playerId => {
        const player = playerMap.get(playerId);
        if (!player || player.isGuest) return;

        const newForm: ('W' | 'D' | 'L')[] = [];
        // Iterate matches from newest to oldest to build the form chronologically
        [...remainingMatches].forEach(match => {
            if (newForm.length >= 5) return;
            let result: 'W' | 'D' | 'L' | null = null;
            if (match.teams.teamA.some(p => p.id === player.id)) {
                result = match.result === 'A' ? 'W' : match.result === 'B' ? 'L' : 'D';
            } else if (match.teams.teamB.some(p => p.id === player.id)) {
                result = match.result === 'B' ? 'W' : match.result === 'A' ? 'L' : 'D';
            }
            if(result) newForm.push(result);
        });
        // The form should be the most recent 5
        player.form = newForm.slice(0, 5);
    });

    setPlayers(Array.from(playerMap.values()));
    setMatchHistory(remainingMatches);
    toast({ title: "Match Deleted", description: "The match has been removed and player stats have been reverted." });
  };
  
  const handleDownloadMatchResult = (match: Match) => {
    setMatchToPrint(match);
  };
  
  const handleDownloadTeams = () => {
    if (teams) {
      setTeamsToPrint(teams);
    }
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        players,
        guestPlayers,
        matchHistory,
        settings,
      };
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.download = 'hirafus-league-backup.json';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "Data Exported", description: "Your league data has been saved to a backup file." });
    } catch (error) {
      console.error("Failed to export data", error);
      toast({ variant: 'destructive', title: "Export Failed", description: "Could not export your data." });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File could not be read");
        }
        const data = JSON.parse(text);

        // Basic validation
        if (data.players && data.matchHistory && data.settings) {
          setPlayers(data.players);
          setGuestPlayers(data.guestPlayers || []);
          setMatchHistory(data.matchHistory);
          setSettings(data.settings);
          handleResetGame(); // Reset current game state after import
          toast({ title: "Data Imported", description: "Your league data has been successfully restored." });
        } else {
          throw new Error("Invalid backup file format");
        }
      } catch (error) {
        console.error("Failed to import data", error);
        toast({ variant: 'destructive', title: "Import Failed", description: "The selected file is not a valid backup." });
      } finally {
        // Reset file input so user can select the same file again if needed
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleResetLeagueData = () => {
    try {
        // Clear all relevant local storage items except players
        localStorage.removeItem("guestPlayers");
        localStorage.removeItem("matchHistory");
        localStorage.removeItem("settings");
        localStorage.removeItem("gamePhase");
        localStorage.removeItem("teams");
        localStorage.removeItem("scores");
        localStorage.removeItem("penalties");

        // Reset all player stats to 0, but keep the players
        setPlayers(prevPlayers => 
            prevPlayers.map(player => ({
                ...player,
                points: 0,
                matchesPlayed: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                lateCount: 0,
                noShowCount: 0,
                form: [],
                status: 'undecided',
                waitingTimestamp: null,
            }))
        );

        setGuestPlayers([]);
        setMatchHistory([]);
        setSettings(defaultSettings);
        
        // Reset current game state
        handleResetGame();

        toast({
            title: "League Stats Reset",
            description: "All player stats and match history have been cleared for a new season."
        });
    } catch (error) {
        console.error("Failed to reset league data", error);
        toast({
            variant: "destructive",
            title: "Reset Failed",
            description: "Could not clear all league data."
        });
    }
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
      <Toaster />
      <main className="container mx-auto p-2 md:p-8 relative no-print">
        {winner && <Confetti />}
        <Header leagueName={settings.leagueName} />
        
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
                             <p className="text-sm text-muted-foreground mb-4">
                                ({rosterInCount} Roster, {guestsInCount} Guests)
                            </p>
                            <PlayerLeaderboard players={playersIn} onSetAvailability={handleSetAvailability} gamePhase={gamePhase} />
                        </div>

                        {playersWaiting.length > 0 && (
                            <div>
                                <Separator className="my-4"/>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-amber-500">
                                    <Clock /> Waiting List ({playersWaiting.length})
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  ({rosterWaitingCount} Roster, {guestsWaitingCount} Guests)
                                </p>
                                <PlayerLeaderboard players={playersWaiting} onSetAvailability={handleSetAvailability} gamePhase={gamePhase} />
                            </div>
                        )}
                        
                        <div>
                            <Separator className="my-4"/>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-muted-foreground">
                                <UserX/> Undecided / Out
                            </h3>
                            <PlayerLeaderboard players={otherPlayers} onSetAvailability={handleSetAvailability} gamePhase={gamePhase} />
                        </div>
                        <Separator className="my-4"/>
                        <PlusOneManager
                          guestPlayers={guestPlayers}
                          setGuestPlayers={setGuestPlayers}
                          maxGuests={MAX_GUESTS}
                          playersInCount={rosterInCount + guestsInCount}
                          maxPlayersIn={MAX_PLAYERS_IN}
                          showToast={showToast}
                          medianPoints={
                            sortedPlayers.length > 0 
                            ? sortedPlayers[Math.floor(sortedPlayers.length / 2)].points 
                            : 50
                          }
                        />
                    </CardContent>
                  </Card>
                )}
                 
                 {gamePhase === 'manual-draft' && (
                    <ManualDraft
                        manualTeams={manualTeams}
                        unassignedPlayers={unassignedPlayers}
                        onAssignPlayer={onAssignPlayer}
                        onConfirmDraft={handleConfirmManualDraft}
                        onCancelDraft={handleCancelDraft}
                    />
                 )}
                 
                {(gamePhase === 'teams' || gamePhase === 'results') && teams && (
                  <TeamDisplay 
                    teams={teams} 
                    winner={winner} 
                    penalties={penalties}
                    onSetPenalty={handleSetPenalty}
                    isLocked={gamePhase === 'results'}
                    settings={settings}
                  />
                )}
              </div>
              <div className="space-y-6">
                <UpcomingGame location={settings.location}/>
                <SeasonProgress current={matchHistory.length} total={settings.totalMatches} />
                <GameControls 
                  onDraftTeams={handleDraftTeams}
                  onRecordResult={handleRecordResult}
                  onResetGame={handleResetGame}
                  onCancelDraft={handleCancelDraft}
                  gamePhase={gamePhase}
                  playersInCount={playersIn.length}
                  unassignedCount={unassignedPlayers.length}
                  scores={scores}
                  setScores={setScores}
                  onDownloadTeams={handleDownloadTeams}
                />
                {gamePhase === 'results' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Award className="text-primary"/>Game Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        {winner === 'Draw' && `It's a draw! ${scores.teamA} - ${scores.teamB}`}
                        {winner === 'A' && `Team A wins! ${scores.teamA} - ${scores.teamB}`}
                        {winner === 'B' && `Team B wins! ${scores.teamB} - ${scores.teamA}`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="standings">
            <LeagueStandings 
              players={sortedPlayers.filter(p => !p.isGuest)}
              onEditPlayer={handleOpenPlayerDialog}
              onDeletePlayer={handleDeletePlayer}
              onAddPlayer={() => handleOpenPlayerDialog(null)}
              onOpenSettings={() => setIsSettingsDialogOpen(true)}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetLeague={handleResetLeagueData}
              leagueName={settings.leagueName}
            />
          </TabsContent>

          <TabsContent value="history">
            <MatchHistory matches={matchHistory} onDeleteMatch={handleDeleteMatch} onDownloadMatch={handleDownloadMatchResult} settings={settings} />
          </TabsContent>
        </Tabs>
      </main>
      <PlayerDialog
        isOpen={isPlayerDialogOpen}
        onOpenChange={setIsPlayerDialogOpen}
        onSave={handleSavePlayer}
        player={editingPlayer}
      />
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        onSave={handleSaveSettings}
        settings={settings}
      />
      {matchToPrint && (
        <div className="printable-area" ref={printResultRef}>
           <Card className="printable-content">
            <CardHeader className="printable-header text-center">
                <CardTitle className="printable-title text-3xl font-headline">{settings.leagueName}</CardTitle>
                <CardDescription className="printable-subtitle text-lg">
                    {format(new Date(matchToPrint.date), "eeee, MMMM do, yyyy")}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex justify-around items-center mb-6">
                    <div className="text-center">
                        <p className="text-xl font-bold text-blue-400">Team A</p>
                        <p className="text-5xl font-bold">{matchToPrint.scoreA}</p>
                    </div>
                     <div className="text-4xl font-light text-muted-foreground">-</div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-red-400">Team B</p>
                        <p className="text-5xl font-bold">{matchToPrint.scoreB}</p>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <p className="text-2xl font-bold text-primary">
                        {matchToPrint.result === 'Draw' && 'The match was a draw.'}
                        {matchToPrint.result === 'A' && 'Team A is the winner!'}
                        {matchToPrint.result === 'B' && 'Team B is the winner!'}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-blue-400 text-lg"><Shield/>Team A</h4>
                        <ul className="space-y-1">
                            {matchToPrint.teams.teamA.map(p => <li key={`pa-${p.id}`}>{p.name}{p.isGuest && ' (Guest)'}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-red-400 text-lg"><Shield/>Team B</h4>
                        <ul className="space-y-1">
                             {matchToPrint.teams.teamB.map(p => <li key={`pb-${p.id}`}>{p.name}{p.isGuest && ' (Guest)'}</li>)}
                        </ul>
                    </div>
                </div>

                {penaltiesInPrintableMatch.length > 0 && (
                  <>
                    <Separator className="my-6"/>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Penalties</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {penaltiesInPrintableMatch.map((p, index) => (
                           <li key={index} className="flex items-center gap-2">
                             {p.type === 'late' && <Clock className="w-4 h-4 text-orange-400" />}
                             {p.type === 'no-show' && <UserX className="w-4 h-4 text-red-500" />}
                             <span>{p.name} ({p.type})</span>
                           </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
            </CardContent>
        </Card>
        </div>
      )}
       {teamsToPrint && (
        <div className="printable-area" ref={printTeamsRef}>
           <Card className="printable-content">
            <CardHeader className="printable-header text-center">
                <CardTitle className="printable-title text-3xl font-headline">{settings.leagueName}</CardTitle>
                <CardDescription className="printable-subtitle text-lg">
                    Team Draft - {format(new Date(), "eeee, MMMM do, yyyy")}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-4 text-blue-400 text-xl"><Shield/>Team A</h4>
                        <ul className="space-y-2">
                            {teamsToPrint.teamA.map(p => <li key={`pta-${p.id}`} className="text-lg">{p.name}{p.isGuest && ' (Guest)'}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-4 text-red-400 text-xl"><Shield/>Team B</h4>
                        <ul className="space-y-2">
                             {teamsToPrint.teamB.map(p => <li key={`ptb-${p.id}`} className="text-lg">{p.name}{p.isGuest && ' (Guest)'}</li>)}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
        </div>
      )}
    </>
  );
}

    