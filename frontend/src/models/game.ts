export interface Player {
  id: string;
  name: string;
  userId?: string; // Present for registered users, undefined for custom/guest players
}

export interface Round {
  id: string;
  scores: Record<string, number>; // playerId -> score
}

export interface Game {
  id: string;
  name: string;
  date: string;
  players: Player[];
  rounds: Round[];
  targetScore: number;
  isComplete: boolean;
  userId: string;
  tenantId: string;
}

export interface GameState {
  games: Game[];
  currentGame: Game | null;
}

