import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { Product } from '../../mongo/models/Product';
import { authenticate, requireRole } from '../middleware/auth';
import { syncProduct, removeProduct } from '../utils/typesense';

const router = Router();

router.get('/stats/:vendorId', authenticate, requireRole('VENDOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    if (req.user!.role !== 'ADMIN' && req.user!.id !== vendorId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const [products, totalOrders] = await Promise.all([
      Product.countDocuments({ vendor: vendorId }),
      prisma.order.count({ where: { userId: vendorId } }),
    ]);
    const revenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { userId: vendorId },
    });
    res.json({ products, orders: totalOrders, revenue: revenue._sum.total || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:vendorId', async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ vendor: req.params.vendorId });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products/:vendorId', authenticate, requireRole('VENDOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    if (req.user!.role !== 'ADMIN' && req.user!.id !== vendorId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const data = { ...req.body, vendor: vendorId };
    if (!data.slug && data.name) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
    const product = await Product.create(data);
    syncProduct(product);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', authenticate, requireRole('VENDOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (req.user!.role !== 'ADMIN' && product.vendor !== req.user!.id) {
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

router.delete('/products/:id', authenticate, requireRole('VENDOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (req.user!.role !== 'ADMIN' && product.vendor !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await Product.findByIdAndDelete(req.params.id);
    removeProduct(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/:vendorId', authenticate, requireRole('VENDOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    if (req.user!.role !== 'ADMIN' && req.user!.id !== vendorId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const orders = await prisma.order.findMany({
      where: { userId: vendorId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/earnings/:vendorId', authenticate, requireRole('VENDOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    if (req.user!.role !== 'ADMIN' && req.user!.id !== vendorId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const orders = await prisma.order.findMany({ where: { userId: vendorId } });
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const pendingPayouts = orders.filter((o) => o.status !== 'DELIVERED').reduce((sum, o) => sum + o.total, 0);
    res.json({ totalRevenue, totalOrders, pendingPayouts, transactions: orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings/:vendorId', authenticate, requireRole('VENDOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    if (req.user!.role !== 'ADMIN' && req.user!.id !== vendorId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await prisma.user.update({
      where: { id: vendorId },
      data: { name: req.body.name, image: req.body.image },
      select: { id: true, name: true, email: true, image: true },
    });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/payouts/:vendorId', authenticate, requireRole('VENDOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    if (req.user!.role !== 'ADMIN' && req.user!.id !== vendorId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { accountName, accountNumber, ifsc, upi } = req.body;
    const user = await prisma.user.update({
      where: { id: vendorId },
      data: { image: JSON.stringify({ accountName, accountNumber, ifsc, upi }) },
      select: { id: true, name: true, image: true },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
