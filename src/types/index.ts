export type PlayerStatus = "in" | "out" | "undecided" | "waiting";
export type Result = "A" | "B" | "Draw";
export type Form = ('W' | 'D' | 'L')[];
export type Penalty = "late" | "no-show" | undefined;

export interface Player {
  id: number;
  name: string;
  points: number;
  status: PlayerStatus;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  form: Form;
  waitingTimestamp?: number | null;
}

export interface Team {
  teamA: Player[];
  teamB: Player[];
}

export interface Match {
    id: number;
    date: string;
    teams: Team;
    result: Result;
    scoreA: number;
    scoreB: number;
}

    