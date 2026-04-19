import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Biarkan Supabase handle cookie
          return document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
        },
        set(name: string, value: string, options: any) {
          document.cookie = `${name}=${value}; path=/; max-age=${options.maxAge || 60 * 60 * 24 * 7}`
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        },
      },
    }
  )
}