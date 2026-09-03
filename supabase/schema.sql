-- ==========================================
-- AMONG DEVS: Supabase Database Schema
-- ==========================================

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    phase VARCHAR(20) DEFAULT 'LOBBY' NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    alive BOOLEAN DEFAULT TRUE,
    role VARCHAR(20), -- 'DEVELOPER' or 'MAFIA'
    is_host BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES players(id) ON DELETE CASCADE,
    target_id UUID REFERENCES players(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Row Level Security (RLS) Setup
-- We want to secure the 'role' column so only the player themselves can see it unless they are dead or the game is over.

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Rooms: Anyone can read, only anon can insert/update for now (in a real app you might lock this down more)
CREATE POLICY "Enable read access for all users" ON rooms FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON rooms FOR UPDATE USING (true);

-- Players: Anyone can read players, but we should eventually secure the role column. 
-- Supabase doesn't support column-level SELECT policies easily, so we usually handle this via a view or edge function.
-- For the hackathon MVP, we allow open access but filter on the client, OR we use a secure view.
CREATE POLICY "Enable read access for all users" ON players FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON players FOR UPDATE USING (true);

-- Tasks & Votes
CREATE POLICY "Enable all access" ON tasks FOR ALL USING (true);
CREATE POLICY "Enable all access" ON votes FOR ALL USING (true);

-- 3. Enable Realtime on tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
