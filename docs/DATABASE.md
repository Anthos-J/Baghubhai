# Database Schema

Do not overcomplicate the database. This is a minimal schema for the MVP.

## `rooms`
- `id` (UUID, PK)
- `room_code` (String, Unique)
- `host_id` (UUID)
- `status` (String) - e.g., LOBBY, PLAYING, MEETING
- `max_players` (Integer)
- `created_at` (Timestamp)

## `players`
- `id` (UUID, PK)
- `room_id` (UUID, FK to rooms)
- `username` (String)
- `avatar` (String)
- `role` (String) - DEVELOPER, MAFIA
- `alive` (Boolean)
- `connected` (Boolean)
- `joined_at` (Timestamp)
*Security:* Role must be hidden from other players via RLS until the game ends.

## `files`
- `id` (UUID, PK)
- `room_id` (UUID, FK to rooms)
- `filename` (String)
- `language` (String)
- `content` (Text)
- `updated_by` (UUID)
- `updated_at` (Timestamp)

## `tasks`
- `id` (UUID, PK)
- `room_id` (UUID, FK to rooms)
- `title` (String)
- `description` (Text)
- `file_name` (String)
- `assigned_player` (UUID, nullable)
- `completed` (Boolean)
- `completed_by` (UUID, nullable)

## `events`
- `id` (UUID, PK)
- `room_id` (UUID, FK to rooms)
- `player_id` (UUID, nullable)
- `event_type` (String) - e.g., FILE_EDITED, TEST_RUN, BUG_INJECTED, MEETING_CALLED
- `file_name` (String, nullable)
- `metadata` (JSONB)
- `created_at` (Timestamp)

## `votes`
- `id` (UUID, PK)
- `room_id` (UUID, FK to rooms)
- `meeting_id` (UUID, nullable)
- `voter_id` (UUID, FK to players)
- `target_id` (UUID, FK to players, nullable)
