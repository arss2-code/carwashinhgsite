'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Bay, BayId, Booking, BookingStatus, VehicleClassId, WashType } from '@/types';
import { INITIAL_BAYS, INITIAL_BOOKINGS, getTodayDateString } from '@/lib/data';
import {
  allocateBayForSlot,
  calculateBookingMetrics,
} from '@/lib/bookingEngine';
import {
  calculateEndTime,
  generateBookingId,
  timeToMinutes,
} from '@/lib/formatters';

interface CreateBookingParams {
  clientName: string;
  clientPhone: string;
  carPlate: string;
  carModel: string;
  vehicleClassId: VehicleClassId;
  washType: WashType;
  packageId: string;
  addOnIds: string[];
  date: string;
  startTime: string;
  notes?: string;
  isWalkIn?: boolean;
}

interface CarWashContextType {
  bookings: Booking[];
  bays: Bay[];
  addBooking: (params: CreateBookingParams) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string) => boolean;
  rescheduleBooking: (bookingId: string, newDate: string, newStartTime: string) => boolean;
  getBookingById: (id: string) => Booking | undefined;
  findBookingsByPhoneOrPlate: (query: string) => Booking[];
  toggleBayMaintenance: (bayId: BayId, reason?: string) => void;
  createWalkInBooking: (params: {
    bayId: BayId;
    carPlate: string;
    carModel: string;
    vehicleClassId: VehicleClassId;
    packageId: string;
    clientPhone?: string;
    clientName?: string;
  }) => Booking;
  resetToInitialData: () => void;
  // Computed helpers
  getBayLiveStatus: (bayId: BayId) => {
    bay: Bay;
    status: 'idle' | 'washing' | 'maintenance';
    activeBooking?: Booking;
    remainingMinutes?: number;
    progressPercent?: number;
  };
}

const CarWashContext = createContext<CarWashContextType | undefined>(undefined);

const LOCAL_STORAGE_BOOKINGS_KEY = 'aquapro_carwash_bookings_v1';
const LOCAL_STORAGE_BAYS_KEY = 'aquapro_carwash_bays_v1';

