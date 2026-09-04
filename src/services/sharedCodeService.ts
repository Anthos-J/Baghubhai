/**
 * sharedCodeService.ts
 *
 * Supabase-backed persistent shared code file management for Code Mafia.
 * 
 * Architecture:
 * - Supabase database is the persistent source of truth for all shared code files.
 * - Monotonically increasing integer version numbers (Version 1, 2, 3... 10 -> 11).
 * - Normal saves: Optimistic concurrency check (stale save rejection if expectedVersion < latestVersion).
 * - Mafia sabotage: ALWAYS fetches the latest authoritative version from Supabase before mutating,
 *   guaranteeing Mafia creates latestVersion + 1 (never an old version!).
 * - Robust in-memory & localStorage fallback for seamless offline testing and resilience if the table is pending creation.
 */

import { supabase } from '../lib/supabase';
import { INITIAL_PROJECT_FILES } from '../editor/predefinedProject';
import { getRoomMapping } from '../editor/roomMapping';

export interface SharedGameFile {
  id: string;
  game_id: string;
  room_id: string;
  file_name: string;
  content: string;
  version: number;
  updated_by: string | null;
  updated_at: string;
  initial_code?: string;
  solution_code?: string;
}

export interface SaveCodeResult {
  success: boolean;
  file?: SharedGameFile;
  stale?: boolean;
  currentVersion?: number;
  error?: string;
}

export interface SabotageCodeResult {
  success: boolean;
  file?: SharedGameFile;
  previousVersion?: number;
  newVersion?: number;
  mutationType?: string;
  error?: string;
}

// In-memory / local fallback cache: gameId -> (roomIdOrFileId -> SharedGameFile)
const memoryFileStore = new Map<string, Map<string, SharedGameFile>>();

function getMemoryStoreForGame(gameId: string): Map<string, SharedGameFile> {
  let gameMap = memoryFileStore.get(gameId);
  if (!gameMap) {
    gameMap = new Map<string, SharedGameFile>();
    memoryFileStore.set(gameId, gameMap);
  }
  return gameMap;
}

/**
 * Standardize room and file identifiers
 */
