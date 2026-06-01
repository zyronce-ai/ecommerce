import mongoose from 'mongoose';
import { Product } from './models/Product';
import { Category } from './models/Category';
import { Coupon } from './models/Coupon';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('[SEED] Connected to MongoDB');

  await Category.deleteMany({});
  const categories = await Category.insertMany([
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets & devices', image: '' },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing & accessories', image: '' },
    { name: 'Home & Living', slug: 'home-living', description: 'Furniture & decor', image: '' },
    { name: 'Books', slug: 'books', description: 'Books & stationery', image: '' },
    { name: 'Sports', slug: 'sports', description: 'Sports & fitness', image: '' },
    { name: 'Beauty', slug: 'beauty', description: 'Beauty & personal care', image: '' },
  ]);
  console.log('[SEED] Categories created:', categories.length);

  await Product.deleteMany({});
  const products = await Product.insertMany([
    { name: 'Wireless Headphones Pro', slug: 'wireless-headphones-pro', description: 'Premium noise-cancelling headphones with 30hr battery', price: 2499, comparePrice: 4999, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], category: categories[0]._id, stock: 45, rating: 4.5, reviewsCount: 128, colors: ['Black', 'White', 'Blue'], specs: { Brand: 'TechPro', Battery: '30hrs', Bluetooth: '5.3' } },
    { name: 'Smart Watch Ultra', slug: 'smart-watch-ultra', description: 'Advanced fitness tracking with AMOLED display', price: 3999, comparePrice: 7999, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'], category: categories[0]._id, stock: 23, rating: 4.7, reviewsCount: 89, colors: ['Silver', 'Black'], specs: { Display: 'AMOLED', Battery: '7 days', Water: 'IP68' } },
    { name: 'Bluetooth Speaker', slug: 'bluetooth-speaker', description: 'Portable speaker with deep bass and 12hr playback', price: 1799, comparePrice: 3499, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'], category: categories[0]._id, stock: 89, rating: 4.4, reviewsCount: 178, colors: ['Red', 'Black', 'Blue'], specs: { Power: '12W', Battery: '12hrs', Range: '10m' } },
    { name: 'Premium Sneakers', slug: 'premium-sneakers', description: 'Comfortable running shoes with cushioned sole', price: 5999, comparePrice: 8999, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], category: categories[1]._id, stock: 67, rating: 4.3, reviewsCount: 234, colors: ['White', 'Black', 'Red'], specs: { Material: 'Mesh', Sole: 'Rubber', Closure: 'Lace-up' } },
    { name: 'Leather Wallet', slug: 'leather-wallet', description: 'Genuine leather bifold wallet with RFID protection', price: 999, comparePrice: 1999, images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=400'], category: categories[1]._id, stock: 120, rating: 4.2, reviewsCount: 67, colors: ['Brown', 'Black'], specs: { Material: 'Genuine Leather', Slots: '8 card slots' } },
    { name: 'Minimalist Backpack', slug: 'minimalist-backpack', description: 'Sleek 25L backpack with laptop compartment', price: 1299, comparePrice: 2499, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'], category: categories[1]._id, stock: 34, rating: 4.3, reviewsCount: 256, colors: ['Gray', 'Black', 'Navy'], specs: { Capacity: '25L', Laptop: '15.6"', Material: 'Polyester' } },
    { name: 'Desk Lamp LED', slug: 'desk-lamp-led', description: 'Adjustable LED desk lamp with 5 brightness levels', price: 899, comparePrice: 1799, images: ['https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400'], category: categories[2]._id, stock: 56, rating: 4.1, reviewsCount: 89, colors: ['White', 'Black'], specs: { Wattage: '12W', Brightness: '5 levels', USB: 'Yes' } },
    { name: 'Cotton T-Shirt', slug: 'cotton-tshirt', description: 'Premium cotton crew neck t-shirt', price: 599, comparePrice: 1299, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'], category: categories[1]._id, stock: 200, rating: 4.0, reviewsCount: 345, colors: ['White', 'Black', 'Gray', 'Navy'], specs: { Material: '100% Cotton', Fit: 'Regular', Sizes: 'S-XXL' } },
    { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: 'Non-slip exercise mat with carrying strap', price: 1499, comparePrice: 2499, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'], category: categories[4]._id, stock: 78, rating: 4.5, reviewsCount: 156, colors: ['Purple', 'Blue', 'Green'], specs: { Thickness: '6mm', Material: 'TPE', Size: '183x61cm' } },
    { name: 'Face Serum Vitamin C', slug: 'face-serum-vitamin-c', description: 'Brightening vitamin C serum with hyaluronic acid', price: 699, comparePrice: 1299, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'], category: categories[5]._id, stock: 92, rating: 4.3, reviewsCount: 201, specs: { Volume: '30ml', Type: 'Serum', Skin: 'All types' } },
  ]);
  console.log('[SEED] Products created:', products.length);

  await Coupon.deleteMany({});
  const coupons = await Coupon.insertMany([
    { code: 'WELCOME20', discount: 20, type: 'PERCENTAGE', minOrder: 499, maxUses: 500, usedCount: 0, isActive: true, expiresAt: new Date('2026-12-31') },
    { code: 'FLAT500', discount: 500, type: 'FLAT', minOrder: 2499, maxUses: 200, usedCount: 0, isActive: true, expiresAt: new Date('2026-12-31') },
    { code: 'FREESHIP', discount: 100, type: 'FLAT', minOrder: 0, maxUses: 1000, usedCount: 0, isActive: true, expiresAt: new Date('2026-12-31') },
    { code: 'DEAL50', discount: 50, type: 'PERCENTAGE', minOrder: 999, maxUses: 100, usedCount: 0, isActive: true, expiresAt: new Date('2026-07-31') },
  ]);
  console.log('[SEED] Coupons created:', coupons.length);

  await mongoose.disconnect();
  console.log('[SEED] ✅ Done!');
}

seed().catch(console.error);
