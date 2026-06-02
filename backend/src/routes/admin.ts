import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { Product } from '../../mongo/models/Product';
import { authenticate, requireRole } from '../middleware/auth';
import { createCollection, typesenseClient } from '../utils/typesense';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

import { Category } from '../../mongo/models/Category';

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [users, orders, products, categories] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      Product.countDocuments(),
      Category.countDocuments(),
    ]);
    const revenue = await prisma.order.aggregate({ _sum: { total: true } });
    res.json({ users, orders, products, categories, revenue: revenue._sum.total || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/role', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!['USER', 'VENDOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/clear-all', async (req: Request, res: Response) => {
  try {
    if (req.query.confirm !== 'YES_DELETE_ALL_PRODUCTS') {
      return res.status(400).json({ error: 'Missing confirmation. Pass ?confirm=YES_DELETE_ALL_PRODUCTS' });
    }
    const deletedMongo = await Product.deleteMany({});
    const deletedCart = await prisma.cartItem.deleteMany({}).catch(() => ({ count: 0 }));
    const deletedWishlist = await prisma.wishlistItem.deleteMany({}).catch(() => ({ count: 0 }));
    await Product.syncIndexes().catch(() => {});
    let typesenseCleared = false;
    try {
      try {
        await typesenseClient.collections('products').delete();
      } catch {}
      await createCollection();
      typesenseCleared = true;
    } catch (e: any) {
      console.error('[ADMIN] Typesense clear failed:', e.message);
    }
    console.log(`[ADMIN] ⚠️  CLEARED ALL PRODUCTS: ${deletedMongo.deletedCount} products, ${deletedCart.count} cart items, ${deletedWishlist.count} wishlist items`);
    res.json({
      success: true,
      productsDeleted: deletedMongo.deletedCount,
      cartItemsDeleted: deletedCart.count,
      wishlistItemsDeleted: deletedWishlist.count,
      typesenseRecreated: typesenseCleared,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
