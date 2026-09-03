export type Player = {
  id: string;
  room_id?: string;
  username: string;
  color: string;
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  alive: boolean;
  connected: boolean;
  is_host?: boolean;
};

export type MyPlayerState = {
  playerId: string;
  role: "DEVELOPER" | "MAFIA" | null;
};

export type GamePhase =
  | "LOBBY"
  | "ROLE_REVEAL"
  | "PLAYING"
  | "MEETING"
  | "VOTING"
  | "GAME_OVER";

export type Room = {
  id: string;
  code: string;
  phase: GamePhase;
};

export type LocalSession = {
  playerId: string;
  roomId: string;
  roomCode: string;
  username: string;
  color: string;
  isHost: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  assignedPlayerId: string;
  completed: boolean;
};

// Preset neon colors for players
export const PLAYER_COLORS = [
  '#00F0FF', // Cyan
  '#FF003C', // Red
  '#00FF00', // Green
  '#8A2BE2', // Purple
  '#FFA500', // Orange
  '#FFD700', // Gold
  '#FF69B4', // Pink
  '#00FFAB', // Mint
  '#FF6600', // Tangerine
  '#ADFF2F', // Lime
];
