/**
 * eventLogger.ts
 *
 * Authoritative Event Logging system for Code Mafia.
 *
 * Records player actions, file version updates, task completions, and bug injections.
 * Preserves player secret role (does NOT expose role in public event logs).
 * Serves as meeting discussion evidence.
 */

import { supabase } from '../lib/supabase';

export type GameEventType =
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'PLAYER_MOVED'
  | 'ROOM_ENTERED'
  | 'ROOM_EXITED'
  | 'FILE_OPENED'
  | 'FILE_CHANGED'
  | 'FILE_CODE_UPDATED'
  | 'TEST_RUN'
  | 'TEST_PASSED'
  | 'TEST_FAILED'
  | 'TASK_COMPLETED'
  | 'BUG_INJECTED'
  | 'SABOTAGE_TRIGGERED'
  | 'CODE_CONFLICT_DETECTED'
  | 'STALE_CODE_SUBMITTED'
  | 'MEETING_STARTED'
  | 'MEETING_ENDED'
  | 'VOTE_CAST'
  | 'PLAYER_ELIMINATED'
  | 'GAME_ENDED';

export interface GameEventRecord {
  id: string;
  gameId: string;
  type: GameEventType;
  playerId: string;
  roomId?: string;
  fileId?: string;
  fileName?: string;
  previousVersion?: number;
  newVersion?: number;
  mutationType?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

const memoryEventLogs = new Map<string, GameEventRecord[]>();

function getLogsForGame(gameId: string): GameEventRecord[] {
  let logs = memoryEventLogs.get(gameId);
  if (!logs) {
    logs = [];
    memoryEventLogs.set(gameId, logs);
  }
  return logs;
}

/**
 * Log a game event to memory and Supabase.
 */
export async function logGameEvent(
  params: Omit<GameEventRecord, 'id' | 'timestamp'> & { timestamp?: number }
): Promise<GameEventRecord> {
  const { gameId, type, playerId, roomId, fileId, fileName, previousVersion, newVersion, mutationType, metadata } =
    params;
  const now = params.timestamp || Date.now();
  const eventId = `evt-${now}-${Math.random().toString(36).slice(2, 7)}`;

  const record: GameEventRecord = {
    id: eventId,
    gameId,
    type,
    playerId,
    roomId,
    fileId,
    fileName,
    previousVersion,
    newVersion,
    mutationType,
    metadata,
    timestamp: now,
  };

  const logs = getLogsForGame(gameId);
  logs.push(record);

  // Try writing to Supabase game_events
  try {
    await supabase.from('game_events').insert({
      id: eventId,
      game_id: gameId,
      type,
      player_id: playerId,
      room_id: roomId,
      file_id: fileId,
      file_name: fileName,
      previous_version: previousVersion,
      new_version: newVersion,
      mutation_type: mutationType,
      metadata: metadata || {},
      created_at: new Date(now).toISOString(),
    });
  } catch {
    // Ignore fallback
  }

  return record;
}

/**
 * Fetch all logged events for a given game.
 */
export async function fetchGameEvents(gameId: string): Promise<GameEventRecord[]> {
  const localLogs = getLogsForGame(gameId);

  try {
    const { data, error } = await supabase
      .from('game_events')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: String(d.id),
        gameId: d.game_id,
        type: d.type as GameEventType,
        playerId: d.player_id,
        roomId: d.room_id,
        fileId: d.file_id,
        fileName: d.file_name,
        previousVersion: d.previous_version ? Number(d.previous_version) : undefined,
        newVersion: d.new_version ? Number(d.new_version) : undefined,
        mutationType: d.mutation_type,
        metadata: d.metadata,
        timestamp: new Date(d.created_at).getTime(),
      }));
    }
  } catch {
    // Fallback
  }

  return [...localLogs];
}
