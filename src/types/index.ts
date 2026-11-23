export interface Commodity {
  id: string;
  name: string;
  category: 'rice' | 'chilly' | 'fruits' | 'makhana' | 'grapes' | 'marine';
  origin: string;
  moq: string;
  packaging: string;
  specifications: Record<string, string>;
  image: string;
  inStock: boolean;
  transitPorts: string[];
  price?: string;
}

export interface ContainerTracking {
  containerId: string;
  commodity: string;
  volume: string;
  pol: string; // Port of Loading (e.g. Mundra Port, India)
  pod: string; // Port of Discharge (e.g. Jebel Ali, Dubai)
  status: 'Gate-in' | 'Customs Cleared' | 'Vessel Loaded' | 'In Transit' | 'Discharged';
  vesselName: string;
  eta: string;
  progressPercent: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  lastUpdated: string;
}

export interface OrderRequest {
  id: string;
  commodityId: string;
  commodityName: string;
  orderType: 'bulk' | 'sample';
  volume: string;
  bagSize: string;
  destinationPort: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyName: string;
  userRole?: 'buyer' | 'farmer';
  notes?: string;
  status: 'PENDING_REVIEW' | 'PROFORMA_ISSUED' | 'CONFIRMED' | 'DISPATCHED';
  createdAt: string;
}

export interface MobileAppUser {
  id: string;
  userId: string; // Login username / ID set by Admin
  password: string; // Password provisioned by Admin
  role: 'buyer' | 'farmer'; // Role explicitly selected by Admin
  companyName: string; // Firm / Company name for buyer, or Farm / FPO name for farmer
  contactName: string;
  email: string;
  phone: string;
  destinationPort: string; // Destination Port for buyer, or Mandi Hub for farmer
  mandiLocation?: string; // Specific APMC Mandi for farmers
  status: 'ACTIVE' | 'SUSPENDED';
  assignedContainer?: string;
  allocatedCommodities?: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface FarmerListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  mandiHub: string;
  cropName: string;
  variety: string;
  category: string;
  askingPrice: string;
  askingPriceUnit: string;
  priceUsd?: string;
  mandiBenchmark: string;
  priceTrend: string;
  lotQuantity: string;
  packaging: string;
  harvestDate: string;
  moistureOrSpecs: string;
  verifiedGrade: string;
  image: string;
  status: 'Available' | 'Sold' | 'Under Inspection';
  rfqCount: number;
  createdAt: string;
}

export interface AdminMobileStats {
  totalMobileUsers: number;
  buyersCount: number;
  farmersCount: number;
  activeUsers: number;
  suspendedUsers: number;
  totalOrders: number;
  activeShipmentsTracked: number;
}
