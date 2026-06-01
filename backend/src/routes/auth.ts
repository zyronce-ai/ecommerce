import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';
import { sendVerificationEmail } from '../utils/email';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register-vendor', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'VENDOR', verificationToken, emailVerified: false },
    });

    const link = `${process.env.VENDOR_URL || 'http://localhost:3002'}/verify?token=${verificationToken}`;
    console.log(`\n[VERIFY] ${link}\n`);
    sendVerificationEmail(email, verificationToken).catch((e) => console.error('[EMAIL FAILED]', e.message));
    res.status(201).json({ message: 'Verification email sent. Please check your inbox.', link: link });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const user = await prisma.user.findFirst({ where: { verificationToken: String(token) } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    res.redirect(`${process.env.VENDOR_URL || 'http://localhost:3002'}/verify?success=true`);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role === 'VENDOR' && user.emailVerified === false) {
      return res.status(403).json({ error: 'Please verify your email before logging in', needsVerification: true });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/social-login', async (req: Request, res: Response) => {
  try {
    const { email, name, image } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const randomPass = crypto.randomBytes(16).toString('hex');
      const hashed = await bcrypt.hash(randomPass, 12);
      user = await prisma.user.create({
        data: { name: name || email.split('@')[0], email, password: hashed, image, emailVerified: true },
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, image: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { ...(name && { name }), ...(phone && { phone: String(phone) }) },
      select: { id: true, name: true, email: true, phone: true },
    });
    res.json(user);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/role', authenticate, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!['USER', 'VENDOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
