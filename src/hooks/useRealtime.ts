import { useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useMockStore } from '../store/mockStore';
import { Player } from '../types/game';

// ──────────────────────────────────────────────
// PRESENCE — track who is online in a room
// ──────────────────────────────────────────────
export function useGamePresence(roomId: string, playerId: string) {
  useEffect(() => {
    if (!roomId || !playerId) return;

    const channel = supabase.channel(`room:${roomId}:presence`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlinePlayerIds = Object.values(state).flatMap((presences) =>
          presences.map((p: any) => p.playerId)
        );
        useMockStore.getState().updatePresence(onlinePlayerIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            playerId,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, playerId]);
}

// ──────────────────────────────────────────────
// MOVEMENT — broadcast and receive X/Y via Broadcast (not DB writes)
// ──────────────────────────────────────────────
export function usePlayerMovement(roomId: string, playerId: string) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!roomId || !playerId) return;

    const channel = supabase.channel(`room:${roomId}:movement`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'move' }, ({ payload }) => {
        if (payload.playerId !== playerId) {
          useMockStore
            .getState()
            .updatePlayerPosition(
              payload.playerId,
              payload.x,
              payload.y,
              payload.direction
            );
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [roomId, playerId]);

  // Stable broadcast function that reuses the subscribed channel
  const broadcastMovement = useCallback(
    async (x: number, y: number, direction: string) => {
      if (!playerId) return;

      // Update local state instantly
      useMockStore.getState().updatePlayerPosition(playerId, x, y, direction as any);

      // Broadcast to other clients via the existing channel
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'move',
          payload: { playerId, x, y, direction },
        });
      }
    },
    [playerId]
  );

  return { broadcastMovement };
}

// ──────────────────────────────────────────────
// GAME STATE — listen for DB changes (players joining/leaving, phase changes)
// ──────────────────────────────────────────────
export function useGameState(roomId: string) {
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`room:${roomId}:state`);

    channel
      // ── New player joins ──
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const p = payload.new;
          const newPlayer: Player = {
            id: p.id,
            room_id: p.room_id,
            username: p.username,
            color: p.color,
            x: 1000,
            y: 750,
            direction: 'down',
            alive: p.alive ?? true,
            connected: true,
            is_host: p.is_host ?? false,
          };
          useMockStore.getState().addPlayer(newPlayer);
        }
      )
      // ── Player leaves / deleted ──
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.old?.id) {
            useMockStore.getState().removePlayer(payload.old.id);
          }
        }
      )
      // ── Player updated (e.g. alive → false after elimination) ──
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('Player update received:', payload);
          // Update the player's alive / role status in the store
          const updated = payload.new;
          const store = useMockStore.getState();
          const existingPlayers = store.players.map((p) => {
            if (p.id === updated.id) {
              return {
                ...p,
                alive: updated.alive ?? p.alive,
                is_host: updated.is_host ?? p.is_host,
              };
            }
            return p;
          });
          store.setRoomPlayers(existingPlayers);
        }
      )
      // ── Room phase change (LOBBY → ROLE_REVEAL → PLAYING → etc.) ──
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.new?.phase) {
            useMockStore.getState().setGamePhase(payload.new.phase);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);
}
