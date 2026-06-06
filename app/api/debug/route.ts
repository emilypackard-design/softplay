import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY
  return NextResponse.json({
    keyPresent: !!key,
    keyLength: key?.length ?? 0,
    keyStart: key ? key.substring(0, 10) + '...' : 'missing',
  })
}
