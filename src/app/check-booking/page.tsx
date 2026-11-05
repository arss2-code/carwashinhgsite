'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Calendar,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCarWash } from '@/context/CarWashContext';
import { formatPrice, formatRuDate, formatDuration } from '@/lib/formatters';
import { SERVICE_PACKAGES, ADD_ON_SERVICES, getTodayDateString, getTomorrowDateString } from '@/lib/data';
import { Booking, BookingStatus } from '@/types';
import { generateAvailableSlots } from '@/lib/bookingEngine';

export default function CheckBookingPage() {
  const { bookings, bays, findBookingsByPhoneOrPlate, cancelBooking, rescheduleBooking } = useCarWash();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Booking[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Reschedule state
  const [reschedulingBookingId, setReschedulingBookingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<string>(getTodayDateString());
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('');
  const [rescheduleMessage, setRescheduleMessage] = useState<string | null>(null);

  // Cancellation state
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const results = findBookingsByPhoneOrPlate(searchQuery);
    setSearchResults(results);
    setHasSearched(true);
    setReschedulingBookingId(null);
    setCancellingBookingId(null);
  };

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    setCancellingBookingId(null);
    // Refresh search results
    if (searchQuery) {
      setSearchResults(findBookingsByPhoneOrPlate(searchQuery));
    }
  };

  const handleStartReschedule = (booking: Booking) => {
    setReschedulingBookingId(booking.id);
    setNewDate(booking.date);
    setSelectedSlotTime('');
    setRescheduleMessage(null);
  };

  const handleConfirmReschedule = (booking: Booking) => {
    if (!selectedSlotTime) return;

    const ok = rescheduleBooking(booking.id, newDate, selectedSlotTime);
    if (ok) {
      setRescheduleMessage('Запись успешно перенесена!');
      setReschedulingBookingId(null);
      if (searchQuery) {
        setSearchResults(findBookingsByPhoneOrPlate(searchQuery));
      }
    } else {
      setRescheduleMessage('К сожалению, на это время бокс недоступен. Выберите другое время.');
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs">
            Подтверждена
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs animate-pulse">
            В работе (Идет мойка)
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
            Завершена
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
            Отменена
          </Badge>
        );
    }
  };

  // Compute available slots for rescheduling
  const activeRescheduleBooking = searchResults?.find((b) => b.id === reschedulingBookingId);
  const rescheduleSlots = activeRescheduleBooking
    ? generateAvailableSlots(
        newDate,
        activeRescheduleBooking.washType,
        activeRescheduleBooking.totalDurationMinutes + 10,
        bookings.filter((b) => b.id !== activeRescheduleBooking.id),
        bays
      )
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#090b10] text-[#f3f4f6]">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-2 border-cyan-500/40 text-cyan-400 bg-cyan-950/30 px-3 py-1">
              <CalendarCheck2 className="size-3.5 mr-1.5" />
              Личный кабинет бронирования
            </Badge>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Проверка и управление записью
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
              Введите номер телефона или 7-значный код бронирования (например, <strong className="text-cyan-400">AQ-10260</strong> или <strong className="text-white">+7 985 654-32-10</strong>)
            </p>
          </div>

          {/* Search Card */}
          <div className="rounded-2xl bg-[#11141e]/90 border border-white/10 p-6 mb-8 shadow-xl">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 size-4 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Номер телефона, госномер или код (AQ-...)"
                  className="bg-black/50 border-white/15 text-white pl-10 h-12 text-sm"
                />
              </div>

              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold h-12 px-6 shadow-lg shadow-cyan-500/20"
              >
                Найти бронь
              </Button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
              <span>Быстрый пример для проверки:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('AQ-10260');
                  setSearchResults(findBookingsByPhoneOrPlate('AQ-10260'));
                  setHasSearched(true);
                }}
                className="text-cyan-400 hover:underline font-mono"
              >
                AQ-10260
              </button>
              <span>или</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('+7 (985) 654-32-10');
                  setSearchResults(findBookingsByPhoneOrPlate('+7 (985) 654-32-10'));
                  setHasSearched(true);
                }}
                className="text-cyan-400 hover:underline font-mono"
              >
                +7 (985) 654-32-10
              </button>
            </div>
          </div>

          {rescheduleMessage && (
            <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{rescheduleMessage}</span>
            </div>
          )}

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-6">
              {searchResults && searchResults.length > 0 ? (
                searchResults.map((booking) => {
                  const pkg = SERVICE_PACKAGES.find((p) => p.id === booking.packageId);
                  const isRobot = booking.washType === 'robot';
                  const isRescheduling = reschedulingBookingId === booking.id;
                  const isCancelling = cancellingBookingId === booking.id;

                  return (
                    <div
                      key={booking.id}
                      className="rounded-2xl bg-[#11141e]/90 border border-white/10 p-6 shadow-xl space-y-6"
                    >
                      {/* Top status & ID */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-cyan-400 tracking-wider">
                            {booking.id}
                          </span>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="text-xs text-zinc-400">
                          Создано: {formatRuDate(booking.createdAt.slice(0, 10))}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                          <span className="text-zinc-500 block mb-1">Автомобиль и госномер:</span>
                          <span className="font-bold text-white block mb-1">
                            {booking.carModel}
                          </span>
                          <span className="ru-license-plate text-[10px]">{booking.carPlate}</span>
                        </div>

                        <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                          <span className="text-zinc-500 block mb-1">Рабочая зона:</span>
                          <span className="font-bold text-white block mb-1">
                            Бокс №{booking.bayId}
                          </span>
                          <span className="text-[11px] text-cyan-300">
                            {isRobot ? 'Роботизированная мойка' : 'Ручной пост детейлинга'}
                          </span>
                        </div>

                        <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                          <span className="text-zinc-500 block mb-1">Дата и время:</span>
                          <span className="font-bold text-white block mb-1">
                            {booking.startTime} – {booking.endTime}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {formatRuDate(booking.date)}
                          </span>
                        </div>

                        <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                          <span className="text-zinc-500 block mb-1">Итоговая стоимость:</span>
                          <span className="text-base font-black text-emerald-400 block mb-1">
                            {formatPrice(booking.totalPrice)}
                          </span>
                          <span className="text-[11px] text-zinc-500">Оплата на месте</span>
                        </div>
                      </div>

                      {/* Package and add-ons info */}
                      <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Программа обслуживания:</span>
                          <span className="font-semibold text-white">
                            {pkg?.name || 'Стандарт'} (~
                            {formatDuration(booking.totalDurationMinutes)})
                          </span>
                        </div>

                        {booking.addOnIds.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Доп. опции:</span>
                            <span className="text-cyan-300 font-medium">
                              {booking.addOnIds
                                .map((id) => ADD_ON_SERVICES.find((a) => a.id === id)?.name.split(' (')[0])
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-zinc-400">Клиент:</span>
                          <span className="text-zinc-300">
                            {booking.clientName} ({booking.clientPhone})
                          </span>
                        </div>

                        {booking.notes && (
                          <div className="flex justify-between border-t border-white/5 pt-1 text-zinc-400 italic">
                            <span>Пожелание:</span>
                            <span>{booking.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Reschedule View */}
                      {isRescheduling && (
                        <div className="rounded-xl bg-cyan-950/20 border border-cyan-500/40 p-4 space-y-4 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                              <Calendar className="size-4 text-cyan-400" />
                              Перенос записи на другое время
                            </h4>
                            <button
                              onClick={() => setReschedulingBookingId(null)}
                              className="text-xs text-zinc-400 hover:text-white"
                            >
                              Отмена
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setNewDate(getTodayDateString())}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                newDate === getTodayDateString()
                                  ? 'bg-cyan-500 text-black'
                                  : 'bg-black/40 text-zinc-400 border border-white/10'
                              }`}
                            >
                              Сегодня ({formatRuDate(getTodayDateString())})
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewDate(getTomorrowDateString())}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                newDate === getTomorrowDateString()
                                  ? 'bg-cyan-500 text-black'
                                  : 'bg-black/40 text-zinc-400 border border-white/10'
                              }`}
                            >
                              Завтра ({formatRuDate(getTomorrowDateString())})
                            </button>
                          </div>

                          <div>
                            <span className="text-xs text-zinc-400 block mb-2">
                              Свободные слоты на выбранную дату:
                            </span>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                              {rescheduleSlots.map((slot) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={!slot.available}
                                  onClick={() => setSelectedSlotTime(slot.time)}
                                  className={`p-2 rounded-lg text-xs text-center border font-semibold ${
                                    selectedSlotTime === slot.time
                                      ? 'bg-cyan-500 text-black border-cyan-400'
                                      : slot.available
                                      ? 'bg-black/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-400'
                                      : 'bg-black/20 text-zinc-600 border-white/5 cursor-not-allowed'
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReschedulingBookingId(null)}
                              className="border-white/10 text-xs text-zinc-300"
                            >
                              Назад
                            </Button>
                            <Button
                              size="sm"
                              disabled={!selectedSlotTime}
                              onClick={() => handleConfirmReschedule(booking)}
                              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
                            >
                              Подтвердить перенос на {selectedSlotTime}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Cancel confirmation view */}
                      {isCancelling && (
                        <div className="rounded-xl bg-red-950/20 border border-red-500/40 p-4 space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                            <AlertTriangle className="size-4" />
                            Вы действительно хотите отменить запись {booking.id}?
                          </div>
                          <p className="text-xs text-zinc-400">
                            Забронированный бокс и время будут освобождены для других клиентов.
                          </p>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCancellingBookingId(null)}
                              className="border-white/10 text-xs text-zinc-300"
                            >
                              Оставить запись
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancel(booking.id)}
                              className="text-xs font-bold"
                            >
                              Да, отменить запись
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Actions row */}
                      {booking.status === 'pending' && !isRescheduling && !isCancelling && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartReschedule(booking)}
                              className="border-white/15 text-xs text-zinc-300 hover:text-white gap-1.5"
                            >
                              <RotateCcw className="size-3.5 text-cyan-400" />
                              Перенести запись
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCancellingBookingId(booking.id)}
                              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
                            >
                              <XCircle className="size-3.5" />
                              Отменить
                            </Button>
                          </div>

                          <a
                            href="https://yandex.ru/maps"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-medium"
                          >
                            <MapPin className="size-3.5" />
                            Маршрут до комплекса
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10 p-8">
                  <XCircle className="size-10 text-zinc-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white">Записи не найдены</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    По запросу «{searchQuery}» активных бронирований не обнаружено. Проверьте правильность введенного номера телефона или кода брони.
                  </p>
                  <Link href="/#booking" className="inline-block mt-4">
                    <Button className="bg-cyan-500 text-black font-bold text-xs">
                      Оформить новую запись
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
