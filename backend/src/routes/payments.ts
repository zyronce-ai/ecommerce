import express, { Router, Request, Response } from 'express';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_placeholder') {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(key, { apiVersion: '2024-11-20.acacia' as any });
}

const router = Router();

router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency: 'inr' });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    if (event.type === 'payment_intent.succeeded') {
      console.log('[PAYMENT] Success:', event.data.object.id);
    }
    res.json({ received: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
