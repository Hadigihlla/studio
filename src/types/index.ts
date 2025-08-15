

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
  form: Form;
  photoURL?: string;
  waitingTimestamp?: number | null;
  latePenalties?: number;
  noShowPenalties?: number;
  isGuest?: false;
}

export interface GuestPlayer extends Omit<Player, 'isGuest'> {
    isGuest: true;
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
  latePenalty: number;
  noShowPenalty: number;
}
