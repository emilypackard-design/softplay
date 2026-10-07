import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Self-serve redemption for comp'd beta testers — sets plan='founder' without
// going through Stripe. Codes are created manually (SQL insert into
// comp_codes) by Emily, one per tester. Uses the service-role key since
// comp_codes has zero client RLS policies (deny-all) and profiles.plan can
// only be set by a service-role caller (see protect_profile_billing_fields).
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Not configured yet' }, { status: 500 })
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { code } = await req.json().catch(() => ({ code: undefined }))
  const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : ''
  if (!normalizedCode) return NextResponse.json({ error: 'Enter a code' }, { status: 400 })

  const supabase = createClient(supabaseUrl, serviceKey)
  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const user = userData.user

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle()
  if (profile?.plan === 'founder') {
    return NextResponse.json({ error: 'You already have a Founding Membership' }, { status: 400 })
  }

  const { data: comp } = await supabase.from('comp_codes').select('code, redeemed_by').eq('code', normalizedCode).maybeSingle()
  if (!comp) return NextResponse.json({ error: 'That code isn\'t valid' }, { status: 400 })
  if (comp.redeemed_by) return NextResponse.json({ error: 'That code has already been used' }, { status: 400 })

  const { error: redeemErr } = await supabase.from('comp_codes')
    .update({ redeemed_by: user.id, redeemed_at: new Date().toISOString() })
    .eq('code', normalizedCode)
    .is('redeemed_by', null)
  if (redeemErr) return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })

  const { error: planErr } = await supabase.from('profiles')
    .update({ plan: 'founder', purchased_at: new Date().toISOString() })
    .eq('id', user.id)
  if (planErr) return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
