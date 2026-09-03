import { supabase } from './supabase';
import { LocalSession, PLAYER_COLORS } from '../types/game';

const SESSION_KEY = 'among_devs_session';
const USERNAME_KEY = 'among_devs_username';
const COLOR_KEY = 'among_devs_color';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Generate a random 5-character room code like "X7K2P"
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 5 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

/**
 * Pick a random neon color from the preset list.
 * In the future we can exclude colors already taken in the room.
 */
export function getRandomPlayerColor(): string {
  return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
}

// ──────────────────────────────────────────────
// Session persistence (localStorage)
// ──────────────────────────────────────────────

export function getSession(): LocalSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: LocalSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSavedUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function saveUsername(username: string): void {
  localStorage.setItem(USERNAME_KEY, username);
}

export function getSavedColor(): string | null {
  return localStorage.getItem(COLOR_KEY);
}

export function saveColor(color: string): void {
  localStorage.setItem(COLOR_KEY, color);
}

// ──────────────────────────────────────────────
// Room CRUD
// ──────────────────────────────────────────────

/**
 * Create a new room and register the creator as player 1 (host).
 * Returns the session data with room & player IDs.
 */
export async function createRoom(
  username: string,
  color: string
): Promise<LocalSession> {
  // 1. Generate a unique room code
  const roomCode = generateRoomCode();

  // 2. Insert into rooms table
  const { data: roomData, error: roomError } = await supabase
    .from('rooms')
    .insert({ code: roomCode, phase: 'LOBBY' })
    .select()
    .single();

  if (roomError || !roomData) {
    console.error('Failed to create room:', roomError);
    throw new Error(roomError?.message || 'Failed to create room.');
  }

  const roomId = roomData.id;

  // 3. Insert the player as host
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert({
      room_id: roomId,
      username,
      color,
      alive: true,
      is_host: true,
    })
    .select()
    .single();

  if (playerError || !playerData) {
    console.error('Failed to create player:', playerError);
    throw new Error(playerError?.message || 'Failed to register player.');
  }

  // 4. Build & persist session
  const session: LocalSession = {
    playerId: playerData.id,
    roomId,
    roomCode,
    username,
    color,
    isHost: true,
  };

  saveSession(session);
  saveUsername(username);
  saveColor(color);

  return session;
}

/**
 * Join an existing room by its 5-character code.
 * The room must be in LOBBY phase (not already started).
 */
export async function joinRoom(
  username: string,
  color: string,
  roomCode: string
): Promise<LocalSession> {
  // 1. Find the room by code
  const { data: roomData, error: roomError } = await supabase
    .from('rooms')
    .select()
    .eq('code', roomCode.toUpperCase())
    .eq('phase', 'LOBBY')
    .single();

  if (roomError || !roomData) {
    throw new Error('Room not found or game already started.');
  }

  const roomId = roomData.id;

  // 2. Check if room is full (max 10 players)
  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId);

  if (count !== null && count >= 10) {
    throw new Error('Room is full (max 10 players).');
  }

  // 3. Insert the player as non-host
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert({
      room_id: roomId,
      username,
      color,
      alive: true,
      is_host: false,
    })
    .select()
    .single();

  if (playerError || !playerData) {
    console.error('Failed to join room:', playerError);
    throw new Error(playerError?.message || 'Failed to join room.');
  }

  // 4. Build & persist session
  const session: LocalSession = {
    playerId: playerData.id,
    roomId,
    roomCode: roomCode.toUpperCase(),
    username,
    color,
    isHost: false,
  };

  saveSession(session);
  saveUsername(username);
  saveColor(color);

  return session;
}

/**
 * Leave the current room. Deletes the player record from Supabase
 * and clears the local session.
 */
export async function leaveRoom(): Promise<void> {
  const session = getSession();
  if (!session) return;

  // Delete player from DB
  await supabase
    .from('players')
    .delete()
    .eq('id', session.playerId);

  clearSession();
}

/**
 * Fetch all players currently in a room.
 */
export async function fetchRoomPlayers(roomId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', roomId);

  if (error) {
    console.error('Failed to fetch players:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch room details by ID.
 */
export async function fetchRoom(roomId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) {
    console.error('Failed to fetch room:', error);
    return null;
  }

  return data;
}

/**
 * Update the game phase for a room (host-only action).
 */
export async function updateRoomPhase(roomId: string, phase: string) {
  const { error } = await supabase
    .from('rooms')
    .update({ phase })
    .eq('id', roomId);

  if (error) {
    console.error('Failed to update room phase:', error);
    throw new Error('Failed to update game phase.');
  }
}
