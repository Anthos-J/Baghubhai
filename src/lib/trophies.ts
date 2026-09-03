export type TrophyCategory = 'DEVELOPER' | 'MAFIA' | 'MEETING' | 'GENERAL';

export interface TrophyDefinition {
  id: string;
  category: TrophyCategory;
  title: string;
  description: string;
  icon: string;
  maxProgress: number;
}

export interface TrophyState {
  id: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export const TROPHY_DEFINITIONS: TrophyDefinition[] = [
  // DEVELOPER
  {
    id: 'first_fix',
    category: 'DEVELOPER',
    title: 'First Fix',
    description: 'Complete your first debugging task.',
    icon: '🛠️',
    maxProgress: 1,
  },
  {
    id: 'code_master',
    category: 'DEVELOPER',
    title: 'Code Master',
    description: 'Complete 3 debugging tasks.',
    icon: '💻',
    maxProgress: 3,
  },
  {
    id: 'bug_hunter',
    category: 'DEVELOPER',
    title: 'Bug Hunter',
    description: 'Repair a compromised task.',
    icon: '🔍',
    maxProgress: 1,
  },
  {
    id: 'perfect_developer',
    category: 'DEVELOPER',
    title: 'Perfect Developer',
    description: 'Complete all assigned tasks and survive.',
    icon: '⭐',
    maxProgress: 1,
  },

  // MAFIA
  {
    id: 'first_sabotage',
    category: 'MAFIA',
    title: 'First Sabotage',
    description: 'Successfully sabotage a task.',
    icon: '💣',
    maxProgress: 1,
  },
  {
    id: 'impostor',
    category: 'MAFIA',
    title: 'Impostor',
    description: 'Win as Mafia.',
    icon: '☠️',
    maxProgress: 1,
  },
  {
    id: 'undetected',
    category: 'MAFIA',
    title: 'Undetected',
    description: 'Win as Mafia without being eliminated.',
    icon: '🎭',
    maxProgress: 1,
  },

  // MEETING
  {
    id: 'emergency_call',
    category: 'MEETING',
    title: 'Emergency!',
    description: 'Successfully call an emergency meeting.',
    icon: '🚨',
    maxProgress: 1,
  },
  {
    id: 'detective',
    category: 'MEETING',
    title: 'Detective',
    description: 'Vote out Mafia.',
    icon: '🕵️',
    maxProgress: 1,
  },
  {
    id: 'wrong_accusation',
    category: 'MEETING',
    title: 'Wrong Accusation',
    description: 'Vote out an innocent Developer.',
    icon: '❌',
    maxProgress: 1,
  },

  // GENERAL
  {
    id: 'first_game',
    category: 'GENERAL',
    title: 'First Game',
    description: 'Complete your first game.',
    icon: '🎮',
    maxProgress: 1,
  },
  {
    id: 'survivor',
    category: 'GENERAL',
    title: 'Survivor',
    description: 'Survive a full game.',
    icon: '🛡️',
    maxProgress: 1,
  },
  {
    id: 'victory',
    category: 'GENERAL',
    title: 'Victory',
    description: 'Win your first game.',
    icon: '🏆',
    maxProgress: 1,
  },
];

const TROPHY_STORAGE_KEY = 'among_devs_trophies_v1';

type TrophyUnlockCallback = (trophy: TrophyDefinition) => void;
const unlockListeners: Set<TrophyUnlockCallback> = new Set();

export function subscribeTrophyUnlock(cb: TrophyUnlockCallback): () => void {
  unlockListeners.add(cb);
  return () => {
    unlockListeners.delete(cb);
  };
}

export function getTrophyStates(): Record<string, TrophyState> {
  try {
    const raw = localStorage.getItem(TROPHY_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    const result: Record<string, TrophyState> = {};

    TROPHY_DEFINITIONS.forEach((def) => {
      if (existing[def.id]) {
        result[def.id] = existing[def.id];
      } else {
        result[def.id] = {
          id: def.id,
          progress: 0,
          unlocked: false,
        };
      }
    });

    return result;
  } catch {
    const result: Record<string, TrophyState> = {};
    TROPHY_DEFINITIONS.forEach((def) => {
      result[def.id] = { id: def.id, progress: 0, unlocked: false };
    });
    return result;
  }
}

export function saveTrophyStates(states: Record<string, TrophyState>): void {
  try {
    localStorage.setItem(TROPHY_STORAGE_KEY, JSON.stringify(states));
  } catch (err) {
    console.warn('Could not persist trophies:', err);
  }
}

export function recordTrophyProgress(trophyId: string, amount: number = 1): void {
  const def = TROPHY_DEFINITIONS.find((d) => d.id === trophyId);
  if (!def) return;

  const states = getTrophyStates();
  const current = states[trophyId] || { id: trophyId, progress: 0, unlocked: false };

  if (current.unlocked) return; // Already unlocked

  const newProgress = Math.min(def.maxProgress, current.progress + amount);
  const nowUnlocked = newProgress >= def.maxProgress;

  states[trophyId] = {
    ...current,
    progress: newProgress,
    unlocked: nowUnlocked,
    unlockedAt: nowUnlocked ? Date.now() : current.unlockedAt,
  };

  saveTrophyStates(states);

  if (nowUnlocked) {
    unlockListeners.forEach((cb) => cb(def));
  }
}

export type TrophyEventType =
  | 'TASK_COMPLETED'
  | 'BUG_HUNTED'
  | 'SABOTAGE_TRIGGERED'
  | 'EMERGENCY_CALLED'
  | 'VOTED_MAFIA'
  | 'VOTED_INNOCENT'
  | 'GAME_COMPLETED'
  | 'GAME_WON'
  | 'SURVIVED'
  | 'MAFIA_WON'
  | 'MAFIA_UNDETECTED'
  | 'PERFECT_DEV';

export function triggerTrophyEvent(event: TrophyEventType, payload?: any): void {
  switch (event) {
    case 'TASK_COMPLETED':
      recordTrophyProgress('first_fix', 1);
      recordTrophyProgress('code_master', 1);
      break;

    case 'BUG_HUNTED':
      recordTrophyProgress('bug_hunter', 1);
      break;

    case 'SABOTAGE_TRIGGERED':
      recordTrophyProgress('first_sabotage', 1);
      break;

    case 'EMERGENCY_CALLED':
      recordTrophyProgress('emergency_call', 1);
      break;

    case 'VOTED_MAFIA':
      recordTrophyProgress('detective', 1);
      break;

    case 'VOTED_INNOCENT':
      recordTrophyProgress('wrong_accusation', 1);
      break;

    case 'GAME_COMPLETED':
      recordTrophyProgress('first_game', 1);
      break;

    case 'GAME_WON':
      recordTrophyProgress('victory', 1);
      break;

    case 'SURVIVED':
      recordTrophyProgress('survivor', 1);
      break;

    case 'MAFIA_WON':
      recordTrophyProgress('impostor', 1);
      break;

    case 'MAFIA_UNDETECTED':
      recordTrophyProgress('undetected', 1);
      break;

    case 'PERFECT_DEV':
      recordTrophyProgress('perfect_developer', 1);
      break;

    default:
      break;
  }
}
