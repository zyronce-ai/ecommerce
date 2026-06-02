import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isCloudinaryConfigured, uploadToCloudinary } from '../utils/cloudinary';

const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

const router = Router();

router.post('/images', upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (isCloudinaryConfigured()) {
      const urls = await Promise.all(files.map((f) => uploadToCloudinary(fs.readFileSync(f.path), 'products')));
      files.forEach((f) => fs.unlink(f.path, () => {}));
      res.json({ urls });
    } else {
      const urls = files.map((f) => `/uploads/${f.filename}`);
      res.json({ urls });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    if (isCloudinaryConfigured()) {
      const url = await uploadToCloudinary(fs.readFileSync(file.path), 'products');
      fs.unlink(file.path, () => {});
      res.json({ url });
    } else {
      res.json({ url: `/uploads/${file.filename}` });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
