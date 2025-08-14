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
  waitingTimestamp?: number | null;
  latePenalties?: number;
  noShowPenalties?: number;
}

export interface Team {
  teamA: Player[];
  teamB: Player[];
}

export interface Match {
    id: string;
    date: string;
    teams: { // Storing a simplified Player object to avoid nesting full player data in matches
      teamA: { id: string, name: string }[];
      teamB: { id: string, name: string }[];
    };
    result: Result;
    scoreA: number;
    scoreB: number;
    penalties: Record<string, Penalty>;
}
