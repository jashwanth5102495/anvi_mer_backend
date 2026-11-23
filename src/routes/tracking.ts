import { Router, Request, Response } from 'express';
import { db } from '../data/db.js';

export const trackingRouter = Router();

// GET container tracking by container number
trackingRouter.get('/:containerId', (req: Request, res: Response) => {
  const containerId = req.params.containerId.toUpperCase().trim();
  const trackingData = db.getContainerById(containerId);

  if (!trackingData) {
    return res.status(404).json({
      success: false,
      message: `Container #${containerId} not found or awaiting customs manifest update.`
    });
  }

  res.json({
    success: true,
    data: trackingData
  });
});

// GET all active live shipments
trackingRouter.get('/', (_req: Request, res: Response) => {
  const containers = Object.values(db.getContainers());
  res.json({
    success: true,
    total: containers.length,
    data: containers
  });
});
