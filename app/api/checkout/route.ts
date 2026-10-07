import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe, FOUNDER_PRICE_CENTS, FOUNDER_SEAT_CAP } from '@/lib/stripe'

// Creates a Stripe Checkout Session for the $9.99 one-time Founding Membership.
// Requires a signed-in Supabase user (passed as a bearer token) so the webhook
// knows whose profile to mark as 'founder' after payment. The service-role
// client is required here since counting ALL founders (for the 200-seat cap)
// needs to bypass each user's own-row-only RLS policy.
export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!stripe || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Payments are not configured yet' }, { status: 500 })
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const supabase = createClient(supabaseUrl, serviceKey)
  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const user = userData.user

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle()
  if (profile?.plan === 'founder') {
    return NextResponse.json({ error: 'You already have a Founding Membership' }, { status: 400 })
  }

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('plan', 'founder')
  if ((count ?? 0) >= FOUNDER_SEAT_CAP) {
    return NextResponse.json({ error: 'Founding Membership is sold out' }, { status: 400 })
  }

  const origin = req.headers.get('origin') || 'https://mysoftplay.app'
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: FOUNDER_PRICE_CENTS,
        product_data: {
          name: 'softplay Founding Membership',
          description: 'One-time, lifetime access to softplay Unlimited (Playground saves, Playbill memory, Play On itineraries).',
        },
      },
      quantity: 1,
    }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id },
    success_url: `${origin}/account?upgraded=1`,
    cancel_url: `${origin}/upgrade?canceled=1`,
  })

  return NextResponse.json({ url: session.url })
}
