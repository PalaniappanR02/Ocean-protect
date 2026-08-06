import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// service-role client: verifies tokens and reads roles server-side only
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);