import { NextResponse } from 'next/server'

// Keep-alive for Supabase. Free-tier projects pause after 7 days with no
// database activity. Vercel Cron (see vercel.json) hits this route once a day
// so the project never looks idle. It runs one tiny, harmless read and returns.
// This can be removed once the app has real, steady user traffic.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, reason: 'missing Supabase env vars' },
      { status: 500 },
    )
  }

  try {
    // A trivial read against the database. Row-Level Security returns no rows
    // to the anon key, but the query still counts as activity — which is all
    // we need to reset Supabase's 7-day idle timer.
    const res = await fetch(`${url}/rest/v1/saves?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      pinged: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, reason: String(err) },
      { status: 500 },
    )
  }
}
