import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.create({ data: req.body });
    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', authenticate, requireRole('ADMIN', 'VENDOR'), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const valid = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user!.role === 'VENDOR' && order.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
