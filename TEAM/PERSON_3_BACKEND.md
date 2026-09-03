# PERSON 3 — BACKEND / SUPABASE / REALTIME

## Section 1 — Role
You are the Backend Lead. You manage the Supabase instance, database schema, Row Level Security (RLS), and Realtime synchronization. Your primary goal is to ensure the game state is synchronized across all clients securely and efficiently.

## Section 2 — Responsibilities
- Supabase project setup and configuration
- Database schema and SQL migrations
- Row Level Security (RLS) policies
- Room creation and joining logic
- Player management and Host permissions
- Game creation and synchronized Game state
- Realtime subscriptions (Presence, Database changes)
- Secure role handling (ensuring Mafia identity is secret)
- Event logging (Audit trail)
- Voting persistence and Elimination state
- Win condition state storage

## Section 3 — Deliverables
- A functional Supabase backend with `rooms`, `players`, `files`, `tasks`, `events`, and `votes` tables.
- RLS policies that prevent a client from querying other players' secret roles.
- React hooks/utility functions for the frontend to subscribe to game state changes and presence.

## Section 4 — Dependencies
- **Person 1 (Frontend):** Needs your React hooks to display data and trigger actions (e.g., `useGameState()`, `joinRoom()`).
- **Person 2 (Editor):** Needs endpoints/channels to sync code changes (e.g., `updateFile()`) and file presence.
- **Person 4 (Game Engine):** Needs database functions or Edge Functions to handle complex state transitions (like role assignment) securely.

## Section 5 — Files/components they are expected to work on
```
supabase/
  migrations/
    001_initial_schema.sql
    002_rls_policies.sql
  functions/ (if using Edge Functions)
src/
  lib/
    supabase.ts
  hooks/
    useRoom.ts
    useGameState.ts
    useRealtime.ts
```

## Section 6 — Implementation order
- **Phase 1:** Supabase project setup, Database schema, SQL migrations.
- **Phase 2:** Rooms and Players logic, RLS setup.
- **Phase 3:** Game state synchronization, Realtime subscriptions, Secure role access.
- **Phase 4:** Player presence, Host permissions.
- **Phase 5:** Votes, Elimination state, Event logging.

## Section 7 — Definition of Done
- Database schema is fully deployed.
- RLS successfully blocks unauthorized queries (specifically role reading).
- Realtime channels successfully broadcast game state changes with minimal latency.
- Frontend developers can seamlessly use your provided hooks.

## Section 8 — Integration instructions
- Provide a clean API surface in `src/hooks/` and `src/lib/api.ts` so the frontend doesn't need to write raw Supabase queries.
- Clearly document the payload structure of Realtime events.

## Section 9 — Important DON'Ts
- **DON'T** overcomplicate the database. Normalize only where necessary; this is an MVP.
- **DON'T** rely on the frontend to assign roles securely. Role assignment MUST happen on the backend (via an Edge Function or Postgres Function) so clients cannot inspect the network traffic to see who is Mafia.
