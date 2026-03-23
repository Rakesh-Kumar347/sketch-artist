import { createClient } from "@supabase/supabase-js";

/** Browser / client-side client (anon key) */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder"
);

/** Server-side admin client (service role — bypasses RLS) */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Verify a Bearer token from an API request — returns user or null */
export async function verifyToken(token: string) {
  const { data: { user }, error } = await createAdminClient().auth.getUser(token);
  return error ? null : user;
}
