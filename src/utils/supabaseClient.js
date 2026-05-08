import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kvnvvvqpairjfauuuaks.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bnZ2dnFwYWlyamZhdXV1YWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODA2MjQsImV4cCI6MjA5MzY1NjYyNH0.-cQgZCniD86WlitI2E3DYj0-Mqks-Bui0rtlUNV8s2M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
