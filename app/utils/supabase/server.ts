// utils/supabase/server.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  }
);

export { supabaseAdmin };
