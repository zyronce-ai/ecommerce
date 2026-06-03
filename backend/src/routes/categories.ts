import { Router, Request, Response } from 'express';
import { Category } from '../../mongo/models/Category';
import { Product } from '../../mongo/models/Product';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const productCounts = await Promise.all(
      categories.map((cat: any) =>
        Product.countDocuments({ category: cat._id, isActive: { $ne: false } })
      )
    );
    const result = categories.map((cat: any, i: number) => ({
      ...cat,
      productCount: productCounts[i],
    }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    if (!req.body.slug && req.body.name) req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    if (req.body.name && !req.body.slug) req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
