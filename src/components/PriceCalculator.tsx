'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VEHICLE_CLASSES, SERVICE_PACKAGES, ADD_ON_SERVICES } from '@/lib/data';
import { formatPrice, formatDuration } from '@/lib/formatters';
import { calculateBookingMetrics } from '@/lib/bookingEngine';
import { VehicleClassId, WashType } from '@/types';

interface PriceCalculatorProps {
  onConfigureBooking: (params: {
    vehicleClassId: VehicleClassId;
    washType: WashType;
    packageId: string;
    addOnIds: string[];
  }) => void;
}

export function PriceCalculator({ onConfigureBooking }: PriceCalculatorProps) {
  const [selectedClassId, setSelectedClassId] = useState<VehicleClassId>(1);
  const [washType, setWashType] = useState<WashType>('manual');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('manual_complex');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(['addon_tires']);

  // If washType changes, select default package for that type
  const handleWashTypeChange = (type: WashType) => {
    setWashType(type);
    if (type === 'robot') {
      setSelectedPackageId('robot_standard');
    } else {
      setSelectedPackageId('manual_complex');
    }
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter packages by wash type
  const availablePackages = useMemo(
    () => SERVICE_PACKAGES.filter((p) => p.washType === washType),
    [washType]
  );

  // Selected vehicle class details
  const currentClass = useMemo(
    () => VEHICLE_CLASSES.find((c) => c.id === selectedClassId) || VEHICLE_CLASSES[0],
    [selectedClassId]
  );

  // Calculation
  const calculation = useMemo(
    () => calculateBookingMetrics(selectedPackageId, selectedClassId, selectedAddonIds),
    [selectedPackageId, selectedClassId, selectedAddonIds]
  );

  const selectedPackage = useMemo(
    () => SERVICE_PACKAGES.find((p) => p.id === selectedPackageId) || availablePackages[0],
    [selectedPackageId, availablePackages]
  );

  const handleProceed = () => {
    onConfigureBooking({
      vehicleClassId: selectedClassId,
      washType,
      packageId: selectedPackageId,
      addOnIds: selectedAddonIds,
    });
  };

  return (
    <section id="calculator" className="relative py-16 bg-[#0a0d14] border-t border-white/5">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <Badge variant="outline" className="mb-3 border-cyan-500/40 text-cyan-400 bg-cyan-950/30 px-3 py-1">
            <Calculator className="size-3.5 mr-1.5" />
            Интерактивный расчет
          </Badge>
          <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
            Калькулятор стоимости и времени обслуживания
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Узнайте точную стоимость с учетом класса вашего автомобиля и желаемых детейлинг-опций без скрытых наценок.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (Left - 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Vehicle Class */}
            <div className="rounded-2xl bg-[#11141e]/90 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-black">
                    1
                  </span>
                  Выберите класс вашего автомобиля
                </span>
                <span className="text-xs text-zinc-400">Коэффициент габаритов</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VEHICLE_CLASSES.map((vc) => {
                  const isSelected = selectedClassId === vc.id;
                  return (
                    <button
                      key={vc.id}
                      type="button"
                      onClick={() => setSelectedClassId(vc.id)}
                      className={`relative flex flex-col text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500 text-white shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/50'
                          : 'bg-black/30 border-white/10 text-zinc-300 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">{vc.category}</span>
                        {isSelected && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-cyan-500 text-black">
                            <Check className="size-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mb-2">{vc.description}</p>
                      <p className="text-[11px] text-zinc-500 italic mt-auto">
                        Примеры: {vc.examples}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Wash Type & Packages */}
            <div className="rounded-2xl bg-[#11141e]/90 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-black">
                    2
                  </span>
                  Выберите зону и программу мойки
                </span>

                {/* Wash type tabs */}
                <div className="inline-flex rounded-lg bg-black/50 p-1 border border-white/10">
                  <button
                    onClick={() => handleWashTypeChange('manual')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      washType === 'manual'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Ручная (Боксы 2/3)
                  </button>
                  <button
                    onClick={() => handleWashTypeChange('robot')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      washType === 'robot'
                        ? 'bg-cyan-500 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Робот (Бокс 1)
                  </button>
                </div>
              </div>

              {/* Package cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availablePackages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  const priceForClass = Math.round(pkg.basePrice * currentClass.priceMultiplier);
                  const durationForClass = Math.ceil(
                    pkg.baseDurationMinutes * currentClass.durationMultiplier
                  );

                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500 text-white shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/50'
                          : 'bg-black/30 border-white/10 text-zinc-300 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-sm text-white">{pkg.name}</span>
                        {isSelected && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-cyan-500 text-black shrink-0">
                            <Check className="size-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{pkg.shortDesc}</p>
                      <div className="mt-auto flex items-baseline justify-between pt-2 border-t border-white/5">
                        <span className="text-base font-extrabold text-white">
                          {formatPrice(priceForClass)}
                        </span>
                        <span className="text-xs text-cyan-400 font-medium">
                          ~{durationForClass} мин
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Add-on services */}
            <div className="rounded-2xl bg-[#11141e]/90 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-black">
                    3
                  </span>
                  Дополнительные детейлинг-опции
                </span>
                <span className="text-xs text-zinc-400">Выберите при необходимости</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADD_ON_SERVICES.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-cyan-950/25 border-cyan-500/60 text-white shadow-sm'
                          : 'bg-black/30 border-white/10 text-zinc-300 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-5 items-center justify-center rounded border transition-colors ${
                            isChecked
                              ? 'bg-cyan-500 border-cyan-500 text-black'
                              : 'border-white/30 bg-black/40'
                          }`}
                        >
                          {isChecked && <Check className="size-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{addon.name}</p>
                          <p className="text-[11px] text-zinc-400">{addon.shortDesc}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <span className="text-xs font-bold text-cyan-300">
                          +{formatPrice(addon.price)}
                        </span>
                        <div className="text-[10px] text-zinc-500">+{addon.durationMinutes} мин</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Receipt & Booking Trigger (Right - 4 cols sticky) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="rounded-2xl bg-gradient-to-b from-[#141824] to-[#0e111a] border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-950/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Итог калькулятора</h3>
                    <p className="text-[11px] text-zinc-400">Мгновенный расчет заказа</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-cyan-500/40 text-cyan-400 bg-cyan-950/30 text-xs"
                >
                  {washType === 'robot' ? 'Бокс №1 (Робот)' : 'Бокс №2 или №3'}
                </Badge>
              </div>

              {/* Itemized list */}
              <div className="space-y-3 text-xs mb-6">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Класс автомобиля:</span>
                  <span className="font-semibold text-white text-right">
                    {currentClass.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span>Основная программа:</span>
                  <span className="font-semibold text-white text-right">
                    {selectedPackage.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-400 pl-2">
                  <span>Стоимость программы:</span>
                  <span className="font-medium text-zinc-200">
                    {formatPrice(calculation.packagePrice)}
                  </span>
                </div>

                {selectedAddonIds.length > 0 && (
                  <div className="border-t border-white/5 pt-2">
                    <span className="text-zinc-400 block mb-1 font-medium">Дополнительные опции ({selectedAddonIds.length}):</span>
                    {selectedAddonIds.map((id) => {
                      const addon = ADD_ON_SERVICES.find((a) => a.id === id);
                      if (!addon) return null;
                      return (
                        <div key={id} className="flex justify-between text-[11px] text-zinc-300 py-0.5 pl-2">
                          <span className="truncate pr-2">{addon.name.split(' (')[0]}</span>
                          <span className="text-cyan-300 font-medium shrink-0">
                            +{formatPrice(addon.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 text-cyan-400" />
                    Ориентировочное время:
                  </span>
                  <span className="font-bold text-white text-sm">
                    {formatDuration(calculation.serviceDuration)}
                  </span>
                </div>
              </div>

              {/* Total Price Big Display */}
              <div className="rounded-xl bg-black/60 border border-cyan-500/30 p-4 mb-6 text-center">
                <span className="text-xs uppercase tracking-wider text-zinc-400 block mb-1 font-semibold">
                  Итоговая стоимость
                </span>
                <div className="text-3xl font-black text-white tracking-tight text-glow-cyan">
                  {formatPrice(calculation.totalPrice)}
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">
                  Оплата картой или наличными после завершения мойки
                </span>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleProceed}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold h-12 shadow-xl shadow-cyan-500/25 border-0 gap-2 transition-all"
              >
                <span>Записаться с этими опциями</span>
                <ArrowRight className="size-4" />
              </Button>

              <p className="text-[11px] text-zinc-500 text-center mt-3">
                Система автоматически подберет свободный бокс на выбранное вами время
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
