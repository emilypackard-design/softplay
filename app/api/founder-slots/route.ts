import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FOUNDER_SEAT_CAP } from '@/lib/stripe'

// Public read of how many of the 200 founder seats remain, for the /upgrade
// page. Uses the service-role key since counting ALL founders needs to
// bypass each user's own-row-only RLS policy.
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ remaining: FOUNDER_SEAT_CAP, cap: FOUNDER_SEAT_CAP })
  }
  const supabase = createClient(supabaseUrl, serviceKey)
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('plan', 'founder')
  const remaining = Math.max(0, FOUNDER_SEAT_CAP - (count ?? 0))
  return NextResponse.json({ remaining, cap: FOUNDER_SEAT_CAP })
}
