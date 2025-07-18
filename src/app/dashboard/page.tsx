import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div>
      <h1>Benvenuto, {user?.email}!</h1>
    </div>
  )
}
