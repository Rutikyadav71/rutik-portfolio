/**
 * sendSecurityAlert.ts
 * Sends a brute-force alert email to the portfolio owner via EmailJS.
 * Uses the SAME EmailJS service/key as the contact form — no extra setup needed.
 * A NEW template is required (see README instructions below).
 */

export interface SecurityAlertPayload {
  unlockToken:  string
  attemptCount: number
  timestamp:    string
  userAgent:    string
}

export async function sendSecurityAlert(payload: SecurityAlertPayload): Promise<void> {
  const SVC  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  || ''
  const TPL  = process.env.NEXT_PUBLIC_EMAILJS_SECURITY_TEMPLATE_ID || ''
  const KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  || ''

  if (!SVC || !TPL || !KEY) {
    console.warn('[security] EmailJS not configured — alert not sent.')
    return
  }

  try {
    const emailjs = (await import('@emailjs/browser')).default
    const unlockUrl = `${window.location.origin}/?unlock=${payload.unlockToken}`

    await emailjs.send(SVC, TPL, {
      to_name:       'Rutik',
      to_email:      'rutikyadav2004@gmail.com',
      alert_time:    payload.timestamp,
      attempt_count: String(payload.attemptCount),
      user_agent:    payload.userAgent,
      unlock_url:    unlockUrl,
      unlock_token:  payload.unlockToken,
    }, KEY)
  } catch (err) {
    // Silent — security alert failure should never surface to the attacker
    console.warn('[security] Alert email failed:', err)
  }
}
