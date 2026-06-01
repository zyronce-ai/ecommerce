import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const items = await prisma.wishlistItem.findMany({ where: { userId: req.user!.id } });
    res.json(items);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/add', authenticate, async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId: req.user!.id, productId } } });
    if (existing) return res.json(existing);
    const item = await prisma.wishlistItem.create({ data: { userId: req.user!.id, productId } });
    res.status(201).json(item);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:productId', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId: req.user!.id, productId: req.params.productId } } });
    if (item) await prisma.wishlistItem.delete({ where: { id: item.id } });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
