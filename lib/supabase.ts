import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient(): ReturnType<typeof createBrowserClient> {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "Supabase browser auth is not configured. Expected NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  browserClient = createBrowserClient(supabaseUrl, publishableKey);
  return browserClient;
}