export function normalizeRoomId(roomId: string): string {
  const mapping = getRoomMapping(roomId);
  if (mapping) {
    return mapping.fileId.replace('file-', '');
  }
  return roomId.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Default initial file blueprints
 */
export function getDefaultFileDefinitions(): Array<{ roomId: string; fileName: string; content: string }> {
  return INITIAL_PROJECT_FILES.map((f) => ({
    roomId: f.id.replace('file-', ''),
    fileName: f.name,
    content: f.content,
  }));
}

/**
 * Initialize all shared files for a game session at Version 1.
 */
export async function initGameFiles(
  gameId: string,
  customFiles?: Array<{ roomId: string; fileName: string; content: string }>
): Promise<SharedGameFile[]> {
  const filesToSeed = customFiles && customFiles.length > 0 ? customFiles : getDefaultFileDefinitions();
  const gameMap = getMemoryStoreForGame(gameId);
  const results: SharedGameFile[] = [];

  for (const def of filesToSeed) {
    const normRoom = normalizeRoomId(def.roomId);
    const existing = gameMap.get(normRoom) || gameMap.get(def.fileName);

    if (existing) {
      results.push(existing);
      continue;
    }

    const newRecord: SharedGameFile = {
      id: `${gameId}-${normRoom}`,
      game_id: gameId,
      room_id: normRoom,
      file_name: def.fileName,
      content: def.content,
      version: 1,
      updated_by: 'SYSTEM_INIT',
      updated_at: new Date().toISOString(),
    };

    // Store in memory
    gameMap.set(normRoom, newRecord);
    gameMap.set(def.fileName, newRecord);
    gameMap.set(`file-${normRoom}`, newRecord);

    // Try inserting into Supabase game_files table
    try {
      const { data, error } = await supabase
        .from('game_files')
        .upsert(
          {
            game_id: gameId,
            room_id: normRoom,
            file_name: def.fileName,
            content: def.content,
            version: 1,
            updated_by: 'SYSTEM_INIT',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'game_id,room_id' }
        )
        .select()
        .single();

      if (!error && data) {
        const dbRecord: SharedGameFile = {
          id: String(data.id || newRecord.id),
          game_id: data.game_id,
          room_id: data.room_id,
          file_name: data.file_name,
          content: data.content,
          version: Number(data.version || 1),
          updated_by: data.updated_by,
          updated_at: data.updated_at,
        };
        gameMap.set(normRoom, dbRecord);
        gameMap.set(def.fileName, dbRecord);
        gameMap.set(`file-${normRoom}`, dbRecord);
        results.push(dbRecord);
        continue;
      }
    } catch {
      // Fallback to memory
    }

    results.push(newRecord);
  }

  return results;
}

/**
 * Fetch the latest authoritative shared file record from Supabase.
 */
export async function fetchLatestSharedFile(
  gameId: string,
  roomIdOrFileId: string
): Promise<SharedGameFile> {
  const normRoom = normalizeRoomId(roomIdOrFileId);
  const gameMap = getMemoryStoreForGame(gameId);

  // 1. Try fetching directly from Supabase game_files
  try {
    const { data, error } = await supabase
      .from('game_files')
      .select('*')
      .eq('game_id', gameId)
      .or(`room_id.eq.${normRoom},file_name.eq.${roomIdOrFileId},room_id.eq.${roomIdOrFileId}`)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const record: SharedGameFile = {
        id: String(data.id),
        game_id: data.game_id,
        room_id: data.room_id,
        file_name: data.file_name,
        content: data.content,
        version: Number(data.version || 1),
        updated_by: data.updated_by,
        updated_at: data.updated_at,
      };
      // Keep memory cache updated
      gameMap.set(normRoom, record);
      gameMap.set(record.file_name, record);
      gameMap.set(`file-${normRoom}`, record);
      return record;
    }
  } catch {
    // Database table not available or network error -> use memory fallback
  }

  // 2. Check in-memory store
  const cached =
    gameMap.get(normRoom) ||
    gameMap.get(roomIdOrFileId) ||
    gameMap.get(`file-${normRoom}`);

  if (cached) {
    return cached;
  }

  // 3. Fallback: Initialize default file if not seeded yet
  const matchingInitial =
    INITIAL_PROJECT_FILES.find(
      (f) =>
        f.id === roomIdOrFileId ||
        f.id === `file-${normRoom}` ||
        f.name === roomIdOrFileId ||
        f.id.replace('file-', '') === normRoom
    ) || INITIAL_PROJECT_FILES[0];

  const defaultRecord: SharedGameFile = {
    id: `${gameId}-${normRoom}`,
    game_id: gameId,
    room_id: normRoom,
    file_name: matchingInitial.name,
    content: matchingInitial.content,
    version: 1,
    updated_by: 'INITIAL_FALLBACK',
    updated_at: new Date().toISOString(),
  };

  gameMap.set(normRoom, defaultRecord);
  gameMap.set(defaultRecord.file_name, defaultRecord);
  gameMap.set(`file-${normRoom}`, defaultRecord);

  return defaultRecord;
}

/**
 * Normal Crewmate / Developer save with optimistic concurrency check.
 * If expectedVersion < currentVersion in Supabase, the save is rejected (stale protection).
 */
