export type PlayerRole = 'DEVELOPER' | 'MAFIA';
export type ImposterRoleAlias = 'IMPOSTER'; // Developer vs Imposter terminology

export type PlayerStatus = 'ALIVE' | 'ELIMINATED' | 'GHOST';

// Master Implementation Context (Section 10) & 2D Map compatibility
export type Player = {
  id: string;
  room_id?: string;
  username: string;
  name?: string; // alias for username
  color: string;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  alive: boolean;
  connected: boolean;
  is_host?: boolean;
  role?: PlayerRole;
  status?: PlayerStatus;
  isHost?: boolean;
  avatar?: string;
  tasksCompletedCount?: number;
  meetingsCalledCount?: number;
};

export type MyPlayerState = {
  playerId: string;
  role: "DEVELOPER" | "MAFIA" | null;
};

export type GamePhase = 
  | 'LOBBY' 
  | 'ROLE_REVEAL' 
  | 'PLAYING' 
  | 'MEETING' 
  | 'VOTING' 
  | 'VOTE_REVEAL' 
  | 'GAME_OVER';

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
  assignedPlayerId?: string;
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

export type GameFile = {
  id: string;
  filename: string;
  language: string;
  content: string;
  updatedBy: string | null;
  updatedAt: string;
};

export type ActivityEvent = {
  id: string;
  type: string;
  playerId: string;
  fileName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type TaskStatus = 'PENDING' | 'COMPLETED' | 'BUGGED';

export interface TaskItem {
  id: string;
  fileId: string;
  fileName: string;
  title: string;
  description: string;
  status: TaskStatus;
  initialCode: string;
  currentCode: string;
  solutionCode: string;
  mutatedBugCode: string;
  testKey: string;
  hint: string;
  lastBuggedAt?: number;
  completed?: boolean;
}

export type AlarmType = 'RED_YELLOW_ALERT' | 'SYNTAX_BLACKOUT' | 'SERVER_OVERLOAD';

export interface GameAlarm {
  isActive: boolean;
  type: AlarmType;
  message: string;
  startedAt: number;
  durationSeconds: number;
  severity: 'high' | 'critical';
  // Overlay styles for UI
  overlayStyle: 'translucent-red-yellow' | 'blackout' | 'strobe-alert';
}

export interface PendingSabotageAlert {
  id: string;
  imposterId: string;
  taskId: string;
  triggeredAt: number;
  broadcastAt: number; // 3 seconds escape window for imposter
  processed: boolean;
}

export interface SabotageCooldown {
  bugInjection: number; // timestamp when available
  syntaxBlackout: number;
  serverOverload: number;
}

export interface GameNotification {
  id: string;
  timestamp: number;
  message: string;
  level: 'info' | 'warning' | 'error' | 'alarm';
  isGlobal: boolean;
}

export interface MeetingState {
  callerId: string;
  callerName: string;
  reason: string;
  startedAt: number;
  durationSeconds: number;
}

export interface VotingState {
  startedAt: number;
  durationSeconds: number;
  votes: Record<string, string>; // voterId -> targetPlayerId | 'SKIP'
  isResolved: boolean;
  eliminatedPlayerId: string | null;
  eliminatedPlayerName: string | null;
  eliminatedRole?: PlayerRole;
  isTie: boolean;
  isSkip: boolean;
  voteCounts: Record<string, number>;
}

export interface WinResult {
  winner: 'DEVELOPERS' | 'MAFIA' | null;
  reason: string;
  endedAt?: number;
}

export type CodeDifficulty = 'SMALL' | 'MEDIUM' | 'DIFFICULT';
export type EmergencyMeetingLimit = 1 | 2 | null;

export interface GameSettings {
  maxPlayers?: number;
  mafiaCount?: number;
  difficulty?: CodeDifficulty;
  gameDurationSeconds: number;
  discussionDurationSeconds?: number;
  votingDurationSeconds: number;
  sabotageCooldownSeconds: number; // 60s (1 minute) cooldown
  imposterEscapeDelaySeconds?: number; // 3s escape window
  syntaxBlackoutDurationSeconds: number;
  meetingDurationSeconds?: number;
  serverOverloadResolutionTimeSeconds?: number;
  emergencyMeetingLimit?: 1 | 2 | null;
  emergencyMeetingCooldownSeconds?: number;
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  phaseTimer: number; // remaining seconds for current phase
  gameTimeRemaining: number; // total overall game timer in seconds
  totalGameTime: number; // initial allocated game time
  isTimerPaused: boolean; // paused during emergency meetings / voting
  players: Player[];
  tasks: TaskItem[];
  progress: number; // 0 to 100%
  alarm: GameAlarm | null;
  pendingSabotageAlert: PendingSabotageAlert | null; // 3-second escape delay
  notifications: GameNotification[];
  meeting: MeetingState | null;
  voting: VotingState | null;
  emergencyMeetingCooldownUntil?: number | null;
  sabotageCooldowns: Record<string, SabotageCooldown>; // imposterId -> cooldowns
  syntaxBlackoutActive: boolean;
  serverOverloadActive: boolean;
  serverOverloadDeadline: number | null;
  winner: WinResult | null;
  settings: GameSettings;
  createdAt: number;
  lastUpdatedAt: number;
}

export type GameAction =
  | { type: 'JOIN_PLAYER'; player: Player }
  | { type: 'LEAVE_PLAYER'; playerId: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'START_GAME' }
  | { type: 'TRANSITION_TO_PLAYING' }
  | { type: 'DEV_SOLVE_TASK'; playerId: string; taskId: string; code?: string }
  | { type: 'IMPOSTER_BUG_TASK'; imposterId: string; taskId: string }
  | { type: 'TRIGGER_SYNTAX_BLACKOUT'; imposterId: string }
  | { type: 'TRIGGER_SERVER_OVERLOAD'; imposterId: string }
  | { type: 'RESOLVE_SERVER_OVERLOAD'; playerId: string }
  | { type: 'CLEAR_ALARM' }
  | { type: 'CALL_MEETING'; callerId: string; reason?: string }
  | { type: 'START_VOTING' }
  | { type: 'CAST_VOTE'; voterId: string; targetId: string | 'SKIP' }
  | { type: 'RESOLVE_VOTES' }
  | { type: 'FINISH_VOTE_REVEAL' }
  | { type: 'TICK'; deltaSeconds?: number }
  | { type: 'RESTART_GAME' };
