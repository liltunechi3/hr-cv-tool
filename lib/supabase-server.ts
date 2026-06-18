import { createClient } from "@supabase/supabase-js";

// Supabase schema:
// create table evaluations (
//   id uuid primary key default gen_random_uuid(),
//   session_id text,
//   job_title text not null,
//   job_desc text not null,
//   qualifications jsonb not null,
//   cv_text text,
//   score integer not null,
//   summary text not null,
//   checklist jsonb not null,
//   lang text default 'id',
//   created_at timestamptz default now()
// );

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
