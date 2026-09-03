export type Player = {
  id: string;
  username: string;
  color: string;
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  alive: boolean;
  connected: boolean;
};

export type MyPlayerState = {
  playerId: string;
  role: "DEVELOPER" | "MAFIA";
};

export type GamePhase =
  | "LOBBY"
  | "ROLE_REVEAL"
  | "PLAYING"
  | "MEETING"
  | "VOTING"
  | "GAME_OVER";

export type Task = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  assignedPlayerId: string;
  completed: boolean;
};
