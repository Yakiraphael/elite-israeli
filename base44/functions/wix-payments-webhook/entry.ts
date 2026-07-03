import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

Deno.serve(async (req) => {
  try {
    const publicKey = Deno.env.get('PAYMENTS_BY_WIX_WEBHOOK_PUBLIC_KEY');
    if (!publicKey) {
      console.error('Missing PAYMENTS_BY_WIX_WEBHOOK_PUBLIC_KEY');
      return new Response('Missing public key', { status: 500 });
    }

    const body = await req.text();
    const rawPayload = jwt.verify(body, publicKey, { algorithms: ['RS256'] });
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    const base44 = createClientFromRequest(req);

    if (event.eventType === 'wix.ecom.v1.order_approved') {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;

      const payments = await base44.asServiceRole.entities.Payment.filter({ checkout_id: checkoutId });
      const payment = payments[0];
      if (payment && order.paymentStatus === 'PAID' && payment.status !== 'Paid') {
        await base44.asServiceRole.entities.Payment.update(payment.id, {
          status: 'Paid',
          paid_date: new Date().toISOString().slice(0, 10),
          transaction_id: order.id,
        });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('wix-payments-webhook error', error);
    return new Response('Error', { status: 500 });
  }
});