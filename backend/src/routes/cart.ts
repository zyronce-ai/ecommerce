import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const cart = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { cart: true } });
    res.json(cart?.cart || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add', authenticate, async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const existing = await prisma.cartItem.findFirst({ where: { userId: req.user!.id, productId } });
    if (existing) {
      const item = await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + (quantity || 1) } });
      return res.json(item);
    }
    const item = await prisma.cartItem.create({ data: { userId: req.user!.id, productId, quantity: quantity || 1 } });
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await prisma.cartItem.update({ where: { id: req.params.id }, data: { quantity: req.body.quantity } });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
