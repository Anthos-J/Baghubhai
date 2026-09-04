import { GameState, GameAlarm, GameNotification, SabotageCooldown } from '../types/game';
import { bugTask } from './tasks';
import { canSabotage } from './roles';

export const DEFAULT_COOLDOWN_MS = 60000; // 1 minute cooldown (60 seconds)

/**
 * Initializes or retrieves sabotage cooldown for a given imposter.
 */
export function getImposterCooldown(state: GameState, imposterId: string): SabotageCooldown {
  return state.sabotageCooldowns[imposterId] || {
    bugInjection: 0,
    syntaxBlackout: 0,
    serverOverload: 0,
  };
}

/**
 * Imposter action: Corrupts/bugs a task.
 * Cooldown: 1 minute (60 seconds) before the imposter can bug another task.
 * Escape Window: 3 seconds before the other crewmembers receive the notification and the alarm triggers.
 */
export function triggerBugInjection(
  state: GameState,
  imposterId: string,
  targetTaskId: string
): { success: boolean; state: GameState; reason?: string } {
  const imposter = state.players.find((p) => p.id === imposterId);
  if (!imposter || !canSabotage(imposter, state)) {
    return { success: false, state, reason: 'Unauthorized: Player cannot sabotage at this time.' };
  }

  const now = Date.now();
  const cooldowns = getImposterCooldown(state, imposterId);
  if (cooldowns.bugInjection > now) {
    const remainingSec = Math.ceil((cooldowns.bugInjection - now) / 1000);
    return { success: false, state, reason: `Bug injection on cooldown (${remainingSec}s remaining). Must wait 1 min.` };
  }

  // Find target task
  const targetTask = state.tasks.find((t) => t.id === targetTaskId);
  if (!targetTask) {
    return { success: false, state, reason: 'Target task not found.' };
  }

  // Detect whether task was previously completed
  const wasTaskCompleted = targetTask.status === 'COMPLETED' || Boolean(targetTask.completed);

  // Mutate task code and drop progress immediately
  const { tasks: updatedTasks, progress: updatedProgress } = bugTask(state.tasks, targetTaskId);
  const isNowBugged = updatedTasks.find((t) => t.id === targetTaskId)?.status === 'BUGGED';
  if (!isNowBugged) {
    return { success: false, state, reason: 'Failed to apply bug to target task.' };
  }

  // 1-minute (60s) cooldown
  const cooldownDurationMs = (state.settings.sabotageCooldownSeconds ?? 60) * 1000 || DEFAULT_COOLDOWN_MS;

  const nextCooldowns = {
    ...state.sabotageCooldowns,
    [imposterId]: {
      ...cooldowns,
      bugInjection: now + cooldownDurationMs,
    },
  };

  // 3-second escape delay window before crewmembers receive the alert
  const escapeDelayMs = (state.settings.imposterEscapeDelaySeconds ?? 3) * 1000;
  const pendingAlert = {
    id: `sabotage-${now}`,
    imposterId,
    taskId: targetTaskId,
    triggeredAt: now,
    broadcastAt: now + escapeDelayMs,
    processed: false,
    wasTaskCompleted,
  };

  let immediateAlert = null;
  let immediateEvent = null;
  if (escapeDelayMs <= 0 && wasTaskCompleted) {
    immediateEvent = {
      id: `mafia-tamper-${targetTaskId}-${now}`,
      type: 'MAFIA_CHANGED_COMPLETED_TASK' as const,
      gameId: state.roomId,
      taskId: targetTaskId,
      timestamp: now,
    };
    immediateAlert = {
      id: immediateEvent.id,
      title: '⚠ CODE INTEGRITY ALERT',
      message: 'A completed assignment has been altered.',
      timestamp: now,
    };
  }

  const nextState: GameState = {
    ...state,
    tasks: updatedTasks,
    progress: updatedProgress,
    // Alarm not yet active during the 3s escape window
    pendingSabotageAlert: escapeDelayMs > 0 ? pendingAlert : null,
    codeIntegrityAlert: immediateAlert ?? state.codeIntegrityAlert,
    lastMafiaTaskAlteredEvent: immediateEvent ?? state.lastMafiaTaskAlteredEvent,
    sabotageCooldowns: nextCooldowns,
    lastUpdatedAt: now,
  };

  return { success: true, state: nextState };
}

/**
 * Evaluates pending sabotage alerts. When the 3-second escape window expires,
 * this activates the translucent red/yellow alarm and alerts the crewmembers.
 */
