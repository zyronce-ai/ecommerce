import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { Category } from '../../mongo/models/Category';
import { Product } from '../../mongo/models/Product';
import { Coupon } from '../../mongo/models/Coupon';
import { Review } from '../../mongo/models/Review';

const router = Router();

router.post('/', async (_req: Request, res: Response) => {
  try {
    const hashed = await bcrypt.hash('password', 12);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@shophub.com' },
      update: {},
      create: { name: 'Admin', email: 'admin@shophub.com', password: hashed, role: 'ADMIN', emailVerified: true },
    });

    const vendor = await prisma.user.upsert({
      where: { email: 'vendor@shophub.com' },
      update: { emailVerified: true },
      create: { name: 'Vendor', email: 'vendor@shophub.com', password: hashed, role: 'VENDOR', emailVerified: true },
    });

    const user = await prisma.user.upsert({
      where: { email: 'user@shophub.com' },
      update: {},
      create: { name: 'Test User', email: 'user@shophub.com', password: hashed, role: 'USER' },
    });

    const categories = await Category.insertMany([
      { name: 'Electronics', slug: 'electronics', description: 'Gadgets and devices', isActive: true },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories', isActive: true },
      { name: 'Home & Living', slug: 'home-living', description: 'Home decor and furniture', isActive: true },
      { name: 'Books', slug: 'books', description: 'Books and magazines', isActive: true },
      { name: 'Sports', slug: 'sports', description: 'Sports equipment and gear', isActive: true },
      { name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care', isActive: true },
    ], { ordered: false }).catch(() => []);

    const categoryMap: Record<string, any> = {};
    for (const c of await Category.find()) {
      categoryMap[c.slug] = c._id;
    }

    const existingProducts = await Product.countDocuments();
    if (existingProducts === 0) {
      await Product.insertMany([
        { name: 'Wireless Headphones Pro', slug: 'wireless-headphones-pro', price: 2499, description: 'Premium wireless headphones with noise cancellation', category: categoryMap['electronics'], stock: 45, vendor: vendor.id, isActive: true },
        { name: 'Smart Watch Ultra', slug: 'smart-watch-ultra', price: 3999, description: 'Feature-rich smartwatch with health tracking', category: categoryMap['electronics'], stock: 23, vendor: vendor.id, isActive: true },
        { name: 'Bluetooth Speaker', slug: 'bluetooth-speaker', price: 1799, description: 'Portable bluetooth speaker with deep bass', category: categoryMap['electronics'], stock: 89, vendor: vendor.id, isActive: true },
        { name: 'Premium Sneakers', slug: 'premium-sneakers', price: 5999, description: 'Comfortable and stylish sneakers', category: categoryMap['fashion'], stock: 67, vendor: vendor.id, isActive: true },
        { name: 'Leather Wallet', slug: 'leather-wallet', price: 999, description: 'Genuine leather bifold wallet', category: categoryMap['fashion'], stock: 120, vendor: vendor.id, isActive: true },
        { name: 'Cotton T-Shirt', slug: 'cotton-tshirt', price: 599, description: 'Soft 100% cotton t-shirt', category: categoryMap['fashion'], stock: 200, vendor: vendor.id, isActive: true },
      ]);
    }

    const existingCoupons = await Coupon.countDocuments();
    if (existingCoupons === 0) {
      await Coupon.insertMany([
        { code: 'WELCOME20', discount: 20, type: 'PERCENTAGE', minOrder: 499, maxUses: 500, usedCount: 45, isActive: true },
        { code: 'FLAT500', discount: 500, type: 'FLAT', minOrder: 2499, maxUses: 200, usedCount: 12, isActive: true },
        { code: 'FREESHIP', discount: 100, type: 'FLAT', minOrder: 0, maxUses: 1000, usedCount: 234, isActive: true },
        { code: 'DEAL50', discount: 50, type: 'PERCENTAGE', minOrder: 999, maxUses: 100, usedCount: 3, isActive: true },
      ]);
    }

    res.json({
      message: 'Seed complete',
      users: { admin: admin.email, vendor: vendor.email, user: user.email },
      categories: await Category.countDocuments(),
      products: await Product.countDocuments(),
      coupons: await Coupon.countDocuments(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
