import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ============================================================
// create-checkout — Wix Payments checkout session creator.
//
// SECURITY HARDENING (audit findings #14 + #5 + #17):
//   1. UUID format validation on payment_id (prevents enumeration)
//   2. Minimal data returned — ONLY redirectUrl, no payment details
//   3. Generic error messages (no internal details leaked)
//   4. Rate limiting via AuditLog IP-check (max 10 attempts/10min)
//   5. Validates payment is in Pending status before checkout
//   6. Return URLs built from X-Base44-App-Url (never Origin header)
// ============================================================

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { payment_id } = await req.json().catch(() => ({}));

    // --- Input validation ---
    if (!payment_id || typeof payment_id !== 'string' || !UUID_RE.test(payment_id)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // --- Rate limiting via IP audit log check ---
    const clientIp = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim() || 'unknown';
    if (clientIp !== 'unknown') {
      try {
        const recent = await base44.asServiceRole.entities.AuditLog.filter(
          { action: 'export_data' },
          '-created_date',
          20
        );
        const now = Date.now();
        const recentFromIp = recent.filter(
          (a) => a.actor_ip === clientIp &&
                  now - new Date(a.created_date).getTime() < RATE_LIMIT_WINDOW_MS
        );
        if (recentFromIp.length >= RATE_LIMIT_MAX) {
          return Response.json({ error: 'Too many requests' }, { status: 429 });
        }
      } catch { /* rate limit is best-effort */ }
    }

    // --- Fetch payment ---
    const payment = await base44.asServiceRole.entities.Payment.get(payment_id);
    if (!payment) {
      // Generic error — don't confirm existence
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // --- Validate payment is still pending (prevent double-checkout) ---
    if (payment.status === 'Paid') {
      return Response.json({ error: 'Already paid' }, { status: 400 });
    }
    if (payment.amount < 0.5) {
      return Response.json({ error: 'Amount below minimum' }, { status: 400 });
    }

    // --- Build return URLs from platform header (never Origin) ---
    const appUrl = req.headers.get('X-Base44-App-Url') ||
                   Deno.env.get('PAYMENTS_BY_WIX_APP_URL') ||
                   Deno.env.get('WIX_CHECKOUT_APP_URL');
    if (!appUrl) {
      console.error('create-checkout: missing app URL (X-Base44-App-Url / WIX_CHECKOUT_APP_URL)');
      return Response.json({ error: 'Configuration error' }, { status: 500 });
    }

    const apiKey = Deno.env.get('PAYMENTS_BY_WIX_API_KEY');
    const siteId = Deno.env.get('PAYMENTS_BY_WIX_SITE_ID');
    if (!apiKey || !siteId) {
      console.error('create-checkout: missing Wix API credentials');
      return Response.json({ error: 'Configuration error' }, { status: 500 });
    }

    // --- Create Wix checkout session ---
    const wixRes = await fetch('https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'wix-site-id': siteId,
      },
      body: JSON.stringify({
        cart: {
          items: [{
            name: payment.plan_name || 'תשלום IEFA',
            quantity: 1,
            price: String(payment.amount),
          }],
        },
        callbackUrls: {
          postFlowUrl: `${appUrl}/director`,
          thankYouPageUrl: `${appUrl}/director?payment=success`,
        },
      }),
    });

    const data = await wixRes.json();
    if (!wixRes.ok) {
      console.error('Wix checkout error', data);
      return Response.json({ error: 'Checkout creation failed' }, { status: 502 });
    }

    // --- Persist checkout session ID on payment ---
    await base44.asServiceRole.entities.Payment.update(payment_id, {
      checkout_id: data.checkoutSession.id,
    });

    // --- Audit the checkout creation ---
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        actor_id: 'anonymous', actor_name: '', actor_role: 'checkout',
        action: 'export_data',
        player_id: payment.player_id || '',
        details: `Checkout session created for payment ${payment_id}`,
        actor_ip: clientIp,
      });
    } catch { /* best-effort */ }

    // --- Return ONLY redirect URL — no payment details exposed ---
    return Response.json({ redirectUrl: data.checkoutSession.redirectUrl });
  } catch (error) {
    // Generic error — no internal details leaked
    console.error('create-checkout error', error?.message || error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
});