import { Router, Request, Response } from 'express';
import { db } from '../data/db.js';

export const commoditiesRouter = Router();

// GET all commodities (optional query: ?category=rice)
commoditiesRouter.get('/', (req: Request, res: Response) => {
  const { category, search } = req.query;

  let results = db.getCommodities();

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter((c) => 
      c.name.toLowerCase().includes(q) || 
      c.origin.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: results.length,
    data: results
  });
});

// GET single commodity by ID
commoditiesRouter.get('/:id', (req: Request, res: Response) => {
  const commodity = db.getCommodities().find((c) => c.id === req.params.id);

  if (!commodity) {
    return res.status(404).json({
      success: false,
      message: 'Commodity not found'
    });
  }

  res.json({
    success: true,
    data: commodity
  });
});

// GET list of categories
commoditiesRouter.get('/meta/categories', (_req: Request, res: Response) => {
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'rice', name: 'Rice & Grains' },
    { id: 'fruits', name: 'Fresh Fruits' },
    { id: 'chilly', name: 'Spices & Herbs' },
    { id: 'marine', name: 'Fish & Marine' }
  ];

  res.json({
    success: true,
    data: categories
  });
});
