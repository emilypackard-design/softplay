import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'

// Stripe calls this after a Checkout Session completes. Marks the buyer's
// profile as plan='founder' using the service-role key (bypasses RLS — this
// route has no user session, just Stripe's signed event).
export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!stripe || !webhookSecret || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Payments are not configured yet' }, { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    if (!signature) throw new Error('missing signature')
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return NextResponse.json({ error: `Signature verification failed: ${String(err)}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id || session.metadata?.supabase_user_id
    if (userId) {
      const supabase = createClient(supabaseUrl, serviceKey)
      const { error } = await supabase.from('profiles').update({
        plan: 'founder',
        stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
        purchased_at: new Date().toISOString(),
      }).eq('id', userId)
      if (error) console.error('Failed to mark founder plan:', error.message)
    }
  }

  return NextResponse.json({ received: true })
}