export function processPendingSabotageAlert(state: GameState, currentTime: number = Date.now()): GameState {
  if (!state.pendingSabotageAlert || state.pendingSabotageAlert.processed) {
    return state;
  }

  if (currentTime < state.pendingSabotageAlert.broadcastAt) {
    // 3 seconds haven't elapsed yet
    return state;
  }

  const wasCompleted = Boolean(state.pendingSabotageAlert.wasTaskCompleted);

  const alteredEvent = wasCompleted
    ? {
        id: `mafia-tamper-${state.pendingSabotageAlert.taskId}-${currentTime}`,
        type: 'MAFIA_CHANGED_COMPLETED_TASK' as const,
        gameId: state.roomId,
        taskId: state.pendingSabotageAlert.taskId,
        timestamp: currentTime,
      }
    : null;

  const codeIntegrityAlert = alteredEvent
    ? {
        id: alteredEvent.id,
        taskId: alteredEvent.taskId,
        title: '⚠ CODE INTEGRITY ALERT',
        message: 'A completed assignment has been altered.',
        timestamp: currentTime,
      }
    : null;

  const notificationMessage = wasCompleted
    ? '⚠️ CODE INTEGRITY ALERT: A completed assignment has been altered.'
    : '⚠️ SECURITY ANOMALY: Codebase corrupted! A module has been altered. Inspect repository and run tests.';

  // Escape window ended -> Sound alarm across crewmembers!
  const alarm: GameAlarm = {
    isActive: true,
    type: 'RED_YELLOW_ALERT',
    message: wasCompleted
      ? 'CRITICAL ALERT: A completed assignment has been altered! Search facility rooms to locate and patch the bug!'
      : 'CRITICAL ALERT: System anomaly detected across codebase! One or more modules have been corrupted!',
    startedAt: currentTime,
    durationSeconds: 20,
    severity: 'critical',
    overlayStyle: 'translucent-red-yellow',
  };

  const notification: GameNotification = {
    id: alteredEvent?.id || `notif-${currentTime}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: currentTime,
    message: notificationMessage,
    level: 'alarm',
    isGlobal: true,
  };

  return {
    ...state,
    alarm,
    pendingSabotageAlert: null,
    codeIntegrityAlert,
    lastMafiaTaskAlteredEvent: alteredEvent,
    notifications: [notification, ...state.notifications].slice(0, 50),
    lastUpdatedAt: currentTime,
  };
}

/**
 * Imposter action: Triggers Syntax Blackout.
 * Hides syntax highlighting in editors for 30s.
 */
export function triggerSyntaxBlackout(
  state: GameState,
  imposterId: string
): { success: boolean; state: GameState; reason?: string } {
  const imposter = state.players.find((p) => p.id === imposterId);
  if (!imposter || !canSabotage(imposter, state)) {
    return { success: false, state, reason: 'Unauthorized.' };
  }

  const now = Date.now();
  const cooldowns = getImposterCooldown(state, imposterId);
  if (cooldowns.syntaxBlackout > now) {
    const remainingSec = Math.ceil((cooldowns.syntaxBlackout - now) / 1000);
    return { success: false, state, reason: `Syntax blackout on cooldown (${remainingSec}s).` };
  }

  const durationSec = state.settings.syntaxBlackoutDurationSeconds || 30;

  const alarm: GameAlarm = {
    isActive: true,
    type: 'SYNTAX_BLACKOUT',
    message: 'BLACKOUT: IDE syntax parser offline for 30 seconds!',
    startedAt: now,
    durationSeconds: durationSec,
    severity: 'high',
    overlayStyle: 'blackout',
  };

  const notification: GameNotification = {
    id: `notif-${now}`,
    timestamp: now,
    message: '⚡ SYNTAX BLACKOUT: Code syntax parser disrupted!',
    level: 'warning',
    isGlobal: true,
  };

  const nextCooldowns = {
    ...state.sabotageCooldowns,
    [imposterId]: {
      ...cooldowns,
      syntaxBlackout: now + ((durationSec + 20) * 1000),
    },
  };

  return {
    success: true,
    state: {
      ...state,
      syntaxBlackoutActive: true,
      alarm,
      notifications: [notification, ...state.notifications].slice(0, 50),
      sabotageCooldowns: nextCooldowns,
      lastUpdatedAt: now,
    },
  };
}

/**
 * Imposter action: Server Overload emergency.
 * Developers have 45 seconds to resolve or Mafia wins.
 */
export function triggerServerOverload(
  state: GameState,
  imposterId: string
): { success: boolean; state: GameState; reason?: string } {
  const imposter = state.players.find((p) => p.id === imposterId);
  if (!imposter || !canSabotage(imposter, state)) {
    return { success: false, state, reason: 'Unauthorized.' };
  }

  const now = Date.now();
  const deadline = now + 45000; // 45s countdown

  const alarm: GameAlarm = {
    isActive: true,
    type: 'SERVER_OVERLOAD',
    message: 'CRITICAL EMERGENCY: Server Overload! Cool down the servers in 45s or deployment collapses!',
    startedAt: now,
    durationSeconds: 45,
    severity: 'critical',
    overlayStyle: 'strobe-alert',
  };

  const notification: GameNotification = {
    id: `notif-${now}`,
    timestamp: now,
    message: '🚨 CRITICAL OVERLOAD: Complete emergency cool-down before server melts!',
    level: 'alarm',
    isGlobal: true,
  };

  return {
    success: true,
    state: {
      ...state,
      serverOverloadActive: true,
      serverOverloadDeadline: deadline,
      alarm,
      notifications: [notification, ...state.notifications].slice(0, 50),
      lastUpdatedAt: now,
    },
  };
}

/**
 * Resolves the server overload crisis.
 */
export function resolveServerOverload(state: GameState, resolverId: string): GameState {
  const resolver = state.players.find((p) => p.id === resolverId);
  const now = Date.now();

  const notification: GameNotification = {
    id: `notif-${now}`,
    timestamp: now,
    message: `✅ OVERLOAD RESOLVED by ${resolver?.name || 'Developer'}! System stabilized.`,
    level: 'info',
    isGlobal: true,
  };

  return {
    ...state,
    serverOverloadActive: false,
    serverOverloadDeadline: null,
    alarm: state.alarm?.type === 'SERVER_OVERLOAD' ? null : state.alarm,
    notifications: [notification, ...state.notifications].slice(0, 50),
    lastUpdatedAt: now,
  };
}

/**
 * Clears the active alarm overlay.
 */
export function clearAlarm(state: GameState): GameState {
  return {
    ...state,
    alarm: null,
    lastUpdatedAt: Date.now(),
  };
}
