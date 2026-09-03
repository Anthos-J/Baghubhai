# Database Schema

Do not overcomplicate the database. This is a minimal schema for the MVP.

## `rooms`
- **Purpose:** Tracks active game sessions.
- **Columns:**
  - `id` (UUID, PK)
  - `code` (String, Unique) - E.g., 'ABCD'
  - `host_id` (UUID) - User ID of the creator
  - `state` (String) - `LOBBY`, `ROLE_REVEAL`, `PLAYING`, `MEETING`, `VOTING`, `GAME_OVER`
  - `created_at` (Timestamp)

## `players`
- **Purpose:** Tracks users within a room.
- **Columns:**
  - `id` (UUID, PK)
  - `room_id` (UUID, FK to rooms)
  - `user_id` (UUID, FK to auth.users or anonymous session ID)
  - `name` (String)
  - `role` (String) - `DEVELOPER`, `MAFIA`, `null` (before assignment)
  - `status` (String) - `ALIVE`, `ELIMINATED`
  - `joined_at` (Timestamp)
- **RLS Considerations:**
  - `role` must be hidden from other players unless `status` == 'ELIMINATED' or `rooms.state` == 'GAME_OVER'.

## `files`
- **Purpose:** Tracks the current state of the codebase for a room.
- **Columns:**
  - `id` (UUID, PK)
  - `room_id` (UUID, FK to rooms)
  - `filename` (String) - e.g., 'auth.js'
  - `content` (Text) - The current code
  - `locked_by` (UUID, nullable) - For preventing concurrent edits if using a lock model.

## `tasks`
- **Purpose:** Tracks progress of developer goals.
- **Columns:**
  - `id` (UUID, PK)
  - `room_id` (UUID, FK to rooms)
  - `description` (String)
  - `target_file` (String)
  - `status` (String) - `PENDING`, `COMPLETED`

## `events`
- **Purpose:** Activity log for meetings and debugging.
- **Columns:**
  - `id` (UUID, PK)
  - `room_id` (UUID, FK to rooms)
  - `player_id` (UUID, FK to players, nullable)
  - `type` (String) - `FILE_EDITED`, `TEST_RUN`, `BUG_INJECTED`, `MEETING_CALLED`
  - `description` (String)
  - `created_at` (Timestamp)

## `votes`
- **Purpose:** Tracks votes during emergency meetings.
- **Columns:**
  - `id` (UUID, PK)
  - `room_id` (UUID, FK to rooms)
  - `voter_id` (UUID, FK to players)
  - `target_id` (UUID, FK to players, nullable) - Who they voted for; null for 'Skip'
  - `meeting_round` (Integer) - To group votes by specific meetings.
