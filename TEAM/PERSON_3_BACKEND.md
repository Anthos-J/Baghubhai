# PERSON 3 — BACKEND / SUPABASE / REALTIME

## Section 1 — Role
You are the Backend Lead. You manage the Supabase instance, database schema, RLS, and Realtime synchronization. You also own integration and deployment to Vercel.

## Section 2 — Responsibilities
- Supabase project setup, Database schema, RLS
- Rooms, Players, Files, Tasks, Events, Votes
- Game state synchronization and Realtime subscriptions
- Secure role handling (ensuring Mafia identity is secret)
- Host permissions
- Deployment/integration owner

## Section 3 — Deliverables
- A functional Supabase backend with all required tables.
- RLS policies that prevent a client from querying other players' secret roles.
- React hooks/utility functions for the frontend to subscribe to game state changes and presence.

## Section 4 — Dependencies
- **Person 1 (Frontend):** Needs your React hooks to display data and trigger actions.
- **Person 2 (Editor):** Needs endpoints/channels to sync code changes and file presence.
- **Person 4 (Game Engine):** Needs database functions or Edge Functions to handle complex state transitions securely.

## Section 5 — Files/components they are expected to work on
```
supabase/
  migrations/
    001_initial_schema.sql
    002_rls_policies.sql
src/
  lib/
    supabase.ts
  hooks/
    useRoom.ts
    useGameState.ts
    useRealtime.ts
```

## Section 6 — Implementation order (18-Hour Hackathon Timeline)
- **HOUR 0-1:** Supabase project setup, environment variables.
- **HOUR 1-3:** Tables, RLS, Create room, Join room, Player sync.
- **HOUR 3:** FIRST INTEGRATION. Player A creates room, Player B joins. Both appear in lobby.
- **HOUR 3-5:** Connect UI to Supabase (getPlayers(), startGame(), getGameState()).
- **HOUR 5-7:** Connect File Tree -> Monaco -> Supabase -> Realtime.
- **HOUR 7-9:** Tasks + deterministic tests state synchronization.
- **HOUR 11-13:** Emergency meeting state, Chat, Activity log, Voting persistence.
- **HOUR 13-14:** Elimination, Ghost mode state, Victory state.
- **HOUR 15-16:** Deploy to Vercel. Multiplayer test across multiple browsers/devices.

## Section 7 — Definition of Done
- Database schema is fully deployed.
- RLS successfully blocks unauthorized queries (specifically role reading).
- Realtime channels successfully broadcast game state changes with minimal latency.
- Frontend developers can seamlessly use your provided hooks.

## Section 8 — Integration instructions
- Provide a clean API surface in `src/hooks/` and `src/lib/api.ts` so the frontend doesn't need to write raw Supabase queries.
- Clearly document the payload structure of Realtime events.

## CODE MAFIA VISUAL DESIGN SYSTEM
The game uses a **Pixel-Art Sci-Fi Control Room** aesthetic. 
You should preserve backend functionality and should not change backend design except where UI state/data requirements require it.
Do NOT introduce a separate visual style for your feature.

## Section 9 — Important DON'Ts
- **DON'T** overcomplicate the database. Normalize only where necessary.
- **DON'T** send every player's secret role to every browser. Server may store roles, but clients only receive their own role unless the game is over.
