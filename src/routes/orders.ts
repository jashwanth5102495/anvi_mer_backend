import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../data/db.js';

export const ordersRouter = Router();

const createOrderSchema = z.object({
  orderId: z.string().optional(),
  buyerId: z.string().optional(),
  commodityId: z.string().optional(),
  commodityName: z.string().optional(),
  items: z.array(z.any()).optional(),
  orderType: z.enum(['bulk', 'sample']).default('bulk'),
  volume: z.string().optional(),
  bagSize: z.string().default('25 kg'),
  destinationPort: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  companyName: z.string().optional(),
  totalAmount: z.union([z.number(), z.string()]).optional(),
  shippingFee: z.union([z.number(), z.string()]).optional(),
  paymentMethod: z.string().optional(),
  assignedContainer: z.string().optional(),
  userRole: z.enum(['buyer', 'farmer']).optional(),
  notes: z.string().optional()
});

// GET: List all orders
ordersRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: db.getOrders().length,
    data: db.getOrders()
  });
});

// POST: Create Proforma Quote Request / Container Booking / Mobile App Checkout
ordersRouter.post('/', (req: Request, res: Response) => {
  const parseResult = createOrderSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      errors: parseResult.error.flatten().fieldErrors
    });
  }

  const orderData = parseResult.data;
  const newOrder = db.createOrder({
    ...orderData,
    commodityName: orderData.commodityName || (orderData.items && orderData.items.length > 0 ? orderData.items.map((i: any) => i.name).join(', ') : 'Wholesale Commodity Lot'),
    volume: orderData.volume || `${(orderData.items?.length || 1) * 20} MT FCL`,
    destinationPort: orderData.destinationPort || 'Jebel Ali Port (Dubai, UAE)',
    companyName: orderData.companyName || 'Import Trade Desk Partner',
    contactName: orderData.contactName || 'Trade Operations Manager',
    contactEmail: orderData.contactEmail || 'orders@anvimercantile.com',
    contactPhone: orderData.contactPhone || '+971 50 884 1029',
    totalAmount: orderData.totalAmount || 101.00,
    status: 'PENDING_REVIEW'
  });

  res.status(201).json({
    success: true,
    message: 'Order Placed Successfully! Synced to Anvi Mercantile Admin Desk in Real-Time.',
    data: newOrder
  });
});

// GET order by ID
ordersRouter.get('/:id', (req: Request, res: Response) => {
  const order = db.getOrders().find((o) => o.id === req.params.id || o.orderId === req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// PUT /:id/status - Update order status (Approve proforma, confirm, etc.)
ordersRouter.put('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = db.updateOrderStatus(req.params.id, status);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    message: `Order "${req.params.id}" status updated to ${status}.`,
    data: updated
  });
});

// DELETE /:id - Delete order
ordersRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = db.deleteOrder(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    message: `Order "${req.params.id}" deleted successfully.`
  });
});
