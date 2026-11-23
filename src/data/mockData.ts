import { Commodity, ContainerTracking, MobileAppUser } from '../types/index.js';
import { db } from './db.js';

// Re-export persistent db collections to ensure backward compatibility
export const COMMODITIES: Commodity[] = db.getCommodities();
export const LIVE_CONTAINERS: Record<string, ContainerTracking> = db.getContainers();
export const MOBILE_USERS: MobileAppUser[] = db.getUsers();
