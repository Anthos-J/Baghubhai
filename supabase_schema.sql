-- =============================================================================
-- CODE MAFIA — SUPABASE SHARED CODE & SABOTAGE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query -> Run)
-- =============================================================================

-- 1. Shared Game Files (Authoritative source of truth for Monaco & Room Editor)
CREATE TABLE IF NOT EXISTS public.game_files (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    updated_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT game_files_game_room_unique UNIQUE (game_id, room_id)
);

-- Index for fast lookup by game and room
CREATE INDEX IF NOT EXISTS idx_game_files_game_room ON public.game_files (game_id, room_id);
CREATE INDEX IF NOT EXISTS idx_game_files_game_file ON public.game_files (game_id, file_name);

-- Row Level Security (RLS) policies
ALTER TABLE public.game_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on game_files" ON public.game_files;
CREATE POLICY "Allow all operations on game_files"
ON public.game_files
FOR ALL
USING (true)
WITH CHECK (true);


-- 2. Sabotage Triggers (Private triggers generated when Crewmate solves a task)
CREATE TABLE IF NOT EXISTS public.sabotage_triggers (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    target_room_id TEXT NOT NULL,
    target_file_id TEXT NOT NULL,
    target_file_name TEXT NOT NULL,
    target_room_label TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    used_by TEXT,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sabotage_triggers_game_active ON public.sabotage_triggers (game_id, active);

ALTER TABLE public.sabotage_triggers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on sabotage_triggers" ON public.sabotage_triggers;
CREATE POLICY "Allow all operations on sabotage_triggers"
ON public.sabotage_triggers
FOR ALL
USING (true)
WITH CHECK (true);


-- 3. Game Events Audit Trail
CREATE TABLE IF NOT EXISTS public.game_events (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    player_id TEXT,
    room_id TEXT,
    file_id TEXT,
    file_name TEXT,
    previous_version INTEGER,
    new_version INTEGER,
    mutation_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_events_game ON public.game_events (game_id);

ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on game_events" ON public.game_events;
CREATE POLICY "Allow all operations on game_events"
ON public.game_events
FOR ALL
USING (true)
WITH CHECK (true);


-- 4. Enable Realtime Publications (for instant live sync across players)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'game_files'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_files;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'sabotage_triggers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sabotage_triggers;
  END IF;
END $$;
