import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vqjozigzbwlecknmirwp.supabase.co';
// Clean up any trailing /rest/v1 if included in project URL
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxam96aWd6YndsZWNrbm1pcndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDQ4ODQsImV4cCI6MjEwNDAyMDg4NH0.M7MUe6ghHFA24wEXsfz8eO0zCXMxNaGNlqa8Xt8_-J8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

