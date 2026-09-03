# PERSON 3 — BACKEND + REALTIME + MULTIPLAYER

## Section 1 — Role
You are the Backend Lead and Integration Owner. You manage the Supabase instance, PostgreSQL schema, Row Level Security (RLS), and Realtime synchronization. You provide the authoritative multiplayer infrastructure.

## Section 2 — Responsibilities
- Supabase Project Setup and Database Schema (Rooms, Players, Files, Tasks, Events, Votes, Meetings).
- Authoritative Game State persistence.
- **Realtime Player Movement:** Broadcast and receive player X/Y coordinates via Supabase Realtime Channels.
- Presence (who is online/disconnected).
- File sync (broadcasting code changes).
- Secure role handling (a client only receives their own role).
- RLS Policies to prevent cheating (e.g., voting twice, faking roles).
- Deployment and Integration.

## Section 3 — Dependencies
- **Person 1 (Frontend):** Sends local player movement to you; you broadcast it to other clients.
- **Person 2 (Editor):** Uses your file sync to share code changes.
- **Person 4 (Game Engine):** Uses your infrastructure to persist game states (votes, elimination).

## Section 4 — Files/components expected to work on
```
src/lib/*
src/hooks/useRealtime.ts
supabase/*
src/types/*
```

## Section 5 — Implementation Phases
1. **Rooms & Players:** Create/join logic, player records (id, room_id, x, y, direction, alive, role).
2. **Secure Roles:** Ensure roles are assigned securely and hidden from other clients via RLS.
3. **Game State:** Manage phases (LOBBY, PLAYING, MEETING, GAME_OVER).
4. **Realtime Movement:** Implement `broadcastPlayerMovement` using Supabase Realtime Broadcast. DO NOT write movement to the database every frame.
5. **Presence:** Track connections and handle disconnects.
6. **File Sync & Tasks:** Sync code changes across clients and persist task completion.
7. **Events & Meetings:** Store activity logs (evidence) and handle voting transactions.

## Section 6 — Definition of Done
- [ ] Create/Join/Leave room
- [ ] Player sync and Presence
- [ ] Secure role distribution (RLS)
- [ ] Game state management
- [ ] Realtime movement broadcasting
- [ ] File syncing
- [ ] Tasks and Events persistence
- [ ] Meetings and Votes persistence
- [ ] Elimination and Winner state

## Section 7 — Important DON'Ts
- **DON'T** write player movement coordinates to a PostgreSQL table every animation frame (use Realtime Broadcast).
- **DON'T** expose secret roles in public player objects.
- **DON'T** rely on the frontend to enforce security. Use RLS.
