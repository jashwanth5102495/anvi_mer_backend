import { Router, Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service.js';
import { cronService } from '../services/cron.service.js';

export const whatsappRouter = Router();

// GET /api/whatsapp/status or /status
whatsappRouter.get('/status', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default';
  const statusInfo = whatsappService.getStatus(tenantId);
  res.json({
    success: true,
    ...statusInfo,
  });
});

// GET /api/v1/tenants/:id/whatsapp/status
whatsappRouter.get('/v1/tenants/:id/whatsapp/status', (req: Request, res: Response) => {
  const statusInfo = whatsappService.getStatus(req.params.id);
  res.json({
    success: true,
    ...statusInfo,
  });
});

// POST /api/whatsapp/qr
whatsappRouter.post('/qr', async (req: Request, res: Response) => {
  const tenantId = (req.body.tenantId as string) || 'default';
  try {
    const result = await whatsappService.requestQrCode(tenantId);
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to generate WhatsApp QR code',
    });
  }
});

// POST /api/v1/tenants/:id/whatsapp/qr
whatsappRouter.post('/v1/tenants/:id/whatsapp/qr', async (req: Request, res: Response) => {
  try {
    const result = await whatsappService.requestQrCode(req.params.id);
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to generate WhatsApp QR code',
    });
  }
});

// POST /api/whatsapp/disconnect
whatsappRouter.post('/disconnect', async (req: Request, res: Response) => {
  const tenantId = (req.body.tenantId as string) || 'default';
  await whatsappService.disconnect(tenantId);
  res.json({
    success: true,
    message: 'WhatsApp session disconnected successfully.',
    status: 'DISCONNECTED',
  });
});

// POST /api/v1/tenants/:id/whatsapp/disconnect
whatsappRouter.post('/v1/tenants/:id/whatsapp/disconnect', async (req: Request, res: Response) => {
  await whatsappService.disconnect(req.params.id);
  res.json({
    success: true,
    message: 'WhatsApp session disconnected successfully.',
    status: 'DISCONNECTED',
  });
});

// POST /api/whatsapp/test or /v1/tenants/:id/test-whatsapp-report
whatsappRouter.post('/test', async (req: Request, res: Response) => {
  const { shift = 1, phone = '8328246413', tenantId = 'default' } = req.body;
  const result = await whatsappService.sendShiftReport(Number(shift), String(phone), tenantId);
  res.json({
    success: result.success,
    message: result.message,
  });
});

whatsappRouter.post('/v1/tenants/:id/test-whatsapp-report', async (req: Request, res: Response) => {
  const { shift = 1, phone = '8328246413' } = req.body;
  const result = await whatsappService.sendShiftReport(Number(shift), String(phone), req.params.id);
  res.json({
    success: result.success,
    message: result.message,
  });
});

// POST /api/whatsapp/send-order-test
whatsappRouter.post('/send-order-test', async (req: Request, res: Response) => {
  const { phone = '8328246413', tenantId = 'default' } = req.body;
  const testOrder = {
    id: `ORD-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    companyName: 'Gulf Harvest Trading LLC',
    contactName: 'Tariq Al-Mansoor',
    contactPhone: '+971 50 884 1029',
    destinationPort: 'Jebel Ali Port (Dubai, UAE)',
    assignedContainer: 'AM-8840',
    commodityName: 'Sona Masoori Steam Rice',
    volume: '25 MT FCL',
    totalAmount: 18500,
    paymentMethod: 'Advance LC (BCA Wire)',
    status: 'PENDING_REVIEW',
  };

  await whatsappService.sendOrderAlert(testOrder, tenantId, String(phone));
  res.json({
    success: true,
    message: `Test order notification dispatched for phone +91 ${phone}`,
    order: testOrder,
  });
});
