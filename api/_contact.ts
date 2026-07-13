import { getDbPool } from './_db.js';

// IP rate limiter for contact form submissions (3 per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many messages sent. Please wait a minute.' });
  }

  const { username, name, email, message } = req.body;
  if (!username || !name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const pool = getDbPool();
    const result = await pool.query(
      'SELECT profile_data FROM users_portfolios WHERE username = $1',
      [username.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient portfolio not found.' });
    }

    const profile = result.rows[0].profile_data;
    const recipientEmail = profile.socials?.email;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'This portfolio user has not configured a contact email.' });
    }

    // Attempt to send email via Resend if API key is provided
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: 'LabForge Portfolios <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `New Message from ${name} via LabForge`,
        html: `
          <h3>You received a new message from your portfolio:</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 4px solid #8b5cf6; padding-left: 15px; margin-left: 0; color: #4b5563;">
            ${message.replace(/\n/g, '<br/>')}
          </blockquote>
          <br/>
          <hr style="border: 0; border-top: 1px solid #e5e7eb;"/>
          <p style="font-size: 11px; color: #9ca3af;">This email was sent dynamically by Dalton LabForge CMS.</p>
        `
      });
      return res.status(200).json({ message: 'Message sent successfully via email!' });
    } else {
      // Diagnostic success fallback if RESEND_API_KEY is missing
      console.log(`[Contact Request Dev Simulation] Recipient: ${recipientEmail}, From: ${name} (${email}), Msg: ${message}`);
      return res.status(200).json({ 
        message: 'Message received! Configure RESEND_API_KEY on Vercel to receive emails.',
        devLogged: true 
      });
    }
  } catch (error: any) {
    console.error('Contact endpoint error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
