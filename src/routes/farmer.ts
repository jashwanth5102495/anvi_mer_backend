import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../data/db.js';

export const farmerRouter = Router();

const createListingSchema = z.object({
  farmerId: z.string().optional(),
  farmerName: z.string().min(2, 'Farmer name is required'),
  farmLocation: z.string().min(2, 'Farm location is required'),
  mandiHub: z.string().min(2, 'Mandi hub is required'),
  cropName: z.string().min(2, 'Crop name is required'),
  variety: z.string().min(2, 'Variety is required'),
  category: z.string().default('rice'),
  askingPrice: z.string().min(1, 'Asking price is required'),
  askingPriceUnit: z.string().default('₹ / Quintal'),
  priceUsd: z.string().optional(),
  mandiBenchmark: z.string().default('₹3,950 / Quintal'),
  priceTrend: z.string().default('+5.2% vs Mandi MSP'),
  lotQuantity: z.string().min(1, 'Lot quantity is required'),
  packaging: z.string().default('50kg PP Bags'),
  harvestDate: z.string().default('Current Season Harvest'),
  moistureOrSpecs: z.string().default('Machine Sortex Cleaned'),
  verifiedGrade: z.string().default('APEDA AUDITED GRADE 1'),
  image: z.string().default('preset-steam-sona'),
  status: z.enum(['Available', 'Sold', 'Under Inspection']).default('Available')
});

// GET /api/farmer/listings - Real-time community mandi produce listings
farmerRouter.get('/listings', (_req: Request, res: Response) => {
  const listings = db.getFarmerListings();
  res.json({
    success: true,
    total: listings.length,
    data: listings
  });
});

// POST /api/farmer/listings - Publish new produce lot to Mandi
farmerRouter.post('/listings', (req: Request, res: Response) => {
  const result = createListingSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors
    });
  }

  const newListing = db.createFarmerListing({
    farmerId: result.data.farmerId || 'usr_farmer',
    farmerName: result.data.farmerName,
    farmLocation: result.data.farmLocation,
    mandiHub: result.data.mandiHub,
    cropName: result.data.cropName,
    variety: result.data.variety,
    category: result.data.category,
    askingPrice: result.data.askingPrice,
    askingPriceUnit: result.data.askingPriceUnit,
    priceUsd: result.data.priceUsd || '$480 / MT',
    mandiBenchmark: result.data.mandiBenchmark,
    priceTrend: result.data.priceTrend,
    lotQuantity: result.data.lotQuantity,
    packaging: result.data.packaging,
    harvestDate: result.data.harvestDate,
    moistureOrSpecs: result.data.moistureOrSpecs,
    verifiedGrade: result.data.verifiedGrade,
    image: result.data.image,
    status: result.data.status
  });

  res.status(201).json({
    success: true,
    message: `Produce lot "${newListing.cropName}" published successfully to Community Mandi.`,
    data: newListing
  });
});

// GET /api/farmer/msp - Live Mandi MSP benchmarks
farmerRouter.get('/msp', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { crop: 'Sona Masoori Raw', msp: '₹4,250/Qtl', apmc: 'Kurnool APMC', trend: '+4.2%' },
      { crop: '1121 Basmati Paddy', msp: '₹4,890/Qtl', apmc: 'Karnal APMC', trend: '+6.1%' },
      { crop: 'G4 Green Chilly', msp: '₹68/kg', apmc: 'Guntur Mirchi Yard', trend: '+8.5%' },
      { crop: 'Bhagwa Pomegranate', msp: '₹110/kg', apmc: 'Solapur Mandi', trend: '+3.4%' }
    ]
  });
});
