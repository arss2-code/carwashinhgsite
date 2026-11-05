'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { LiveBayTracker } from '@/components/LiveBayTracker';
import { ServicesSection } from '@/components/ServicesSection';
import { PriceCalculator } from '@/components/PriceCalculator';
import { AboutSection } from '@/components/AboutSection';
import { ReviewsSection } from '@/components/ReviewsSection';
import { ContactsSection } from '@/components/ContactsSection';
import { Footer } from '@/components/Footer';
import { BookingWizardModal } from '@/components/BookingWizardModal';
import { BookingWizard, BookingWizardInitialState } from '@/components/BookingWizard';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { BayId, VehicleClassId, WashType } from '@/types';

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [wizardState, setWizardState] = useState<BookingWizardInitialState>({
    washType: 'manual',
    vehicleClassId: 1,
    packageId: 'manual_complex',
  });

  const handleOpenBookingModal = (state?: BookingWizardInitialState) => {
    if (state) {
      setWizardState(state);
    }
    setModalOpen(true);
  };

  const handleSelectBay = (bayId: BayId) => {
    const washType: WashType = bayId === 1 ? 'robot' : 'manual';
    const packageId = washType === 'robot' ? 'robot_standard' : 'manual_complex';
    handleOpenBookingModal({
      bayId,
      washType,
      packageId,
    });
  };

  const handleSelectPackage = (packageId: string) => {
    const isRobot = packageId.startsWith('robot_');
    handleOpenBookingModal({
      washType: isRobot ? 'robot' : 'manual',
      packageId,
    });
  };

  const handleConfigureFromCalculator = (params: {
    vehicleClassId: VehicleClassId;
    washType: WashType;
    packageId: string;
    addOnIds: string[];
  }) => {
    handleOpenBookingModal(params);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090b10] text-[#f3f4f6]">
      <Header onOpenBooking={() => handleOpenBookingModal()} />

      <main className="flex-1">
        {/* 1. Hero with live telemetry bar */}
        <HeroSection onOpenBooking={() => handleOpenBookingModal()} />

        {/* 2. Interactive Real-Time 3-Bay Status */}
        <LiveBayTracker onSelectBayForBooking={handleSelectBay} />

        {/* 3. Services and Pricing Packages */}
        <ServicesSection onSelectPackageForBooking={handleSelectPackage} />

        {/* 4. Interactive Price & Time Calculator */}
        <PriceCalculator onConfigureBooking={handleConfigureFromCalculator} />

        {/* 5. Embedded On-Page Booking Engine */}
        <section id="booking" className="py-16 bg-[#0c0f18] border-t border-white/5 relative">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-10">
              <Badge variant="outline" className="mb-2 border-cyan-500/40 text-cyan-400 bg-cyan-950/30 px-3 py-1">
                <Calendar className="size-3.5 mr-1.5" />
                Интеллектуальная система бронирования
              </Badge>
              <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
                Онлайн-запись в автомоечный комплекс
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Выберите желаемые услуги, автомобиль и удобный временной слот. Алгоритм распределения автоматически выделит свободный бокс без пересечений и очередей.
              </p>
            </div>

            <BookingWizard />
          </div>
        </section>

        {/* 6. About the Complex & Equipment */}
        <AboutSection />

        {/* 7. Customer Reviews & Ratings */}
        <ReviewsSection />

        {/* 8. Location & Driving Directions */}
        <ContactsSection />
      </main>

      <Footer />

      {/* Global Booking Modal */}
      <BookingWizardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialState={wizardState}
      />
    </div>
  );
}