export function CarWashProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load bookings from localStorage', e);
      }
    }
    return INITIAL_BOOKINGS;
  });

  const [bays, setBays] = useState<Bay[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_BAYS_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load bays from localStorage', e);
      }
    }
    return INITIAL_BAYS;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
      } catch (e) {
        console.error('Failed to save bookings to localStorage', e);
      }
    }
  }, [bookings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_BAYS_KEY, JSON.stringify(bays));
      } catch (e) {
        console.error('Failed to save bays to localStorage', e);
      }
    }
  }, [bays]);

  // Compute live bay status based on current active bookings
  const getBayLiveStatus = (bayId: BayId) => {
    const bay = bays.find((b) => b.id === bayId) || INITIAL_BAYS[bayId - 1];

    if (bay.status === 'maintenance') {
      return { bay, status: 'maintenance' as const };
    }

    const todayStr = getTodayDateString();
    // Find booking in progress for this bay
    const activeBooking = bookings.find(
      (b) => b.bayId === bayId && b.date === todayStr && b.status === 'in_progress'
    );

    if (activeBooking) {
      const startMins = timeToMinutes(activeBooking.startTime);
      const endMins = timeToMinutes(activeBooking.endTime);
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();

      const elapsed = Math.max(0, currentMins - startMins);
      const total = Math.max(1, endMins - startMins);
      const remainingMinutes = Math.max(0, endMins - currentMins);
      const progressPercent = Math.min(100, Math.round((elapsed / total) * 100));

      return {
        bay,
        status: 'washing' as const,
        activeBooking,
        remainingMinutes: remainingMinutes || 10,
        progressPercent: progressPercent || 45,
      };
    }

    return { bay, status: 'idle' as const };
  };

  const addBooking = (params: CreateBookingParams): Booking => {
    const metrics = calculateBookingMetrics(
      params.packageId,
      params.vehicleClassId,
      params.addOnIds
    );

    // Auto-allocate bay
    let assignedBayId = allocateBayForSlot(
      params.washType,
      params.date,
      params.startTime,
      metrics.totalDurationWithBuffer,
      bookings,
      bays
    );

    // Fallback if slot was explicitly picked
    if (!assignedBayId) {
      assignedBayId = params.washType === 'robot' ? 1 : 2;
    }

    const endTime = calculateEndTime(params.startTime, metrics.serviceDuration);

    const newBooking: Booking = {
      id: generateBookingId(),
      createdAt: new Date().toISOString(),
      clientName: params.clientName,
      clientPhone: params.clientPhone,
      carPlate: params.carPlate,
      carModel: params.carModel,
      vehicleClassId: params.vehicleClassId,
      washType: params.washType,
      bayId: assignedBayId,
      packageId: params.packageId,
      addOnIds: params.addOnIds,
      date: params.date,
      startTime: params.startTime,
      endTime,
      totalDurationMinutes: metrics.serviceDuration,
      totalPrice: metrics.totalPrice,
      status: 'pending',
      notes: params.notes,
      isWalkIn: params.isWalkIn || false,
    };

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const cancelBooking = (bookingId: string): boolean => {
    let success = false;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          success = true;
          return { ...b, status: 'cancelled' };
        }
        return b;
      })
    );
    return success;
  };

  const rescheduleBooking = (
    bookingId: string,
    newDate: string,
    newStartTime: string
  ): boolean => {
    const existing = bookings.find((b) => b.id === bookingId);
    if (!existing) return false;

    const metrics = calculateBookingMetrics(
      existing.packageId,
      existing.vehicleClassId,
      existing.addOnIds
    );

    const otherBookings = bookings.filter((b) => b.id !== bookingId);
    const assignedBayId = allocateBayForSlot(
      existing.washType,
      newDate,
      newStartTime,
      metrics.totalDurationWithBuffer,
      otherBookings,
      bays
    );

    if (!assignedBayId) return false;

    const endTime = calculateEndTime(newStartTime, metrics.serviceDuration);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              date: newDate,
              startTime: newStartTime,
              endTime,
              bayId: assignedBayId,
              status: 'pending',
            }
          : b
      )
    );

    return true;
  };

  const getBookingById = (id: string): Booking | undefined => {
    const normalized = id.trim().toUpperCase();
    return bookings.find((b) => b.id.toUpperCase() === normalized);
  };

  const findBookingsByPhoneOrPlate = (query: string): Booking[] => {
    const cleanQuery = query.trim().replace(/\D/g, '');
    const textQuery = query.trim().toUpperCase().replace(/\s/g, '');

    if (!cleanQuery && !textQuery) return [];

    return bookings.filter((b) => {
      // Check phone match
      const phoneDigits = b.clientPhone.replace(/\D/g, '');
      if (cleanQuery && cleanQuery.length >= 4 && phoneDigits.includes(cleanQuery)) {
        return true;
      }
      // Check plate match
      const plateNoSpaces = b.carPlate.toUpperCase().replace(/\s/g, '');
      if (textQuery && plateNoSpaces.includes(textQuery)) {
        return true;
      }
      // Check ID match
      if (textQuery && b.id.toUpperCase().includes(textQuery)) {
        return true;
      }
      return false;
    });
  };

  const toggleBayMaintenance = (bayId: BayId, reason?: string) => {
    setBays((prev) =>
      prev.map((b) => {
        if (b.id === bayId) {
          const newStatus = b.status === 'maintenance' ? 'idle' : 'maintenance';
          return {
            ...b,
            status: newStatus,
            maintenanceReason: newStatus === 'maintenance' ? reason || 'Плановое ТО и замена фильтров' : undefined,
          };
        }
        return b;
      })
    );
  };

  const createWalkInBooking = (params: {
    bayId: BayId;
    carPlate: string;
    carModel: string;
    vehicleClassId: VehicleClassId;
    packageId: string;
    clientPhone?: string;
    clientName?: string;
  }): Booking => {
    const now = new Date();
    const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const metrics = calculateBookingMetrics(params.packageId, params.vehicleClassId, []);
    const endTime = calculateEndTime(startTime, metrics.serviceDuration);

    const washType: WashType = params.bayId === 1 ? 'robot' : 'manual';

    const newBooking: Booking = {
      id: generateBookingId(),
      createdAt: now.toISOString(),
      clientName: params.clientName || 'Клиент (Живая очередь)',
      clientPhone: params.clientPhone || '+7 (---) --- -- --',
      carPlate: params.carPlate,
      carModel: params.carModel,
      vehicleClassId: params.vehicleClassId,
      washType,
      bayId: params.bayId,
      packageId: params.packageId,
      addOnIds: [],
      date: getTodayDateString(),
      startTime,
      endTime,
      totalDurationMinutes: metrics.serviceDuration,
      totalPrice: metrics.totalPrice,
      status: 'in_progress', // immediately in progress for walk-ins
      isWalkIn: true,
      notes: 'Въезд по живой очереди',
    };

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const resetToInitialData = () => {
    setBookings(INITIAL_BOOKINGS);
    setBays(INITIAL_BAYS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_BOOKINGS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_BAYS_KEY);
    }
  };

  const value = useMemo(
    () => ({
      bookings,
      bays,
      addBooking,
      updateBookingStatus,
      cancelBooking,
      rescheduleBooking,
      getBookingById,
      findBookingsByPhoneOrPlate,
      toggleBayMaintenance,
      createWalkInBooking,
      resetToInitialData,
      getBayLiveStatus,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookings, bays]
  );

  return <CarWashContext.Provider value={value}>{children}</CarWashContext.Provider>;
}

export function useCarWash() {
  const context = useContext(CarWashContext);
  if (!context) {
    throw new Error('useCarWash must be used within a CarWashProvider');
  }
  return context;
}
