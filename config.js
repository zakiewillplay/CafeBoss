import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const SUPABASE_URL = 'https://udlmyspetkjzcdkfshgl.supabase.co';
export const SUPABASE_ANON_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbG15c3BldGtqemNka2ZzaGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODIzMDksImV4cCI6MjA5NDc1ODMwOX0.oQL6hbwjQlU_2h4xcbD-v1yl7EubMz90VpIpTPBwEM4'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
