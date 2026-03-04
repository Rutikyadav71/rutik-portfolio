import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    // ── Validation ────────────────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    if (message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 })
    }

    // ── Supabase save (optional — gracefully skip if not configured) ──────
    if (!isSupabaseConfigured) {
      console.warn(
        '[contact] Supabase not configured — skipping DB save.\n' +
        'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
      )
      // Still return success — EmailJS already sent the email to the inbox
      return NextResponse.json(
        { success: true, message: 'Message received! (DB backup skipped — Supabase not configured)' },
        { status: 201 }
      )
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert([{
        name:    name.trim(),
        email:   email.trim().toLowerCase(),
        message: message.trim(),
      }])

    if (error) {
      // Log details server-side but return a clean message to the client
      console.error('[contact] Supabase insert error:', error.message)
      // Don't fail the whole request — EmailJS already delivered the email
      return NextResponse.json(
        { success: true, message: 'Message sent! (DB backup failed — check Supabase config)' },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Message sent and saved successfully!' },
      { status: 201 }
    )

  } catch (err: any) {
    console.error('[contact] Unexpected error:', err?.message ?? err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
