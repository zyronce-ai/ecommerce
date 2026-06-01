import { Router, Request, Response } from 'express';
import { Product } from '../../mongo/models/Product';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, category, minPrice, maxPrice, sort } = req.query;
    const filter: any = {};

    if (q) filter.name = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const products = await Product.find(filter).sort(sortOption).limit(50);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
