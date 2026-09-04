/**
 * sabotageTriggerService.ts
 *
 * Authoritative Sabotage Trigger management for Code Mafia.
 *
 * Flow:
 * - When Crewmate completes an important task -> evaluate sabotage opportunity -> create private sabotage trigger.
 * - Delivered privately to Mafia only (Crewmates never see sabotage trigger creation).
 * - Target points to a specific physical room & shared code file on the facility map.
 * - Mafia must physically travel on the map to the target room and open the terminal.
 * - Once Mafia executes sabotage, trigger is consumed atomically (safe against multiple Mafia concurrent use).
 */

import { supabase } from '../lib/supabase';
import { getRoomMapping } from '../editor/roomMapping';

export interface SabotageTrigger {
  id: string;
  gameId: string;
  targetRoomId: string;
  targetFileId: string;
  targetFileName: string;
  targetRoomLabel: string;
  active: boolean;
  createdAt: number;
  consumedAt?: number;
  usedBy?: string;
}

// In-memory fallback: gameId -> Map<triggerId, SabotageTrigger>
const memoryTriggerStore = new Map<string, Map<string, SabotageTrigger>>();

function getMemoryStore(gameId: string): Map<string, SabotageTrigger> {
  let map = memoryTriggerStore.get(gameId);
  if (!map) {
    map = new Map<string, SabotageTrigger>();
    memoryTriggerStore.set(gameId, map);
  }
  return map;
}

/**
 * Creates a new private sabotage trigger pointing to a specific room & file.
 */
export async function createSabotageTrigger(params: {
  gameId: string;
  targetRoomId: string;
  targetFileName?: string;
  targetRoomLabel?: string;
}): Promise<SabotageTrigger> {
  const { gameId, targetRoomId } = params;
  const mapping = getRoomMapping(targetRoomId);

  const fileId = mapping?.fileId || `file-${targetRoomId.replace(/\s+/g, '_').toLowerCase()}`;
  const fileName =
    params.targetFileName ||
    (fileId === 'file-auth'
      ? 'auth.js'
      : fileId === 'file-database'
      ? 'database.js'
      : fileId === 'file-utils'
      ? 'utils.js'
      : fileId === 'file-payment'
      ? 'payment.js'
      : 'app.js');
  const roomLabel = params.targetRoomLabel || mapping?.roomLabel || targetRoomId.toUpperCase();

  const triggerId = `sab-trigger-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = Date.now();

  const trigger: SabotageTrigger = {
    id: triggerId,
    gameId,
    targetRoomId,
    targetFileId: fileId,
    targetFileName: fileName,
    targetRoomLabel: roomLabel,
    active: true,
    createdAt: now,
  };

  // 1. Store in memory
  const store = getMemoryStore(gameId);
  store.set(triggerId, trigger);

  // 2. Persist to Supabase if table exists
  try {
    await supabase.from('sabotage_triggers').insert({
      id: triggerId,
      game_id: gameId,
      target_room_id: targetRoomId,
      target_file_id: fileId,
      target_file_name: fileName,
      target_room_label: roomLabel,
      active: true,
      created_at: new Date(now).toISOString(),
    });
  } catch {
    // Ignore fallback
  }

  // 3. Broadcast privately to Mafia channel
  try {
    supabase.channel(`room:${gameId}:events`).send({
      type: 'broadcast',
      event: 'sabotage_trigger_created',
      payload: { trigger },
    });
  } catch {
    // Ignore
  }

  return trigger;
}

/**
 * Atomically consumes a sabotage trigger upon successful bug mutation.
 * Prevents multiple Mafia from using the same single trigger twice.
 */
export async function consumeSabotageTrigger(
  gameId: string,
  triggerId: string,
  mafiaPlayerId: string
): Promise<{ success: boolean; trigger?: SabotageTrigger; error?: string }> {
  const store = getMemoryStore(gameId);
  const trigger = store.get(triggerId);

  if (!trigger || !trigger.active) {
    return { success: false, error: 'Sabotage trigger has already been consumed or is invalid.' };
  }

  const now = Date.now();
  trigger.active = false;
  trigger.consumedAt = now;
  trigger.usedBy = mafiaPlayerId;
  store.set(triggerId, trigger);

  // Update Supabase
  try {
    await supabase
      .from('sabotage_triggers')
      .update({
        active: false,
        consumed_at: new Date(now).toISOString(),
        used_by: mafiaPlayerId,
      })
      .eq('id', triggerId)
      .eq('active', true);
  } catch {
    // Fallback
  }

  // Broadcast consumption
  try {
    supabase.channel(`room:${gameId}:events`).send({
      type: 'broadcast',
      event: 'sabotage_trigger_consumed',
      payload: { triggerId, usedBy: mafiaPlayerId, timestamp: now },
    });
  } catch {
    // Ignore
  }

  return { success: true, trigger };
}

/**
 * Fetches all currently active sabotage triggers for a game.
 */
export async function fetchActiveSabotageTriggers(gameId: string): Promise<SabotageTrigger[]> {
  const store = getMemoryStore(gameId);

  // Try fetching from Supabase
  try {
    const { data, error } = await supabase
      .from('sabotage_triggers')
      .select('*')
      .eq('game_id', gameId)
      .eq('active', true);

    if (!error && data && data.length > 0) {
      const activeList: SabotageTrigger[] = data.map((d: any) => ({
        id: String(d.id),
        gameId: d.game_id,
        targetRoomId: d.target_room_id,
        targetFileId: d.target_file_id,
        targetFileName: d.target_file_name,
        targetRoomLabel: d.target_room_label,
        active: Boolean(d.active),
        createdAt: new Date(d.created_at).getTime(),
        consumedAt: d.consumed_at ? new Date(d.consumed_at).getTime() : undefined,
        usedBy: d.used_by,
      }));

      for (const t of activeList) {
        store.set(t.id, t);
      }
      return activeList;
    }
  } catch {
    // Fallback
  }

  return Array.from(store.values()).filter((t) => t.active);
}
