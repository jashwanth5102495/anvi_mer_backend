import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Commodity, ContainerTracking, OrderRequest, MobileAppUser, FarmerListing, AdminMobileStats } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data store file location (works in container, Docker, Railway volume, and locally)
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface DatabaseSchema {
  users: MobileAppUser[];
  commodities: Commodity[];
  farmerListings: FarmerListing[];
  orders: OrderRequest[];
  containers: Record<string, ContainerTracking>;
}

// Initial seed data when database is first created
const INITIAL_COMMODITIES: Commodity[] = [
  {
    id: 'sona-masoori-steam',
    name: 'Sona Masoori Steam Rice',
    category: 'rice',
    origin: 'Kurnool / Bellary, India',
    moq: '20 MT MOQ · 25kg PP Bags',
    packaging: '25kg / 50kg PP Bags',
    price: '$82.00',
    specifications: {
      'Grain Length': '5.20 mm',
      'Moisture': 'Under 12.5%',
      'Damaged': 'Under 0.5%',
      'Cleaning': 'Machine Sortex 100%'
    },
    image: '/assets/rice_sona_steam.png',
    inStock: true,
    transitPorts: ['Chennai Port', 'Krishnapatnam Port']
  },
  {
    id: '1-year-raw-sona',
    name: '1 Year Old Raw Sona Masoori',
    category: 'rice',
    origin: 'Kurnool, Andhra Pradesh, India',
    moq: '25 MT FCL · 25/50kg Bags',
    packaging: '25kg / 50kg Non-Woven BoPP Bags',
    price: '$88.00',
    specifications: {
      'Aging': 'Naturally Aged 12+ Months in Silos',
      'Grain Length': '5.20 mm',
      'Moisture': 'Under 11.5%',
      'Purity': '96%+'
    },
    image: '/assets/one_year.png',
    inStock: true,
    transitPorts: ['Krishnapatnam Port', 'Chennai Port']
  },
  {
    id: 'boiled-sona-masoori',
    name: 'Boiled Sona Masoori Rice',
    category: 'rice',
    origin: 'Kakinada / Guntur, Andhra Pradesh',
    moq: '25 MT · Jute / PP Bags',
    packaging: '25kg / 50kg Export Master Bags',
    price: '$79.00',
    specifications: {
      'Process': 'Parboiled Golden Kernel',
      'Grain Length': '5.15 mm',
      'Moisture': 'Under 13%',
      'Sortex': '100% Machine Cleaned'
    },
    image: '/assets/rice_boiled_sona.png',
    inStock: true,
    transitPorts: ['Kakinada Port', 'Chennai Port']
  },
  {
    id: '1121-xxl-basmati-rice',
    name: 'Traditional 1121 XXL Basmati Rice',
    category: 'rice',
    origin: 'Haryana & Punjab, India',
    moq: '25 MT (1x40ft HC FCL)',
    packaging: '10kg / 20kg / 25kg BoPP Bags',
    price: '$98.00',
    specifications: {
      'Average Grain Length': '8.35 mm+',
      'Moisture': 'Under 11.5%',
      'Elongation': '2.5x Post Cooking',
      'Purity': '95%+'
    },
    image: '/assets/rice.webp',
    inStock: true,
    transitPorts: ['Mundra Port', 'JNPT Nhava Sheva']
  },
  {
    id: '1-yr-hmt-sona-raw',
    name: '1 Year Old HMT Sona Raw',
    category: 'rice',
    origin: 'Telangana & Andhra Pradesh, India',
    moq: '20 MT · 25kg PP Bags',
    packaging: '25kg PP Bags',
    price: '$80.00',
    specifications: {
      'Grain Length': '5.40 mm',
      'Quality': 'Heirloom Table Rice',
      'Moisture': 'Under 11.5%',
      'Broken': 'Under 1.0%'
    },
    image: '/assets/rice_hmt_sona.png',
    inStock: true,
    transitPorts: ['Chennai Port']
  },
  {
    id: 'kolam-steam-rice',
    name: 'Kolam Steam Rice',
    category: 'rice',
    origin: 'Gujarat & Maharashtra, India',
    moq: '25 MT · Export Master Bags',
    packaging: '25kg / 50kg Bags',
    price: '$75.00',
    specifications: {
      'Grain Length': '4.90 mm',
      'Texture': 'Fluffy Non-Sticky',
      'Moisture': 'Under 12.5%'
    },
    image: '/assets/rice_kolam_steam.png',
    inStock: true,
    transitPorts: ['JNPT', 'Mundra Port']
  },
  {
    id: 'custom-mill-specification',
    name: 'Custom Mill Specification Rice',
    category: 'rice',
    origin: 'Custom Sourced AP / Punjab Mills',
    moq: '50 MT · Private Label BOPP Bags',
    packaging: '5kg to 50kg Private Label',
    price: '$85.00',
    specifications: {
      'Specs': 'Tailored Sortex & Broken Tolerance',
      'Packaging': 'OEM Private Label Branding',
      'Purity': 'Up to 98%'
    },
    image: '/assets/r/Custom Mill Specification.png',
    inStock: true,
    transitPorts: ['Mundra', 'Chennai', 'Kakinada']
  },
  {
    id: 'ruby-pomegranate',
    name: 'Fresh Bhagwa Ruby Red Pomegranates',
    category: 'fruits',
    origin: 'Solapur, Maharashtra, India',
    moq: '10 MT MOQ · 5kg CFB',
    packaging: '3.5kg / 5kg Cartons with Net Sleeves',
    price: '$98.00',
    specifications: {
      'Brix': '16.0%+',
      'Arils': 'Deep Ruby Red',
      'Certification': 'GlobalG.A.P. & APEDA Certified'
    },
    image: '/assets/pomegranate.webp',
    inStock: true,
    transitPorts: ['JNPT Nhava Sheva']
  },
  {
    id: 'g4-green-chilly',
    name: 'Fresh Green Chilly (G4)',
    category: 'chilly',
    origin: 'Guntur, Andhra Pradesh, India',
    moq: '10 MT MOQ · 4kg CFB',
    packaging: '4kg Ventilated CFB Cartons',
    price: '$45.00',
    specifications: {
      'Length': '8 - 12 cm',
      'Pre-cooling': 'Rapid air 8°C - 10°C at 85% RH',
      'Pungency': 'High SHU'
    },
    image: '/assets/green_chilly.webp',
    inStock: true,
    transitPorts: ['JNPT Nhava Sheva', 'Mundra Port']
  },
  {
    id: 'organic-makhana',
    name: 'Organic Popped Makhana',
    category: 'makhana',
    origin: 'Mithila Region, Bihar, India',
    moq: '5 MT MOQ · Food Grade Bags',
    packaging: '10kg Nitrogen Flushed Barrier Foil Bags',
    price: '$72.00',
    specifications: {
      'Grading': '5-6 Sutta Jumbo Foxnuts',
      'Moisture': 'Under 8%',
      'Certification': '100% Organic Gluten-Free'
    },
    image: '/assets/makhana.webp',
    inStock: true,
    transitPorts: ['Kolkata Port', 'Mundra Port']
  },
  {
    id: 'thompson-seedless-grapes',
    name: 'Thompson Seedless Table Grapes',
    category: 'fruits',
    origin: 'Nashik, Maharashtra, India',
    moq: '12 MT Reefer · 500g Punnets',
    packaging: '500g Punnets in Master Reefer Cartons',
    price: '$64.00',
    specifications: {
      'Brix': '17°+',
      'Preservation': 'Dual Release SO2 Pads',
      'Size': '16 - 18 mm+'
    },
    image: '/assets/grapes.webp',
    inStock: true,
    transitPorts: ['JNPT Nhava Sheva']
  },
  {
    id: 'taiwan-pink-guava',
    name: 'Fresh Taiwan Pink Guavas',
    category: 'fruits',
    origin: 'Andhra Pradesh & Karnataka, India',
    moq: '10 MT MOQ · Foam Net Pack',
    packaging: '5kg Ventilated Master Box with Foam Sleeves',
    price: '$52.00',
    specifications: {
      'Flesh': 'Fragrant Pink Crisp Flesh',
      'Protection': 'Individually Foam Netted'
    },
    image: '/assets/guava.webp',
    inStock: true,
    transitPorts: ['Chennai Port', 'JNPT']
  },
  {
    id: 'black-tiger-prawns',
    name: 'Black Tiger Sea Prawns',
    category: 'marine',
    origin: 'Coastal Andhra Pradesh, India',
    moq: '10 MT Reefer · 1kg Retail Block',
    packaging: '10x1kg Master Export Reefer Cartons',
    price: '$110.00',
    specifications: {
      'Grade': 'U/15 Headless Shell-On',
      'Freezing': 'IQF Blast Frozen at -40°C',
      'Certification': 'MPEDA & EU Export Approved'
    },
    image: '/assets/prawns.png',
    inStock: true,
    transitPorts: ['Visakhapatnam Port', 'Cochin Port']
  }
];

