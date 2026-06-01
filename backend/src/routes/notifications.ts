import { Router, Request, Response } from 'express';
import { FCMToken } from '../models/FCMToken';
import { sendPushNotification } from '../utils/firebase-admin';

const router = Router();

router.post('/token', async (req: Request, res: Response) => {
  try {
    const { token, userId, device } = req.body;
    if (!token || !userId) return res.status(400).json({ error: 'token and userId are required' });

    await FCMToken.findOneAndUpdate({ token }, { userId, device: device || 'unknown' }, { upsert: true, new: true });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save token' });
  }
});

router.delete('/token/:token', async (req: Request, res: Response) => {
  try {
    await FCMToken.findOneAndDelete({ token: req.params.token });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete token' });
  }
});

router.post('/send', async (req: Request, res: Response) => {
  try {
    const { userId, title, body, data } = req.body;
    if (!userId || !title || !body) return res.status(400).json({ error: 'userId, title, and body are required' });

    const tokens = await FCMToken.find({ userId });
    if (tokens.length === 0) return res.status(404).json({ error: 'No tokens found for user' });

    const results = await Promise.allSettled(tokens.map((t) => sendPushNotification(t.token, { title, body, data })));

    const invalidTokens: string[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value === 'TOKEN_INVALID') invalidTokens.push(tokens[i].token);
    });
    if (invalidTokens.length > 0) await FCMToken.deleteMany({ token: { $in: invalidTokens } });

    res.json({ success: true, sent: tokens.length, invalid: invalidTokens.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

router.post('/broadcast', async (req: Request, res: Response) => {
  try {
    const { title, body, data } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body are required' });

    const tokens = await FCMToken.find().distinct('token');
    if (tokens.length === 0) return res.status(404).json({ error: 'No registered tokens' });

    await Promise.allSettled(tokens.map((t) => sendPushNotification(t, { title, body, data })));
    res.json({ success: true, total: tokens.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to broadcast' });
  }
});

export default router;
