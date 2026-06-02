import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { prisma } from '../index';
import { Product } from '../../mongo/models/Product';
import { authenticate, requireRole } from '../middleware/auth';
import { syncProduct, removeProduct } from '../utils/typesense';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    const products = await Product.find({ isActive: { $ne: false } }).populate('category').sort({ createdAt: -1 }).limit(50);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const param = req.params.slug;
    const query: any = { isActive: { $ne: false } };
    query.$or = mongoose.Types.ObjectId.isValid(param) ? [{ slug: param }, { _id: param }] : [{ slug: param }];
    const product = await Product.findOne(query).populate('category');
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
    syncProduct(product);
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
    if (updated) syncProduct(updated);
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
    await removeProduct(req.params.id);
    await prisma.cartItem.deleteMany({ where: { productId: req.params.id } }).catch(() => {});
    await prisma.wishlistItem.deleteMany({ where: { productId: req.params.id } }).catch(() => {});
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
