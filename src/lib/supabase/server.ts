// src/lib/supabase/server.ts
import { createServerClient, CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // leggi un singolo cookie
        get(name: string) {
          return cookies().get(name)?.value
        },
        // leggi tutti i cookie in un array { name, value }
        getAll() {
          return cookies()
            .getAll()
            .map((c) => ({ name: c.name, value: c.value }))
        },
        // imposta un singolo cookie
        set(name: string, value: string, options?: CookieOptions) {
          cookies().set({ name, value, ...options })
        },
        // imposta più cookie da un array { name, value, options? }
        setAll(items: { name: string; value: string; options?: CookieOptions }[]) {
          items.forEach(({ name, value, options }) =>
            cookies().set({ name, value, ...options })
          )
        },
        // rimuovi un cookie
        remove(name: string, options?: CookieOptions) {
          cookies().delete(name, options)
        },
      },
    }
  )