export async function saveCrewmateCode(params: {
  gameId: string;
  roomIdOrFileId: string;
  content: string;
  expectedVersion: number;
  playerId: string;
}): Promise<SaveCodeResult> {
  const { gameId, roomIdOrFileId, content, expectedVersion, playerId } = params;
  const normRoom = normalizeRoomId(roomIdOrFileId);
  const gameMap = getMemoryStoreForGame(gameId);

  // 1. Fetch current authoritative version from Supabase
  const currentFile = await fetchLatestSharedFile(gameId, roomIdOrFileId);

  // 2. Stale protection: reject if another player has already saved a newer version
  if (currentFile.version > expectedVersion) {
    return {
      success: false,
      stale: true,
      currentVersion: currentFile.version,
      file: currentFile,
      error: `Newer version exists (Your version: ${expectedVersion}, Latest: ${currentFile.version}). Please load the latest code.`,
    };
  }

  const newVersion = currentFile.version + 1;
  const now = new Date().toISOString();

  const updatedRecord: SharedGameFile = {
    ...currentFile,
    content,
    version: newVersion,
    updated_by: playerId,
    updated_at: now,
  };

  // 3. Persist to Supabase
  try {
    const { data, error } = await supabase
      .from('game_files')
      .upsert(
        {
          id: currentFile.id || `${gameId}-${normRoom}`,
          game_id: gameId,
          room_id: normRoom,
          file_name: currentFile.file_name,
          content,
          version: newVersion,
          updated_by: playerId,
          updated_at: now,
        },
        { onConflict: 'game_id,room_id' }
      )
      .select()
      .single();

    if (!error && data) {
      updatedRecord.id = String(data.id || updatedRecord.id);
    }
  } catch {
    // Ignore db write failure in fallback/test mode
  }

  // 4. Update memory cache
  gameMap.set(normRoom, updatedRecord);
  gameMap.set(updatedRecord.file_name, updatedRecord);
  gameMap.set(`file-${normRoom}`, updatedRecord);

  // 5. Broadcast realtime notification to other connected players
  try {
    supabase.channel(`room:${gameId}:events`).send({
      type: 'broadcast',
      event: 'file_code_updated',
      payload: {
        gameId,
        fileId: updatedRecord.id,
        roomId: normRoom,
        fileName: updatedRecord.file_name,
        version: newVersion,
        playerId,
        timestamp: Date.now(),
      },
    });
  } catch {
    // Ignore broadcast error
  }

  return {
    success: true,
    file: updatedRecord,
    currentVersion: newVersion,
  };
}

/**
 * Controlled Bug Mutations
 */
export function applyControlledBugMutation(code: string): { mutatedCode: string; mutationType: string } {
  if (!code) {
    return { mutatedCode: '// CORRUPTED LOGIC\n', mutationType: 'EMPTY_CODE_CORRUPTION' };
  }

  // 1. Invert logical operators (&& to ||, || to &&)
  if (code.includes(' && ')) {
    return {
      mutatedCode: code.replace(' && ', ' || '),
      mutationType: 'INVERT_LOGICAL_AND',
    };
  }
  if (code.includes(' || ')) {
    return {
      mutatedCode: code.replace(' || ', ' && '),
      mutationType: 'INVERT_LOGICAL_OR',
    };
  }

  // 2. Invert sort comparator (a - b to b - a)
  if (code.includes('a - b')) {
    return {
      mutatedCode: code.replace('a - b', 'b - a'),
      mutationType: 'INVERT_SORT_COMPARATOR',
    };
  }
  if (code.includes('b - a')) {
    return {
      mutatedCode: code.replace('b - a', 'a - b'),
      mutationType: 'INVERT_SORT_COMPARATOR',
    };
  }

  // 3. Invert boolean return values
  if (code.includes('return true;')) {
    return {
      mutatedCode: code.replace('return true;', 'return false;'),
      mutationType: 'INVERT_RETURN_TRUE',
    };
  }
  if (code.includes('return false;')) {
    return {
      mutatedCode: code.replace('return false;', 'return true;'),
      mutationType: 'INVERT_RETURN_FALSE',
    };
  }

  // 4. Invert status strings
  if (code.includes('"READY"')) {
    return {
      mutatedCode: code.replace('"READY"', '"CRASHED"'),
      mutationType: 'ALTER_STATUS_READY',
    };
  }

  // 5. Invert comparison operators (> to <, >= to <=, < to >)
  if (code.includes(' > ')) {
    return {
      mutatedCode: code.replace(' > ', ' <= '),
      mutationType: 'INVERT_GREATER_THAN',
    };
  }
  if (code.includes(' >= ')) {
    return {
      mutatedCode: code.replace(' >= ', ' < '),
      mutationType: 'INVERT_GREATER_OR_EQUAL',
    };
  }
  if (code.includes(' < ')) {
    return {
      mutatedCode: code.replace(' < ', ' >= '),
      mutationType: 'INVERT_LESS_THAN',
    };
  }

  // 6. Invert equality checks (=== to !==, == to !=)
  if (code.includes(' === ')) {
    return {
      mutatedCode: code.replace(' === ', ' !== '),
      mutationType: 'INVERT_STRICT_EQUALITY',
    };
  }
  if (code.includes(' == ')) {
    return {
      mutatedCode: code.replace(' == ', ' != '),
      mutationType: 'INVERT_EQUALITY',
    };
  }

  // 7. Generic fallback: add off-by-one or comment sabotage
  return {
    mutatedCode: code + '\n// [SABOTAGED: UNEXPECTED_TOKEN]\n',
    mutationType: 'APPEND_SYNTAX_MUTATION',
  };
}

