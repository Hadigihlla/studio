

export type PlayerStatus = "in" | "out" | "undecided" | "waiting";
export type Result = "A" | "B" | "Draw";
export type Form = ('W' | 'D' | 'L')[];
export type Penalty = "late" | "no-show" | undefined;

export interface Player {
  id: string; // Firestore IDs are strings
  name: string;
  points: number;
  status: PlayerStatus;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  lateCount: number;
  noShowCount: number;
  form: Form;
  photoURL?: string;
  waitingTimestamp?: number | null;
  isGuest?: false;
}

export interface GuestPlayer extends Omit<Player, 'isGuest' | 'lateCount' | 'noShowCount'> {
    isGuest: true;
    lateCount: 0;
    noShowCount: 0;
}

export interface Team {
  teamA: (Player | GuestPlayer)[];
  teamB: (Player | GuestPlayer)[];
}

export interface MatchPlayer {
  id: string;
  name: string;
  photoURL?: string;
  isGuest?: boolean;
}

export interface Match {
    id: string;
    date: string;
    teams: { 
      teamA: MatchPlayer[];
      teamB: MatchPlayer[];
    };
    result: Result;
    scoreA: number;
    scoreB: number;
    penalties: Record<string, Penalty>;
}

export interface Settings {
  leagueName: string;
  location: string;
  totalMatches: number;
  drawPoints: number;
  latePenalty: number;
  noShowPenalty: number;
  bonusPoint: number;
}
