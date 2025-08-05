export type PlayerStatus = "in" | "out" | "undecided";

export interface Player {
  id: number;
  name: string;
  points: number;
  status: PlayerStatus;
}

export interface Team {
  teamA: Player[];
  teamB: Player[];
}
