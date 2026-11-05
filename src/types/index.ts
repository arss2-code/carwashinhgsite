export type VehicleClassId = 1 | 2 | 3 | 4;

export interface VehicleClass {
  id: VehicleClassId;
  name: string;
  category: string;
  description: string;
  examples: string;
  priceMultiplier: number;
  durationMultiplier: number;
  iconName: string;
}

export type WashType = 'robot' | 'manual';

export type BayId = 1 | 2 | 3;

export type BayStatus = 'idle' | 'washing' | 'maintenance';

export interface Bay {
  id: BayId;
  name: string;
  type: WashType;
  title: string;
  badge: string;
  description: string;
  capacity: number; // always 1 per bay
  status: BayStatus;
  currentBookingId?: string;
  maintenanceReason?: string;
}

export interface ServicePackage {
  id: string;
  washType: WashType;
  name: string;
  shortDesc: string;
  fullDesc: string;
  baseDurationMinutes: number;
  basePrice: number;
  features: string[];
  badge?: string;
  popular?: boolean;
  recommendedFor?: string;
}

export interface AddOnService {
  id: string;
  name: string;
  shortDesc: string;
  durationMinutes: number;
  price: number;
  category: 'exterior' | 'interior' | 'protection';
  icon: string;
}

export type BookingStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string; // e.g. "AQ-74192"
  createdAt: string; // ISO date string
  clientName: string;
  clientPhone: string;
  carPlate: string; // e.g. "А 777 АА 777"
  carModel: string; // e.g. "BMW X5"
  vehicleClassId: VehicleClassId;
  washType: WashType;
  bayId: BayId;
  packageId: string;
  addOnIds: string[];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalDurationMinutes: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  isWalkIn?: boolean;
}

export interface SlotAvailability {
  time: string; // HH:mm
  bayId: BayId;
  available: boolean;
  reason?: string;
}
