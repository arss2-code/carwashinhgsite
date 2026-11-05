'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Bot,
  Layers,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Copy,
  Check,
  User,
  Phone,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCarWash } from '@/context/CarWashContext';
import {
  VEHICLE_CLASSES,
  SERVICE_PACKAGES,
  ADD_ON_SERVICES,
  getTodayDateString,
  getTomorrowDateString,
} from '@/lib/data';
import {
  formatPrice,
  formatDuration,
  formatPhone,
  isValidRussianPhone,
  formatCarPlate,
  formatRuDate,
} from '@/lib/formatters';
import {
  calculateBookingMetrics,
  generateAvailableSlots,
  GeneratedTimeSlot,
} from '@/lib/bookingEngine';
import { VehicleClassId, WashType, BayId, Booking } from '@/types';

export interface BookingWizardInitialState {
  vehicleClassId?: VehicleClassId;
  washType?: WashType;
  packageId?: string;
  addOnIds?: string[];
  bayId?: BayId;
}

interface BookingWizardProps {
  initialState?: BookingWizardInitialState;
  onSuccess?: (booking: Booking) => void;
  onClose?: () => void;
}

export function BookingWizard({ initialState, onSuccess, onClose }: BookingWizardProps) {
  const { bookings, bays, addBooking } = useCarWash();

  // Step 1: Type (robot vs manual)
  const [washType, setWashType] = useState<WashType>(initialState?.washType || 'manual');

  // Step 2: Package & Add-ons
  const [packageId, setPackageId] = useState<string>(
    initialState?.packageId || (washType === 'robot' ? 'robot_standard' : 'manual_complex')
  );
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(
    initialState?.addOnIds || []
  );

  // Step 3: Vehicle Class & Model
  const [vehicleClassId, setVehicleClassId] = useState<VehicleClassId>(
    initialState?.vehicleClassId || 1
  );
  const [carModel, setCarModel] = useState<string>('');

  // Step 4: Date & Slot
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('');
  const [allocatedBayId, setAllocatedBayId] = useState<BayId | null>(null);

  // Step 5: Client Contact Info
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+7 ');
  const [carPlate, setCarPlate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Step 6: Confirmation
  const [step, setStep] = useState<number>(1);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // When washType changes, adjust default package
  const handleWashTypeSelect = (type: WashType) => {
    setWashType(type);
    if (type === 'robot') {
      setPackageId('robot_standard');
    } else {
      setPackageId('manual_complex');
    }
    // reset selected slot if changing type
    setSelectedSlotTime('');
    setAllocatedBayId(null);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Metrics calculation
  const metrics = useMemo(
    () => calculateBookingMetrics(packageId, vehicleClassId, selectedAddonIds),
    [packageId, vehicleClassId, selectedAddonIds]
  );

  // Generate slots dynamically based on bookings and bay allocations
  const availableSlots = useMemo(() => {
    return generateAvailableSlots(
      selectedDate,
      washType,
      metrics.totalDurationWithBuffer,
      bookings,
      bays
    );
  }, [selectedDate, washType, metrics.totalDurationWithBuffer, bookings, bays]);

  // When date changes, reset slot selection
  useEffect(() => {
    setSelectedSlotTime('');
    setAllocatedBayId(null);
  }, [selectedDate]);

  // Handle slot click
  const handleSelectSlot = (slot: GeneratedTimeSlot) => {
    if (!slot.available || !slot.assignedBayId) return;
    setSelectedSlotTime(slot.time);
    setAllocatedBayId(slot.assignedBayId);
  };

  // Phone input mask handler
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setClientPhone(formatted);
    if (validationErrors.phone) {
      setValidationErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  // License plate input mask handler
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCarPlate(e.target.value);
    setCarPlate(formatted);
    if (validationErrors.plate) {
      setValidationErrors((prev) => ({ ...prev, plate: '' }));
    }
  };

  // Next Step validation
  const handleNextStep = () => {
    if (step === 3) {
      if (!carModel.trim()) {
        setValidationErrors((prev) => ({ ...prev, carModel: 'Укажите марку и модель авто' }));
        return;
      }
      setValidationErrors((prev) => ({ ...prev, carModel: '' }));
    }

    if (step === 4) {
      if (!selectedSlotTime) {
        setValidationErrors((prev) => ({ ...prev, slot: 'Выберите свободное время для записи' }));
        return;
      }
      setValidationErrors((prev) => ({ ...prev, slot: '' }));
    }

    if (step === 5) {
      const errors: Record<string, string> = {};
      if (!clientName.trim()) {
        errors.name = 'Пожалуйста, введите ваше имя';
      }
      if (!isValidRussianPhone(clientPhone)) {
        errors.phone = 'Введите корректный номер телефона РФ (+7 999 999-99-99)';
      }
      if (!carPlate.trim() || carPlate.length < 6) {
        errors.plate = 'Введите российский госномер (например, А 777 АА 77)';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Submit booking!
      const newBooking = addBooking({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        carPlate: carPlate.trim(),
        carModel: carModel.trim(),
        vehicleClassId,
        washType,
        packageId,
        addOnIds: selectedAddonIds,
        date: selectedDate,
        startTime: selectedSlotTime,
        notes: notes.trim(),
      });

      setConfirmedBooking(newBooking);
      setStep(6);

      // Confetti celebratory burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#3b82f6'],
        });
      } catch {
        // ignore if window is restricted
      }

      if (onSuccess) {
        onSuccess(newBooking);
      }
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const copyBookingCode = () => {
    if (!confirmedBooking) return;
    navigator.clipboard.writeText(confirmedBooking.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentPackage = SERVICE_PACKAGES.find((p) => p.id === packageId) || SERVICE_PACKAGES[0];

  // Quick dates
  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-[#0e111a] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
      {/* Step Indicator Header */}
      <div className="border-b border-white/10 bg-[#121622] px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 font-bold text-xs">
              {step < 6 ? `${step}/5` : '✓'}
            </span>
            <span className="text-sm font-bold text-white">
              {step === 1 && 'Шаг 1: Выбор типа мойки (Робот / Ручная)'}
              {step === 2 && 'Шаг 2: Выбор программы и доп. услуг'}
              {step === 3 && 'Шаг 3: Класс и марка автомобиля'}
              {step === 4 && 'Шаг 4: Выбор даты и свободного времени'}
              {step === 5 && 'Шаг 5: Контактные данные и госномер'}
              {step === 6 && 'Запись успешно оформлена!'}
            </span>
          </div>

          {step < 6 && (
            <div className="text-xs text-zinc-400 font-medium">
              Итого: <strong className="text-cyan-400">{formatPrice(metrics.totalPrice)}</strong> (~
              {formatDuration(metrics.serviceDuration)})
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= s ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Step Content */}
      <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-h-[70vh]">
        {/* STEP 1: WASH TYPE */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h3 className="text-2xl font-black text-white">Выберите зону обслуживания</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Робот обеспечивает рекордную скорость от 10 мин, ручные боксы — тщательную 3-фазную мойку и детейлинг.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manual Wash Card */}
              <button
                type="button"
                onClick={() => handleWashTypeSelect('manual')}
                className={`relative flex flex-col p-6 rounded-2xl border text-left transition-all ${
                  washType === 'manual'
                    ? 'bg-blue-950/30 border-blue-500 text-white shadow-xl shadow-blue-950/40 ring-1 ring-blue-500/50'
                    : 'bg-black/30 border-white/10 text-zinc-300 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                    <Layers className="size-6" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                    Боксы №2 и №3
                  </Badge>
                </div>

                <h4 className="text-xl font-bold text-white mb-2">
                  Ручная мойка & Детейлинг
                </h4>
                <p className="text-xs text-zinc-400 mb-6 flex-1">
                  Бережная ручная мойка Koch Chemie, пористые губки, консервация блеска воском, комплексная уборка салона, химчистка и полировка.
                </p>

                <div className="space-y-2 border-t border-white/5 pt-4 text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Одновременная вместимость:</span>
                    <strong className="text-white">2 авто (синхронно)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Время цикла:</span>
                    <strong className="text-white">30 – 120 мин</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Стоимость:</span>
                    <strong className="text-cyan-400">от 900 ₽</strong>
                  </div>
                </div>
              </button>

              {/* Robot Wash Card */}
              <button
                type="button"
                onClick={() => handleWashTypeSelect('robot')}
                className={`relative flex flex-col p-6 rounded-2xl border text-left transition-all ${
                  washType === 'robot'
                    ? 'bg-cyan-950/30 border-cyan-500 text-white shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                    : 'bg-black/30 border-white/10 text-zinc-300 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Bot className="size-6" />
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                    Бокс №1 (Автомат)
                  </Badge>
                </div>

                <h4 className="text-xl font-bold text-white mb-2">
                  Роботизированная мойка LeisuWash
                </h4>
                <p className="text-xs text-zinc-400 mb-6 flex-1">
                  100% бесконтактная мойка контурным манипулятором 140 бар, мойка днища, активная пена, горячий полимерный воск и мощная турбосушка 45 кВт.
                </p>

                <div className="space-y-2 border-t border-white/5 pt-4 text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Одновременная вместимость:</span>
                    <strong className="text-white">1 авто (экспресс)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Время цикла:</span>
                    <strong className="text-white">10 – 20 мин</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Стоимость:</span>
                    <strong className="text-cyan-400">от 600 ₽</strong>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PACKAGE & ADD-ONS */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Выберите программу {washType === 'robot' ? 'робота' : 'ручной мойки'}
              </h3>
              <p className="text-xs text-zinc-400">
                Базовая стоимость указана для 1 класса; итоговая цена будет пересчитана на следующем шаге.
              </p>
            </div>

            {/* Packages list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SERVICE_PACKAGES.filter((p) => p.washType === washType).map((pkg) => {
                const isSelected = packageId === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setPackageId(pkg.id)}
                    className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500 text-white shadow-md ring-1 ring-cyan-500/50'
                        : 'bg-black/30 border-white/10 text-zinc-300 hover:border-white/30'
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
                      <span className="text-sm font-extrabold text-white">
                        {formatPrice(pkg.basePrice)}
                      </span>
                      <span className="text-xs text-cyan-400 font-medium">
                        {pkg.baseDurationMinutes} мин
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Add-on services */}
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="size-4 text-cyan-400" />
                Дополнительные опции
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ADD_ON_SERVICES.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-cyan-950/25 border-cyan-500/60 text-white'
                          : 'bg-black/30 border-white/10 text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex size-4 items-center justify-center rounded border transition-colors ${
                            isChecked
                              ? 'bg-cyan-500 border-cyan-500 text-black'
                              : 'border-white/30 bg-black/40'
                          }`}
                        >
                          {isChecked && <Check className="size-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{addon.name}</p>
                          <p className="text-[10px] text-zinc-400">{addon.shortDesc}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
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
        )}

        {/* STEP 3: CAR CLASS & MODEL */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Выберите класс и укажите марку авто
              </h3>
              <p className="text-xs text-zinc-400">
                Габариты автомобиля влияют на расход автохимии и время сушки/чистки.
              </p>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VEHICLE_CLASSES.map((vc) => {
                const isSelected = vehicleClassId === vc.id;
                return (
                  <button
                    key={vc.id}
                    type="button"
                    onClick={() => setVehicleClassId(vc.id)}
                    className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500 text-white shadow-md ring-1 ring-cyan-500/50'
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

            {/* Car Make & Model Input */}
            <div className="border-t border-white/10 pt-4">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Марка и модель вашего автомобиля <span className="text-red-400">*</span>
              </label>
              <Input
                value={carModel}
                onChange={(e) => {
                  setCarModel(e.target.value);
                  if (validationErrors.carModel) {
                    setValidationErrors((prev) => ({ ...prev, carModel: '' }));
                  }
                }}
                placeholder="Например: BMW X5, Audi A6, Toyota RAV4, Geely Monjaro"
                className="bg-black/40 border-white/15 text-white placeholder:text-zinc-600 h-11"
              />
              {validationErrors.carModel && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {validationErrors.carModel}
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: DATE & AVAILABLE TIME SLOTS */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Выберите дату и время записи</h3>
              <p className="text-xs text-zinc-400">
                {washType === 'robot'
                  ? 'Автоматический Бокс №1. Время визита резервируется персонально под вас.'
                  : 'Синхронные Боксы №2 и №3. Система автоматически подбирает первый свободный ручной пост.'}
              </p>
            </div>

            {/* Quick Date Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  selectedDate === todayStr
                    ? 'bg-cyan-500 text-black shadow'
                    : 'bg-black/40 border border-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                Сегодня ({formatRuDate(todayStr)})
              </button>

              <button
                type="button"
                onClick={() => setSelectedDate(tomorrowStr)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  selectedDate === tomorrowStr
                    ? 'bg-cyan-500 text-black shadow'
                    : 'bg-black/40 border border-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                Завтра ({formatRuDate(tomorrowStr)})
              </button>

              <div className="flex items-center gap-1.5 ml-auto text-xs text-zinc-400">
                <Clock className="size-3.5 text-cyan-400" />
                <span>
                  Длительность услуги:{' '}
                  <strong className="text-white">
                    {formatDuration(metrics.serviceDuration)}
                  </strong>{' '}
                  (+10 мин тех. буфер)
                </span>
              </div>
            </div>

            {/* Time Slot Grid */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-zinc-300">
                  Доступные интервалы на {formatRuDate(selectedDate)}:
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <span className="size-2 rounded-full bg-emerald-500" /> Свободно
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <span className="size-2 rounded-full bg-zinc-700" /> Занято / Прошло
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlotTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => handleSelectSlot(slot)}
                      title={slot.reason || `Свободно, назначение: Бокс №${slot.assignedBayId}`}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-cyan-500 text-black font-black border-cyan-400 shadow-lg shadow-cyan-500/30'
                          : slot.available
                          ? 'bg-[#141a29] border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-950/30 font-bold'
                          : 'bg-black/20 border-white/5 text-zinc-600 cursor-not-allowed text-xs'
                      }`}
                    >
                      <span className="text-sm">{slot.time}</span>
                      {slot.available && !isSelected && (
                        <span className="text-[9px] text-zinc-400 font-normal">
                          Бокс №{slot.assignedBayId}
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[9px] text-black font-bold">
                          Бокс №{allocatedBayId}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {validationErrors.slot && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {validationErrors.slot}
                </p>
              )}

              {selectedSlotTime && (
                <div className="mt-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-cyan-400" />
                    <span>
                      Выбрано время: <strong className="text-white">{selectedSlotTime}</strong> (
                      {formatRuDate(selectedDate)})
                    </span>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    Назначен Бокс №{allocatedBayId}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: CLIENT CONTACTS & RUSSIAN PLATE */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Контакты и регистрационный номер
              </h3>
              <p className="text-xs text-zinc-400">
                На номер телефона придет подтверждение записи. Госномер необходим оператору для пропуска и идентификации автомобиля у въезда.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Ваше имя (ФИО) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-4 text-zinc-500" />
                  <Input
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      if (validationErrors.name) {
                        setValidationErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholder="Алексей"
                    className="bg-black/40 border-white/15 text-white pl-9 h-11"
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Client Phone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Номер телефона РФ <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 size-4 text-zinc-500" />
                  <Input
                    value={clientPhone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (999) 999-99-99"
                    maxLength={18}
                    className="bg-black/40 border-white/15 text-white pl-9 font-mono h-11"
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Car Plate */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Госномер авто (формат РФ) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 size-4 text-zinc-500" />
                  <Input
                    value={carPlate}
                    onChange={handlePlateChange}
                    placeholder="А 123 АА 777"
                    maxLength={12}
                    className="bg-black/40 border-white/15 text-white pl-9 font-mono uppercase h-11 tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Поддерживается быстрый ввод латиницей (автоматически конвертируется в кириллицу)
                </p>
                {validationErrors.plate && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {validationErrors.plate}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Комментарий или пожелания
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Например: ожидаю в лаундже, аккуратно с порогами"
                  className="bg-black/40 border-white/15 text-white h-11"
                />
              </div>
            </div>

            {/* Order Recap Summary */}
            <div className="rounded-xl bg-black/40 border border-white/10 p-4 space-y-2 text-xs">
              <span className="font-semibold text-zinc-300 block mb-1">Параметры вашей брони:</span>
              <div className="flex justify-between text-zinc-400">
                <span>Автомобиль:</span>
                <span className="text-white font-medium">{carModel || '—'}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Программа:</span>
                <span className="text-white font-medium">{currentPackage.name}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Время и дата:</span>
                <span className="text-cyan-400 font-bold">
                  {selectedSlotTime} ({formatRuDate(selectedDate)})
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Выделенный бокс:</span>
                <span className="text-white font-medium">Бокс №{allocatedBayId}</span>
              </div>
              <div className="flex justify-between text-zinc-400 border-t border-white/5 pt-2">
                <span>Итого к оплате:</span>
                <span className="text-lg font-black text-white">
                  {formatPrice(metrics.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: CONFIRMATION SCREEN */}
        {step === 6 && confirmedBooking && (
          <div className="text-center py-4 space-y-6">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xl shadow-emerald-950/40">
              <CheckCircle2 className="size-8" />
            </div>

            <div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs mb-2">
                Бронь успешно подтверждена
              </Badge>
              <h3 className="text-2xl font-black text-white">Ждем вас в комплексе AQUA PRO!</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Ваша запись внесена в электронный график комплекса. Пожалуйста, подъезжайте за 5 минут до назначенного времени.
              </p>
            </div>

            {/* Booking Code Card */}
            <div className="max-w-md mx-auto rounded-2xl bg-gradient-to-br from-[#121724] to-[#0b0e14] border border-cyan-500/40 p-6 shadow-xl text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                    Номер бронирования
                  </span>
                  <div className="text-2xl font-black text-cyan-400 tracking-wider">
                    {confirmedBooking.id}
                  </div>
                </div>

                <Button
                  onClick={copyBookingCode}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-xs gap-1"
                >
                  {copiedCode ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  {copiedCode ? 'Скопировано' : 'Копировать'}
                </Button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Автомобиль:</span>
                  <span className="font-semibold text-white">
                    {confirmedBooking.carModel} ({confirmedBooking.carPlate})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Рабочая зона:</span>
                  <span className="font-bold text-cyan-300">
                    Бокс №{confirmedBooking.bayId}{' '}
                    {confirmedBooking.bayId === 1 ? '(Робот)' : '(Ручной пост)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Дата и время:</span>
                  <span className="font-bold text-white">
                    {confirmedBooking.startTime} – {confirmedBooking.endTime} (
                    {formatRuDate(confirmedBooking.date)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Программа:</span>
                  <span className="text-zinc-200">{currentPackage.name}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                  <span className="text-zinc-300">Стоимость к оплате:</span>
                  <span className="text-emerald-400 text-sm">
                    {formatPrice(confirmedBooking.totalPrice)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                <span>Оплата производится на месте после проверки качества работы.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a href="/check-booking" className="inline-block">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Управление бронью
                </Button>
              </a>

              {onClose && (
                <Button
                  onClick={onClose}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6"
                >
                  Готово
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      {step < 6 && (
        <div className="border-t border-white/10 bg-[#121622] px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={handlePrevStep}
              className="border-white/15 text-zinc-300 hover:text-white hover:bg-white/5 gap-1.5 text-xs"
            >
              <ChevronLeft className="size-4" />
              Назад
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={handleNextStep}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 gap-2 text-xs shadow-lg shadow-cyan-500/20"
          >
            <span>{step === 5 ? 'Подтвердить бронирование' : 'Продолжить'}</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
