import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

router.post('/images', upload.array('images', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const urls = files.map(f => `/uploads/${f.filename}`);
  res.json({ urls });
});

router.post('/image', upload.single('image'), (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  res.json({ url: `/uploads/${file.filename}` });
});

export default router;
