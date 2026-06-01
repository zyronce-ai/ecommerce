import { Router, Request, Response } from 'express';
import { Product } from '../../mongo/models/Product';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().populate('category').sort({ createdAt: -1 }).limit(50);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category').populate('reviews');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireRole('ADMIN', 'VENDOR'), async (req: Request, res: Response) => {
  try {
    const data = req.user!.role === 'VENDOR' ? { ...req.body, vendor: req.user!.id } : req.body;
    if (!data.slug && data.name) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, requireRole('ADMIN', 'VENDOR'), async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (req.user!.role === 'VENDOR' && product.vendor !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.body.name && !req.body.slug) req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireRole('ADMIN', 'VENDOR'), async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (req.user!.role === 'VENDOR' && product.vendor !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
