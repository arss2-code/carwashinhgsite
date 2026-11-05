import { Bay, BayId, Booking, WashType, VehicleClassId } from '@/types';
import { VEHICLE_CLASSES, SERVICE_PACKAGES, ADD_ON_SERVICES } from './data';
import { timeToMinutes, minutesToTime } from './formatters';

export const BUFFER_MINUTES = 10; // 10-minute technical buffer between bookings

export interface BookingCalculation {
  basePrice: number;
  classMultiplier: number;
  packagePrice: number;
  addonsPrice: number;
  totalPrice: number;
  baseDuration: number;
  classDurationMultiplier: number;
  packageDuration: number;
  addonsDuration: number;
  serviceDuration: number; // without buffer
  totalDurationWithBuffer: number; // with buffer
}

/**
 * Calculates pricing and duration based on package, vehicle class, and add-ons
 */
export function calculateBookingMetrics(
  packageId: string,
  vehicleClassId: VehicleClassId,
  addonIds: string[] = []
): BookingCalculation {
  const pkg = SERVICE_PACKAGES.find((p) => p.id === packageId) || SERVICE_PACKAGES[0];
  const vClass = VEHICLE_CLASSES.find((c) => c.id === vehicleClassId) || VEHICLE_CLASSES[0];

  const classMultiplier = vClass.priceMultiplier;
  const packagePrice = Math.round(pkg.basePrice * classMultiplier);

  const addonsPrice = addonIds.reduce((sum, id) => {
    const addon = ADD_ON_SERVICES.find((a) => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const totalPrice = packagePrice + addonsPrice;

  // Duration
  const classDurationMultiplier = vClass.durationMultiplier;
  const packageDuration = Math.ceil(pkg.baseDurationMinutes * classDurationMultiplier);

  const addonsDuration = addonIds.reduce((sum, id) => {
    const addon = ADD_ON_SERVICES.find((a) => a.id === id);
    return sum + (addon ? addon.durationMinutes : 0);
  }, 0);

  const serviceDuration = packageDuration + addonsDuration;
  const totalDurationWithBuffer = serviceDuration + BUFFER_MINUTES;

  return {
    basePrice: pkg.basePrice,
    classMultiplier,
    packagePrice,
    addonsPrice,
    totalPrice,
    baseDuration: pkg.baseDurationMinutes,
    classDurationMultiplier,
    packageDuration,
    addonsDuration,
    serviceDuration,
    totalDurationWithBuffer,
  };
}

/**
 * Checks whether two time windows [s1, e1] and [s2, e2] overlap
 */
export function isOverlapping(s1: number, e1: number, s2: number, e2: number): boolean {
  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Checks if a specific Bay is free during a time window on a specific date
 */
export function isBayAvailable(
  bayId: BayId,
  date: string,
  startMins: number,
  durationWithBuffer: number,
  bookings: Booking[],
  bays: Bay[]
): boolean {
  // Check if bay is under maintenance
  const bay = bays.find((b) => b.id === bayId);
  if (bay && bay.status === 'maintenance') {
    return false;
  }

  const endMins = startMins + durationWithBuffer;

  // Filter bookings for this bay on this date that are not cancelled
  const dayBookings = bookings.filter(
    (b) => b.bayId === bayId && b.date === date && b.status !== 'cancelled'
  );

  for (const b of dayBookings) {
    const bStart = timeToMinutes(b.startTime);
    // Include 10-minute buffer after previous booking
    const bEnd = timeToMinutes(b.endTime) + BUFFER_MINUTES;

    if (isOverlapping(startMins, endMins, bStart, bEnd)) {
      return false;
    }
  }

  return true;
}

/**
 * Dual-track scheduling algorithm:
 * - Robot: Checked only against Bay 1.
 * - Manual: Checked concurrently against Bay 2 and Bay 3.
 * Returns the assigned bay id, or null if no bay is available.
 */
export function allocateBayForSlot(
  washType: WashType,
  date: string,
  startTime: string,
  durationWithBuffer: number,
  bookings: Booking[],
  bays: Bay[]
): BayId | null {
  const startMins = timeToMinutes(startTime);

  if (washType === 'robot') {
    // Only Bay 1
    if (isBayAvailable(1, date, startMins, durationWithBuffer, bookings, bays)) {
      return 1;
    }
    return null;
  }

  // Manual: Can be served by Bay 2 or Bay 3
  const isBay2Free = isBayAvailable(2, date, startMins, durationWithBuffer, bookings, bays);
  if (isBay2Free) {
    return 2;
  }

  const isBay3Free = isBayAvailable(3, date, startMins, durationWithBuffer, bookings, bays);
  if (isBay3Free) {
    return 3;
  }

  return null;
}

export interface GeneratedTimeSlot {
  time: string; // "14:30"
  available: boolean;
  assignedBayId: BayId | null;
  reason?: string;
}

/**
 * Generates slots for a full working day (08:00 - 22:30)
 * Robot: 15-minute slot grid
 * Manual: 30-minute slot grid
 */
export function generateAvailableSlots(
  date: string,
  washType: WashType,
  durationWithBuffer: number,
  bookings: Booking[],
  bays: Bay[]
): GeneratedTimeSlot[] {
  const slots: GeneratedTimeSlot[] = [];
  const startHour = 8;
  const endHour = 22;
  const intervalMinutes = washType === 'robot' ? 15 : 30;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const isToday = date === todayStr;
  const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  for (let mins = startHour * 60; mins <= endHour * 60; mins += intervalMinutes) {
    const timeStr = minutesToTime(mins);

    // If booking for today, slots in the past are unavailable
    if (isToday && mins < currentMinutesFromMidnight + 15) {
      slots.push({
        time: timeStr,
        available: false,
        assignedBayId: null,
        reason: 'Время уже прошло',
      });
      continue;
    }

    const assignedBay = allocateBayForSlot(
      washType,
      date,
      timeStr,
      durationWithBuffer,
      bookings,
      bays
    );

    if (assignedBay !== null) {
      slots.push({
        time: timeStr,
        available: true,
        assignedBayId: assignedBay,
      });
    } else {
      const reason =
        washType === 'robot'
          ? 'Бокс №1 (Робот) занят'
          : 'Оба ручных бокса (№2 и №3) заняты на это время';
      slots.push({
        time: timeStr,
        available: false,
        assignedBayId: null,
        reason,
      });
    }
  }

  return slots;
}
