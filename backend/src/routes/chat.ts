import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/conversations/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user!.id !== req.params.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: req.params.userId }, { receiverId: req.params.userId }] },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true, name: true } }, receiver: { select: { id: true, name: true } } },
    });
    const userId = req.params.userId;
    const convMap = new Map<string, { userId: string; name: string; lastMsg: string; lastTime: Date }>();
    for (const m of messages) {
      const otherId = m.senderId === userId ? m.receiverId : m.senderId;
      const otherName = m.senderId === userId ? m.receiver.name : m.sender.name;
      if (!convMap.has(otherId)) {
        convMap.set(otherId, { userId: otherId, name: otherName, lastMsg: m.text, lastTime: m.createdAt });
      }
    }
    res.json(Array.from(convMap.values()));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: req.params.userId }, { receiverId: req.params.userId }] },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const message = await prisma.message.create({ data: req.body });
    res.status(201).json(message);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
