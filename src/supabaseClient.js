import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ipzvtaabikvawmicesbj.supabase.co'; // 복사한 Project URL 입력
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwenZ0YWFiaWt2YXdtaWNlc2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MTI0MzgsImV4cCI6MjEwMTQ4ODQzOH0.fyZzGhpABnj7Otqe0tzg88_weQVqlvLF2pnIPXe0QXc'; // 복사한 anon public Key 입력

export const supabase = createClient(supabaseUrl, supabaseAnonKey);