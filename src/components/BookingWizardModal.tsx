'use client';

import React from 'react';
import { X } from 'lucide-react';
import { BookingWizard, BookingWizardInitialState } from './BookingWizard';
import { Booking } from '@/types';

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState?: BookingWizardInitialState;
  onSuccess?: (booking: Booking) => void;
}

export function BookingWizardModal({
  isOpen,
  onClose,
  initialState,
  onSuccess,
}: BookingWizardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl my-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 sm:-right-4 size-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20 z-20"
          aria-label="Закрыть"
        >
          <X className="size-5" />
        </button>

        <BookingWizard
          initialState={initialState}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
