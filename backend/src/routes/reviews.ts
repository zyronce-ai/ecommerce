import { Router, Request, Response } from 'express';
import { Review } from '../../mongo/models/Review';
import { prisma } from '../index';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { name: true } });
    const review = await Review.create({ product: req.body.product, user: req.user!.id, name: user?.name || 'Anonymous', rating: req.body.rating, title: req.body.title, comment: req.body.comment });
    res.status(201).json(review);
  } catch (err: any) {
    if (err.code === 11000) {
      try { await Review.collection.dropIndex('productId_1_userId_1'); } catch {}
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
