import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((c) => ({
            name: c.name,
            value: c.value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((c) => {
            cookieStore.set({
              name: c.name,
              value: c.value,
              ...c.options,
            })
          })
        },
      },
    }
  )
}
