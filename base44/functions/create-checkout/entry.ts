import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { payment_id } = await req.json();
    if (!payment_id) return Response.json({ error: 'payment_id is required' }, { status: 400 });

    const payment = await base44.asServiceRole.entities.Payment.get(payment_id);
    if (!payment) return Response.json({ error: 'Payment not found' }, { status: 404 });
    if (payment.amount < 0.5) return Response.json({ error: 'הסכום נמוך מהמינימום המותר לסליקה (0.50)' }, { status: 400 });

    const origin = req.headers.get('origin') || req.headers.get('Origin');
    const apiKey = Deno.env.get('PAYMENTS_BY_WIX_API_KEY');
    const siteId = Deno.env.get('PAYMENTS_BY_WIX_SITE_ID');

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
          postFlowUrl: `${origin}/director`,
          thankYouPageUrl: `${origin}/director?payment=success`,
        },
      }),
    });

    const data = await wixRes.json();
    if (!wixRes.ok) {
      console.error('Wix checkout error', data);
      return Response.json({ error: data.message || 'שגיאה ביצירת קישור תשלום' }, { status: 500 });
    }

    await base44.asServiceRole.entities.Payment.update(payment_id, { checkout_id: data.checkoutSession.id });

    return Response.json({ redirectUrl: data.checkoutSession.redirectUrl });
  } catch (error) {
    console.error('create-checkout error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});