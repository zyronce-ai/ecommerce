import { Router, Request, Response } from 'express';

const router = Router();

const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

router.get('/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid pincode format' });
    }

    const cached = cache.get(code);
    if (cached && cached.expiry > Date.now()) {
      return res.json(cached.data);
    }

    const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
    const data = await response.json();

    if (!data?.[0] || data[0].Status !== 'Success') {
      return res.status(404).json({ error: 'Pincode not found' });
    }

    const postOffices = data[0].PostOffice;
    const cities = [...new Set(postOffices.map((p: any) => p.District))];
    const state = postOffices[0].State;

    const result = { city: cities[0] || '', state, cities };

    cache.set(code, { data: result, expiry: Date.now() + CACHE_TTL });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to lookup pincode' });
  }
});

export default router;
