import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../data/db.js';

export const adminRouter = Router();

// Validation schema for Admin creating mobile app users
const createMobileUserSchema = z.object({
  userId: z.string().min(3, 'User ID must be at least 3 characters').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['buyer', 'farmer'], {
    errorMap: () => ({ message: 'Please select account role: buyer or farmer' })
  }),
  companyName: z.string().min(2, 'Company/Farm name is required'),
  contactName: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(7, 'Phone number is required'),
  destinationPort: z.string().min(2, 'Destination port or Mandi hub is required'),
  mandiLocation: z.string().optional(),
  assignedContainer: z.string().optional(),
  allocatedCommodities: z.array(z.string()).optional()
});

// GET /api/admin/mobile-users - List all mobile app users (optionally filtered by ?role=buyer | farmer)
adminRouter.get('/mobile-users', (req: Request, res: Response) => {
  const roleQuery = req.query.role as 'buyer' | 'farmer' | undefined;
  const users = db.getUsers(roleQuery);
  const stats = db.getStats();

  res.json({
    success: true,
    total: users.length,
    buyersCount: stats.buyersCount,
    farmersCount: stats.farmersCount,
    data: users.map(({ password, ...safeUser }) => ({
      ...safeUser,
      maskedPassword: '•'.repeat(8),
      rawPasswordForAdmin: password // Allows Admin to view & copy credentials for provisioned user
    }))
  });
});

// POST /api/admin/mobile-users - Create new buyer or farmer user from web admin dashboard
adminRouter.post('/mobile-users', (req: Request, res: Response) => {
  const result = createMobileUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors
    });
  }

  const { userId, email, role, companyName } = result.data;

  // Check if user ID or email already exists
  const existingUser = db.getUserByLogin(userId) || db.getUserByLogin(email);

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: `User with ID "${userId}" or email "${email}" already exists.`
    });
  }

  const newUser = db.createUser({
    userId: result.data.userId,
    password: result.data.password,
    role: result.data.role,
    companyName: result.data.companyName,
    contactName: result.data.contactName,
    email: result.data.email,
    phone: result.data.phone,
    destinationPort: result.data.destinationPort,
    mandiLocation: result.data.mandiLocation || (result.data.role === 'farmer' ? result.data.destinationPort : undefined),
    status: 'ACTIVE',
    assignedContainer: result.data.assignedContainer || (result.data.role === 'farmer' ? undefined : 'AM-8840'),
    allocatedCommodities: result.data.allocatedCommodities || (result.data.role === 'farmer' ? ['sona-masoori-steam'] : ['1121-xxl-basmati-rice'])
  });

  res.status(201).json({
    success: true,
    message: `${role.toUpperCase()} Account for "${companyName}" (${newUser.userId}) provisioned successfully.`,
    data: {
      ...newUser,
      rawPasswordForAdmin: newUser.password
    }
  });
});

// PUT /api/admin/mobile-users/:id - Update status / password / role / details
adminRouter.put('/mobile-users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedUser = db.updateUser(id, updates);

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: 'Mobile user not found.'
    });
  }

  res.json({
    success: true,
    message: `Account "${updatedUser.userId}" updated successfully.`,
    data: {
      id: updatedUser.id,
      userId: updatedUser.userId,
      role: updatedUser.role,
      companyName: updatedUser.companyName,
      status: updatedUser.status,
      assignedContainer: updatedUser.assignedContainer,
      destinationPort: updatedUser.destinationPort
    }
  });
});

// DELETE /api/admin/mobile-users/:id - Delete mobile user
adminRouter.delete('/mobile-users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteUser(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Mobile user not found.'
    });
  }

  res.json({
    success: true,
    message: `Account "${id}" deleted successfully.`
  });
});

// GET /api/admin/stats and /api/admin/mobile-stats - Overview statistics
adminRouter.get(['/stats', '/mobile-stats'], (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.getStats()
  });
});

// GET /api/admin/farmer-listings - Real-time produce listings from farmers
adminRouter.get('/farmer-listings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.getFarmerListings()
  });
});

// DELETE /api/admin/farmer-listings/:id - Admin remove farmer product from mobile app
adminRouter.delete('/farmer-listings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteFarmerListing(id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: `Product "${id}" not found in database.`
    });
  }
  res.json({
    success: true,
    message: `Product "${id}" successfully removed from mobile app & database.`
  });
});
