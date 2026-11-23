import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../data/db.js';

export const ordersRouter = Router();

const createOrderSchema = z.object({
  commodityId: z.string().min(1, 'Commodity ID is required'),
  commodityName: z.string().min(1, 'Commodity name is required'),
  orderType: z.enum(['bulk', 'sample']).default('bulk'),
  volume: z.string().min(1, 'Volume is required (e.g., 25 MT)'),
  bagSize: z.string().default('25 kg'),
  destinationPort: z.string().min(1, 'Destination Port is required'),
  contactName: z.string().min(2, 'Contact Name is required'),
  contactEmail: z.string().email('Valid Email is required'),
  contactPhone: z.string().min(7, 'Valid Phone number with Country code is required'),
  companyName: z.string().min(2, 'Company name is required'),
  userRole: z.enum(['buyer', 'farmer']).optional(),
  notes: z.string().optional()
});

// GET: List all orders
ordersRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.getOrders()
  });
});

// POST: Create Proforma Quote Request / Container Booking
ordersRouter.post('/', (req: Request, res: Response) => {
  const parseResult = createOrderSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      errors: parseResult.error.flatten().fieldErrors
    });
  }

  const newOrder = db.createOrder(parseResult.data);

  res.status(201).json({
    success: true,
    message: 'Proforma Quote Request Submitted Successfully. Export Desk will issue official proforma shortly.',
    data: newOrder
  });
});

// GET order by ID
ordersRouter.get('/:id', (req: Request, res: Response) => {
  const order = db.getOrders().find((o) => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order / Proforma Quote not found'
    });
  }

  res.json({
    success: true,
    data: order
  });
});
