import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ipzvtaabikvawmicesbj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9O3XIdFYk9DwgPiuh0avHw_f4KYWEtF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);