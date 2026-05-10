export type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

/**
 * Read "public" env vars that are safe to expose to the browser.
 *
 * Important:
 * - Next.js only exposes variables prefixed with `NEXT_PUBLIC_` to the client.
 * - We keep this in a single module so missing/mis-typed envs fail loudly and consistently.
 */
export function getPublicEnv(): PublicEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Throwing here is intentional: it surfaces configuration mistakes immediately.
    throw new Error(
      "Missing env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env.local and restart `npm run dev`.",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

