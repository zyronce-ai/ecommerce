import { Router, Request, Response } from 'express';
import { Coupon } from '../../mongo/models/Coupon';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/validate', async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon' });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: 'Coupon expired' });
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Coupon max uses reached' });
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
