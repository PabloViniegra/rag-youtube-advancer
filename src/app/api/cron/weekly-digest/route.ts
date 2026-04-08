import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateWeeklyDigest } from '@/lib/weekly-digest'

function getWeekStart(now: Date): string {
  const d = new Date(now)
  const day = d.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization') ?? ''
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const weekStart = getWeekStart(now)
  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString()

  const { data: rows, error: fetchError } = await supabaseAdmin
    .from('videos')
    .select('user_id, title')
    .gte('created_at', sevenDaysAgo)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const userTitles = new Map<string, string[]>()
  for (const row of rows ?? []) {
    if (!row.user_id) continue
    const list = userTitles.get(row.user_id) ?? []
    list.push(row.title ?? 'Untitled')
    userTitles.set(row.user_id, list)
  }

  let processed = 0
  let errors = 0

  for (const [userId, titles] of userTitles) {
    try {
      const digest = await generateWeeklyDigest(titles)
      await supabaseAdmin.from('weekly_digests').upsert(
        {
          user_id: userId,
          week_start: weekStart,
          topics: digest.topics,
          connections: digest.connections,
          suggested_questions: digest.suggestedQuestions,
          dismissed_at: null,
        },
        { onConflict: 'user_id,week_start' },
      )
      processed++
    } catch {
      errors++
    }
  }

  return NextResponse.json({ processed, errors })
}