/**
 * Mafia Sabotage Action.
 * 
 * CRITICAL RULE:
 * ALWAYS fetches the latest authoritative file from Supabase first,
 * applies the bug mutation to that latest content, and saves as latestVersion + 1.
 * Mafia is NEVER blocked by a stale editor version!
 */
export async function sabotageSharedCode(params: {
  gameId: string;
  roomIdOrFileId: string;
  playerId: string;
  customMutatedCode?: string;
  customMutation?: (latestCode: string) => string;
}): Promise<SabotageCodeResult> {
  const { gameId, roomIdOrFileId, playerId, customMutatedCode, customMutation } = params;
  const normRoom = normalizeRoomId(roomIdOrFileId);
  const gameMap = getMemoryStoreForGame(gameId);

  // 1. Fetch latest authoritative file from Supabase
  const latestFile = await fetchLatestSharedFile(gameId, roomIdOrFileId);
  const previousVersion = latestFile.version;
  const newVersion = previousVersion + 1;

  // 2. Apply controlled bug mutation to the latest authoritative code
  let newContent: string;
  let mutationType = 'CUSTOM_MAFIA_MUTATION';

  if (customMutatedCode !== undefined) {
    newContent = customMutatedCode;
    mutationType = 'EXPLICIT_MAFIA_CODE';
  } else if (customMutation) {
    newContent = customMutation(latestFile.content);
    mutationType = 'FUNCTIONAL_MUTATION';
  } else {
    const res = applyControlledBugMutation(latestFile.content);
    newContent = res.mutatedCode;
    mutationType = res.mutationType;
  }

  const now = new Date().toISOString();

  const sabotagedRecord: SharedGameFile = {
    ...latestFile,
    content: newContent,
    version: newVersion,
    updated_by: playerId,
    updated_at: now,
  };

  // 3. Persist to Supabase
  try {
    const { data, error } = await supabase
      .from('game_files')
      .upsert(
        {
          id: latestFile.id || `${gameId}-${normRoom}`,
          game_id: gameId,
          room_id: normRoom,
          file_name: latestFile.file_name,
          content: newContent,
          version: newVersion,
          updated_by: playerId,
          updated_at: now,
        },
        { onConflict: 'game_id,room_id' }
      )
      .select()
      .single();

    if (!error && data) {
      sabotagedRecord.id = String(data.id || sabotagedRecord.id);
    }
  } catch {
    // Ignore in fallback
  }

  // 4. Update memory cache
  gameMap.set(normRoom, sabotagedRecord);
  gameMap.set(sabotagedRecord.file_name, sabotagedRecord);
  gameMap.set(`file-${normRoom}`, sabotagedRecord);

  // 5. Broadcast realtime notification
  try {
    supabase.channel(`room:${gameId}:events`).send({
      type: 'broadcast',
      event: 'file_code_updated',
      payload: {
        gameId,
        fileId: sabotagedRecord.id,
        roomId: normRoom,
        fileName: sabotagedRecord.file_name,
        version: newVersion,
        playerId,
        mutationType,
        timestamp: Date.now(),
      },
    });
  } catch {
    // Ignore
  }

  return {
    success: true,
    file: sabotagedRecord,
    previousVersion,
    newVersion,
    mutationType,
  };
}
