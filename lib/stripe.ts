import Stripe from 'stripe'

// Server-only Stripe client. Never import this from a 'use client' file —
// it reads the secret key, which must never reach the browser.
let client: Stripe | null = null

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!client) client = new Stripe(key)
  return client
}

export const FOUNDER_PRICE_CENTS = 999
export const FOUNDER_SEAT_CAP = 200