const INITIAL_USERS: MobileAppUser[] = [
  {
    id: 'usr_buyer_01',
    userId: 'ANVI-AE-8840',
    password: 'AnviDubai2026!',
    role: 'buyer',
    companyName: 'Gulf Harvest Trading LLC',
    contactName: 'Tariq Al-Mansoor',
    email: 'tariq@gulfharvest.ae',
    phone: '+971 50 884 1029',
    destinationPort: 'Jebel Ali Port (Dubai, UAE)',
    status: 'ACTIVE',
    assignedContainer: 'AM-8840',
    allocatedCommodities: ['1121-xxl-basmati-rice', 'g4-green-chilly'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'usr_farmer_01',
    userId: 'FARMER-AP-108',
    password: 'KisanTrade@2026',
    role: 'farmer',
    companyName: 'Andhra Organic Farmer FPO',
    contactName: 'Rameshwar Patil',
    email: 'rameshwar@kisanfpo.in',
    phone: '+91 98480 12345',
    destinationPort: 'Guntur APMC Mandi Hub (Andhra Pradesh)',
    mandiLocation: 'Guntur APMC Grain Market Yard',
    status: 'ACTIVE',
    assignedContainer: 'AM-7721',
    allocatedCommodities: ['sona-masoori-steam', '1-year-raw-sona'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    lastLoginAt: new Date().toISOString()
  }
];

const INITIAL_FARMER_LISTINGS: FarmerListing[] = [
  {
    id: 'farm-prod-1',
    farmerId: 'usr_farmer_01',
    farmerName: 'Rameshwar Patil',
    farmLocation: 'Solapur Orchard Cluster, Maharashtra',
    mandiHub: 'Solapur APMC Hub',
    cropName: 'Export Bhagwa Ruby Pomegranates',
    variety: 'Bhagwa · Brix 16.5°+ High Sweetness',
    category: 'fruits',
    askingPrice: '₹115 / kg',
    askingPriceUnit: '₹115 / kg',
    priceUsd: '$1.38 / kg',
    mandiBenchmark: '₹108 / kg',
    priceTrend: '+6.4% above mandi MSP',
    lotQuantity: '15 Metric Tons',
    packaging: 'Export CFB Master Boxes (5kg Net)',
    harvestDate: 'Fresh Harvest · Current Season',
    moistureOrSpecs: 'Arils: Deep Ruby Red · Foam Net Wrapped',
    verifiedGrade: 'GLOBALG.A.P. CERTIFIED',
    image: 'preset-pom',
    status: 'Available',
    rfqCount: 4,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'farm-prod-2',
    farmerId: 'usr_farmer_01',
    farmerName: 'Srinivasa Rao',
    farmLocation: 'Bellary & Kurnool Belt, AP / Karnataka',
    mandiHub: 'Kurnool APMC Grain Yard',
    cropName: 'Sona Masoori Steam Rice (Paddy Lot)',
    variety: '5.20mm Sortex Clean · Low Broken',
    category: 'rice',
    askingPrice: '₹4,150 / Quintal',
    askingPriceUnit: '₹4,150 / Quintal',
    priceUsd: '$498 / MT',
    mandiBenchmark: '₹3,920 / Quintal',
    priceTrend: '+5.8% above mandi MSP',
    lotQuantity: '40 Metric Tons',
    packaging: '50kg Moisture Barrier PP Bags',
    harvestDate: 'Aged Silo Lot · Moisture 12.2%',
    moistureOrSpecs: 'Machine Sortex · Moisture ≤ 12.5%',
    verifiedGrade: 'APEDA SORTEX GRADE 1',
    image: 'preset-steam-sona',
    status: 'Available',
    rfqCount: 7,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

const INITIAL_CONTAINERS: Record<string, ContainerTracking> = {
  'AM-8840': {
    containerId: 'AM-8840',
    commodity: '1x40ft HC Traditional 1121 Basmati Rice',
    volume: '26 MT',
    pol: 'Mundra Port (INMUN1), India',
    pod: 'Jebel Ali Port (AEJEA), Dubai, UAE',
    status: 'In Transit',
    vesselName: 'MSC ARINA / Voyage 2603W',
    eta: 'Transit Ready (~4-6 Days)',
    progressPercent: 68,
    coordinates: {
      lat: 23.456,
      lng: 62.891
    },
    lastUpdated: new Date().toISOString()
  },
  'AM-7721': {
    containerId: 'AM-7721',
    commodity: '1x40ft Reefer Fresh G4 Green Chilly',
    volume: '18 MT',
    pol: 'JNPT Nhava Sheva (INNSA), India',
    pod: 'Rotterdam Port (NLRTM), Netherlands',
    status: 'In Transit',
    vesselName: 'MAERSK MC-KINNEY MOLLER',
    eta: 'ETA: 14 Days',
    progressPercent: 42,
    coordinates: {
      lat: 12.789,
      lng: 48.213
    },
    lastUpdated: new Date().toISOString()
  }
};

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || INITIAL_USERS,
          commodities: parsed.commodities || INITIAL_COMMODITIES,
          farmerListings: parsed.farmerListings || INITIAL_FARMER_LISTINGS,
          orders: parsed.orders || [],
          containers: parsed.containers || INITIAL_CONTAINERS
        };
      }
    } catch (err) {
      console.error('[DB] Error reading store file, initializing with fresh schema:', err);
    }

    // Default initialization
    const initialSchema: DatabaseSchema = {
      users: INITIAL_USERS,
      commodities: INITIAL_COMMODITIES,
      farmerListings: INITIAL_FARMER_LISTINGS,
      orders: [],
      containers: INITIAL_CONTAINERS
    };

    this.saveData(initialSchema);
    return initialSchema;
  }

  private saveData(dataToSave?: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save store file:', err);
    }
  }

  // --- USER OPERATIONS ---
  public getUsers(roleFilter?: 'buyer' | 'farmer'): MobileAppUser[] {
    if (roleFilter) {
      return this.data.users.filter(u => u.role === roleFilter);
    }
    return this.data.users;
  }

  public getUserById(id: string): MobileAppUser | undefined {
    return this.data.users.find(u => u.id === id || u.userId.toLowerCase() === id.toLowerCase());
  }

  public getUserByLogin(identifier: string): MobileAppUser | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(
      u => u.userId.toLowerCase() === clean || u.email.toLowerCase() === clean
    );
  }

  public createUser(userData: Omit<MobileAppUser, 'id' | 'createdAt'>): MobileAppUser {
    const newUser: MobileAppUser = {
      id: `usr_${userData.role}_${Date.now().toString().slice(-6)}`,
      ...userData,
      status: userData.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.data.users.unshift(newUser);
    this.saveData();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<MobileAppUser>): MobileAppUser | null {
    const userIndex = this.data.users.findIndex(u => u.id === id || u.userId.toLowerCase() === id.toLowerCase());
    if (userIndex === -1) return null;

    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...updates
    };

    this.saveData();
    return this.data.users[userIndex];
  }

  public deleteUser(id: string): boolean {
    const prevLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id && u.userId.toLowerCase() !== id.toLowerCase());
    if (this.data.users.length !== prevLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- COMMODITY OPERATIONS ---
  public getCommodities(): Commodity[] {
    return this.data.commodities;
  }

  // --- FARMER LISTINGS OPERATIONS ---
  public getFarmerListings(): FarmerListing[] {
    return this.data.farmerListings;
  }

  public createFarmerListing(listing: Omit<FarmerListing, 'id' | 'createdAt' | 'rfqCount'>): FarmerListing {
    const newListing: FarmerListing = {
      id: `farm_lot_${Date.now()}`,
      ...listing,
      rfqCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.farmerListings.unshift(newListing);
    this.saveData();
    return newListing;
  }

  // --- ORDER OPERATIONS ---
  public getOrders(): OrderRequest[] {
    return this.data.orders;
  }

  public createOrder(orderData: Omit<OrderRequest, 'id' | 'status' | 'createdAt'>): OrderRequest {
    const newOrder: OrderRequest = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      ...orderData,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString()
    };
    this.data.orders.unshift(newOrder);
    this.saveData();
    return newOrder;
  }

  // --- CONTAINER TRACKINGS ---
  public getContainers(): Record<string, ContainerTracking> {
    return this.data.containers;
  }

  public getContainerById(id: string): ContainerTracking | undefined {
    return this.data.containers[id.toUpperCase()];
  }

  // --- ADMIN STATS ---
  public getStats(): AdminMobileStats {
    const buyers = this.data.users.filter(u => u.role === 'buyer');
    const farmers = this.data.users.filter(u => u.role === 'farmer');
    return {
      totalMobileUsers: this.data.users.length,
      buyersCount: buyers.length,
      farmersCount: farmers.length,
      activeUsers: this.data.users.filter(u => u.status === 'ACTIVE').length,
      suspendedUsers: this.data.users.filter(u => u.status === 'SUSPENDED').length,
      totalOrders: this.data.orders.length,
      activeShipmentsTracked: Object.keys(this.data.containers).length
    };
  }
}

export const db = new DatabaseService();
