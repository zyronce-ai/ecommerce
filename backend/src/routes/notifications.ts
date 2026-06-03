import { Router, Request, Response } from 'express';
import { FCMToken } from '../models/FCMToken';
import { Notification } from '../models/Notification';
import { sendPushNotification } from '../utils/firebase-admin';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/token', async (req: Request, res: Response) => {
  try {
    const { token, userId, device } = req.body;
    if (!token || !userId) return res.status(400).json({ error: 'token and userId are required' });

    await FCMToken.findOneAndUpdate(
      { token },
      { userId, device: device || 'unknown' },
      { upsert: true, new: true }
    );
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
    const { userId, title, body, data, type, link } = req.body;
    if (!userId || !title || !body)
      return res.status(400).json({ error: 'userId, title, and body are required' });

    await Notification.create({ userId, title, body, data: data || {}, type: type || 'SYSTEM', link });

    const tokens = await FCMToken.find({ userId });
    if (tokens.length === 0) {
      return res.json({ success: true, sent: 0, invalid: 0, saved: true });
    }

    const results = await Promise.allSettled(
      tokens.map((t) => sendPushNotification(t.token, { title, body, data }))
    );

    const invalidTokens: string[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value === 'TOKEN_INVALID') invalidTokens.push(tokens[i].token);
    });
    if (invalidTokens.length > 0) await FCMToken.deleteMany({ token: { $in: invalidTokens } });

    res.json({ success: true, sent: tokens.length, invalid: invalidTokens.length, saved: true });
  } catch (err: any) {
    console.error('[notifications/send]', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

router.post('/broadcast', async (req: Request, res: Response) => {
  try {
    const { title, body, data, type, link } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'title and body are required' });

    const tokens = await FCMToken.find().distinct('token');
    if (tokens.length === 0) return res.status(404).json({ error: 'No registered tokens' });

    await Promise.allSettled(tokens.map((t) => sendPushNotification(t, { title, body, data })));

    const userIds = await FCMToken.find().distinct('userId');
    const notifDocs = userIds.map((uid: string) => ({
      userId: uid,
      title,
      body,
      data: data || {},
      type: type || 'SYSTEM',
      link,
    }));
    if (notifDocs.length > 0) await Notification.insertMany(notifDocs);

    res.json({ success: true, total: tokens.length, users: userIds.length });
  } catch (err: any) {
    console.error('[notifications/broadcast]', err);
    res.status(500).json({ error: 'Failed to broadcast' });
  }
});

router.get('/', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const limit = Math.min(parseInt(String(req.query.limit || '20'), 10), 100);
    const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);

    const [items, total, unread] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, read: false }),
    ]);

    res.json({ success: true, items, total, unread, limit, offset });
  } catch (err: any) {
    console.error('[notifications/list]', err);
    res.status(500).json({ error: 'Failed to list notifications' });
  }
});

router.get('/unread-count', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const count = await Notification.countDocuments({ userId, read: false });
    res.json({ success: true, count });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

router.patch('/:id/read', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { read: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true, notification: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

router.post('/mark-all-read', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, modified: result.modifiedCount || 0 });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

router.delete('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const deleted = await Notification.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
