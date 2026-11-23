import { Router, Request, Response } from 'express';
import { db } from '../data/db.js';

export const authRouter = Router();

// Mobile App Credentials Login (User ID & Password - Provisioned by Admin) & Web Admin Login
authRouter.post('/login', (req: Request, res: Response) => {
  const { userId, password, identifier, email, role } = req.body;

  // Support Web Admin Login directly
  const loginEmail = (email || identifier || userId || '').trim().toLowerCase();
  if (loginEmail === 'admin@anvimercantile.com') {
    if (password === 'AdminPass123!') {
      return res.json({
        success: true,
        data: {
          accessToken: 'admin-access-token-anvi-hq-2026',
          user: {
            id: 'admin_01',
            email: 'admin@anvimercantile.com',
            role: 'ADMIN',
            name: 'Anvi Groups Admin'
          }
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid admin password.' }
      });
    }
  }

  // Regular Buyer & Farmer Mobile App Login
  const lookupId = (userId || identifier || '').trim();

  if (!lookupId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required.'
    });
  }

  // Look up user in database
  const user = db.getUserByLogin(lookupId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: `Invalid User ID "${lookupId}". Accounts are provisioned exclusively by Anvi Mercantile Administrator.`
    });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      message: 'Your account is currently suspended by Administrator. Please contact Anvi Mercantile Desk.'
    });
  }

  // If role is explicitly provided during login, enforce role matching
  if (role && user.role !== role) {
    return res.status(403).json({
      success: false,
      message: `Account "${user.userId}" is registered as a ${user.role.toUpperCase()}. Please switch to the ${user.role === 'farmer' ? 'Farmer' : 'Buyer'} tab.`
    });
  }

  // Verify password
  if (!password || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Password. Please verify your credentials or contact Anvi Mercantile Admin.'
    });
  }

  // Update last login timestamp in persistent database
  db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

  // Return authenticated session with exact role
  res.json({
    success: true,
    message: `Welcome back, ${user.companyName}!`,
    token: `anvi-jwt-${Buffer.from(user.userId).toString('base64')}-${Date.now()}`,
    user: {
      id: user.id,
      userId: user.userId,
      role: user.role,
      companyName: user.companyName,
      contactName: user.contactName,
      email: user.email,
      phone: user.phone,
      destinationPort: user.destinationPort,
      mandiLocation: user.mandiLocation || user.destinationPort,
      assignedContainer: user.assignedContainer,
      allocatedCommodities: user.allocatedCommodities,
      status: user.status
    }
  });
});

// Admin Auth verification (/auth/me)
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.includes('admin-access-token')) {
    return res.json({
      success: true,
      data: {
        id: 'admin_01',
        email: 'admin@anvimercantile.com',
        role: 'ADMIN',
        name: 'Anvi Groups Admin'
      }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Unauthorized'
  });
});
