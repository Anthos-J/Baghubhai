# Architecture

Code Mafia relies on a client-heavy architecture synchronized via Supabase Realtime, with a PostgreSQL database ensuring persistence and security.

## High-Level Diagram

```text
       React Frontend (Vite, TS)
       [ UI, Editor, Game Engine State Eval ]
                 |
                 | (REST / WebSockets)
                 ↓
             Supabase
                 |
    ┌────────────┼────────────┐
    ↓            ↓            ↓
PostgreSQL   Realtime      Auth/Session
    |
    ↓
 Game state / files / tasks / events
```

## What belongs in Frontend
- **UI & Routing:** Rendering views based on the current game state.
- **Code Editor:** Monaco Editor rendering the current file state.
- **Test Evaluation:** The deterministic test runner evaluates the current codebase state locally (or via edge functions if needed).
- **Game Engine Logic:** State transitions and logic evaluation (though critical transitions must be verified by the backend).

## What belongs in Backend
- **Data Persistence:** Rooms, Players, Game State, Votes, Event logs.
- **Security & Authorization:** Role assignment MUST happen on the backend (via Postgres Functions/Triggers or Edge Functions) to prevent clients from intercepting network requests to see who is Mafia.
- **Realtime Sync:** Broadcasting file changes, presence (who is in what file), and state transitions.

## Synchronization Strategy
- **Game State:** Synced via Supabase Realtime Database changes.
- **Code Changes:** To prevent conflicts, we avoid complex CRDTs. Instead, we use either a basic file lock system (only one person edits a file at a time) or simple debounced string updates overwriting the file state in Supabase.
- **Presence:** Supabase Realtime Presence tracks who is online and which file they are viewing.

## Privacy & Security
- **Roles:** The `players` table has a `role` column. RLS policies are configured so that `SELECT` on `players.role` is only allowed if `auth.uid() == players.user_id` OR the game is in the `GAME_OVER` state.
- **Ghost Chat:** Only visible to other Ghosts.

## Event Recording
- An `events` table records critical actions (e.g., "Player X completed Task Y", "Emergency Meeting called by Z"). This is used for the meeting discussion phase.
- Mafia bug injections are recorded but obfuscated in the public log (e.g., "A bug appeared in auth.js") unless a Developer successfully tracks the activity.
