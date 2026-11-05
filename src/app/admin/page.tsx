'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  X,
  Plus,
  RefreshCw,
  Wrench,
  Filter,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCarWash } from '@/context/CarWashContext';
import {
  formatPrice,
  formatRuDate,
  timeToMinutes,
  formatCarPlate,
  formatPhone,
} from '@/lib/formatters';
import {
  SERVICE_PACKAGES,
  VEHICLE_CLASSES,
  getTodayDateString,
  getTomorrowDateString,
} from '@/lib/data';
import { BayId, Booking, BookingStatus, VehicleClassId } from '@/types';

export default function AdminDashboardPage() {
  const {
    bookings,
    bays,
    updateBookingStatus,
    toggleBayMaintenance,
    createWalkInBooking,
    resetToInitialData,
  } = useCarWash();

  // Date filter for the timeline
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected booking modal state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Walk-in modal state
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInBayId, setWalkInBayId] = useState<BayId>(1);
  const [walkInPlate, setWalkInPlate] = useState('');
  const [walkInModel, setWalkInModel] = useState('');
  const [walkInClassId, setWalkInClassId] = useState<VehicleClassId>(1);
  const [walkInPackageId, setWalkInPackageId] = useState('robot_standard');
  const [walkInPhone, setWalkInPhone] = useState('+7 ');
  const [walkInClientName, setWalkInClientName] = useState('');

  // Timeline configuration: 08:00 to 22:00 in 30-minute intervals
  const timelineStartHour = 8;
  const timelineEndHour = 22;
  const timelineTotalMinutes = (timelineEndHour - timelineStartHour) * 60; // 840 mins

  // Time ticks array: [08:00, 08:30, 09:00, ...]
  const timeTicks = useMemo(() => {
    const ticks: string[] = [];
    for (let h = timelineStartHour; h <= timelineEndHour; h++) {
      ticks.push(`${String(h).padStart(2, '0')}:00`);
      if (h < timelineEndHour) {
        ticks.push(`${String(h).padStart(2, '0')}:30`);
      }
    }
    return ticks;
  }, []);

  // Filter bookings for the selected date
  const dayBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.date !== selectedDate) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      return true;
    });
  }, [bookings, selectedDate, statusFilter]);

  // Analytics Metrics
  const analytics = useMemo(() => {
    const totalDayBookings = bookings.filter((b) => b.date === selectedDate);
    const activeOrDone = totalDayBookings.filter((b) => b.status !== 'cancelled');

    const totalRevenue = activeOrDone.reduce((sum, b) => sum + b.totalPrice, 0);
    const avgTicket = activeOrDone.length > 0 ? Math.round(totalRevenue / activeOrDone.length) : 0;

    // Bay utilization %: total duration in minutes / available operational minutes (840 mins per day)
    const bay1Mins = activeOrDone
      .filter((b) => b.bayId === 1)
      .reduce((sum, b) => sum + b.totalDurationMinutes, 0);
    const bay2Mins = activeOrDone
      .filter((b) => b.bayId === 2)
      .reduce((sum, b) => sum + b.totalDurationMinutes, 0);
    const bay3Mins = activeOrDone
      .filter((b) => b.bayId === 3)
      .reduce((sum, b) => sum + b.totalDurationMinutes, 0);

    const bay1Util = Math.min(100, Math.round((bay1Mins / timelineTotalMinutes) * 100));
    const bay2Util = Math.min(100, Math.round((bay2Mins / timelineTotalMinutes) * 100));
    const bay3Util = Math.min(100, Math.round((bay3Mins / timelineTotalMinutes) * 100));

    // Robot vs Manual count
    const robotCount = activeOrDone.filter((b) => b.washType === 'robot').length;
    const manualCount = activeOrDone.filter((b) => b.washType === 'manual').length;

    return {
      totalBookings: activeOrDone.length,
      totalRevenue,
      avgTicket,
      bay1Util,
      bay2Util,
      bay3Util,
      robotCount,
      manualCount,
    };
  }, [bookings, selectedDate, timelineTotalMinutes]);

  // Handle Walk-In submit
  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInPlate || !walkInModel) return;

    const newBooking = createWalkInBooking({
      bayId: walkInBayId,
      carPlate: walkInPlate,
      carModel: walkInModel,
      vehicleClassId: walkInClassId,
      packageId: walkInPackageId,
      clientPhone: walkInPhone,
      clientName: walkInClientName,
    });

    setIsWalkInOpen(false);
    setWalkInPlate('');
    setWalkInModel('');
    setSelectedBooking(newBooking);
  };

  // Status badge styling helper
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-xs">
            Ожидает заезда
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs animate-pulse">
            В работе (Идет мойка)
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
            Завершено / Выдано
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">
            Отменено
          </Badge>
        );
    }
  };

  const getStatusBlockClass = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-sky-600/80 to-blue-600/80 border-sky-400/60 text-white hover:brightness-110';
      case 'in_progress':
        return 'bg-gradient-to-r from-amber-600/90 to-orange-600/90 border-amber-400 text-white animate-pulse shadow-lg shadow-amber-950/40 hover:brightness-110';
      case 'completed':
        return 'bg-gradient-to-r from-emerald-700/80 to-teal-700/80 border-emerald-400/60 text-white hover:brightness-110';
      case 'cancelled':
        return 'bg-zinc-800/80 border-zinc-600 text-zinc-400 hover:brightness-110';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#07090d] text-[#f3f4f6]">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Top Control Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-mono">
                  РЕЖИМ ОПЕРАТОРА
                </Badge>
                <span className="text-xs text-zinc-400 font-mono">Версия 2.4.0 Live</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Интерактивная шахматка загрузки боксов (Gantt)
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Quick Action Walk-in */}
              <Button
                onClick={() => {
                  setWalkInBayId(1);
                  setWalkInPackageId('robot_standard');
                  setIsWalkInOpen(true);
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs gap-1.5 shadow-lg shadow-emerald-950/40"
              >
                <Plus className="size-4" />
                + Принять авто (Живая очередь)
              </Button>

              {/* Reset to Seed Data for Demo */}
              <Button
                onClick={resetToInitialData}
                variant="outline"
                size="sm"
                className="border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-white/5 gap-1.5"
                title="Сбросить состояние к демонстрационному набору бронирований"
              >
                <RefreshCw className="size-3.5" />
                Сброс демо
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl bg-[#0f131d] border border-white/10 p-4">
              <span className="text-xs text-zinc-400">Выручка за {formatRuDate(selectedDate)}:</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {formatPrice(analytics.totalRevenue)}
              </div>
              <span className="text-[11px] text-zinc-500">
                Заказов: {analytics.totalBookings} (Робот: {analytics.robotCount}, Детейлинг: {analytics.manualCount})
              </span>
            </div>

            <div className="rounded-2xl bg-[#0f131d] border border-white/10 p-4">
              <span className="text-xs text-zinc-400">Средний чек:</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {formatPrice(analytics.avgTicket)}
              </div>
              <span className="text-[11px] text-zinc-500">По всем 3 боксам</span>
            </div>

            <div className="rounded-2xl bg-[#0f131d] border border-white/10 p-4">
              <span className="text-xs text-zinc-400">Загрузка Бокса 1 (Робот):</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {analytics.bay1Util}%
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${analytics.bay1Util}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-[#0f131d] border border-white/10 p-4">
              <span className="text-xs text-zinc-400">Загрузка Боксов 2 & 3 (Ручные):</span>
              <div className="text-2xl font-black text-sky-400 mt-1">
                {Math.round((analytics.bay2Util + analytics.bay3Util) / 2)}%
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${Math.round((analytics.bay2Util + analytics.bay3Util) / 2)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Date & Filter Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#0e121b] border border-white/10 p-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Дата графика:</span>

              <button
                type="button"
                onClick={() => setSelectedDate(getTodayDateString())}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDate === getTodayDateString()
                    ? 'bg-cyan-500 text-black'
                    : 'bg-black/40 text-zinc-400 border border-white/10 hover:text-white'
                }`}
              >
                Сегодня ({formatRuDate(getTodayDateString())})
              </button>

              <button
                type="button"
                onClick={() => setSelectedDate(getTomorrowDateString())}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDate === getTomorrowDateString()
                    ? 'bg-cyan-500 text-black'
                    : 'bg-black/40 text-zinc-400 border border-white/10 hover:text-white'
                }`}
              >
                Завтра ({formatRuDate(getTomorrowDateString())})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="size-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-400">Статус:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/60 border border-white/15 text-xs text-white rounded-lg px-2.5 py-1"
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидает</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
          </div>

          {/* GANTT TIMELINE CONTAINER */}
          <div className="rounded-3xl bg-[#0e111a] border border-white/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Дорожки боксов (Шкала времени: 08:00 – 22:00)
                </span>
                <span className="text-xs text-zinc-400">
                  Кликните на блок машины для смены статуса
                </span>
              </div>

              {/* Status legend */}
              <div className="hidden sm:flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="size-2 rounded-full bg-sky-500" /> Ожидает
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" /> В работе
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-500" /> Завершено
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="size-2 rounded-full bg-zinc-600" /> Отменено
                </span>
              </div>
            </div>

            {/* Scrollable Gantt Canvas */}
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[960px] relative">
                {/* Time Axis Header */}
                <div className="flex pl-44 border-b border-white/10 pb-2 text-[11px] font-mono text-zinc-400 select-none">
                  {timeTicks.map((tick, idx) => (
                    <div key={idx} className="flex-1 text-center border-l border-white/5 first:border-l-0">
                      {tick}
                    </div>
                  ))}
                </div>

                {/* 3 Bay Swimlanes */}
                <div className="space-y-4 pt-4">
                  {bays.map((bay) => {
                    const bayBookings = dayBookings.filter((b) => b.bayId === bay.id);
                    const isRobot = bay.type === 'robot';

                    return (
                      <div
                        key={bay.id}
                        className="flex items-center rounded-2xl bg-[#121622]/80 border border-white/10 p-2 relative group hover:border-white/20 transition-all"
                      >
                        {/* Bay Title on Left Header (44 width = ~176px) */}
                        <div className="w-44 shrink-0 pr-3 border-r border-white/10">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-bold text-sm text-white">{bay.name}</span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 ${
                                isRobot
                                  ? 'border-cyan-500/40 text-cyan-400'
                                  : 'border-blue-500/40 text-blue-400'
                              }`}
                            >
                              {isRobot ? 'Робот' : 'Ручной'}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span>{bayBookings.length} авто</span>
                            <button
                              type="button"
                              onClick={() => toggleBayMaintenance(bay.id)}
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                bay.status === 'maintenance'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              {bay.status === 'maintenance' ? 'В ТО' : 'ТО'}
                            </button>
                          </div>
                        </div>

                        {/* Timeline Track Area */}
                        <div className="flex-1 h-14 relative ml-2">
                          {/* Vertical background grid guidelines */}
                          <div className="absolute inset-0 flex pointer-events-none">
                            {timeTicks.map((_, idx) => (
                              <div
                                key={idx}
                                className="flex-1 border-l border-white/5 first:border-l-0"
                              />
                            ))}
                          </div>

                          {/* Technical break banner if active */}
                          {bay.status === 'maintenance' ? (
                            <div className="absolute inset-0 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center gap-2 text-xs text-zinc-400 z-10">
                              <Wrench className="size-4 text-zinc-400" />
                              <span>Бокс на техническом обслуживании ({bay.maintenanceReason})</span>
                            </div>
                          ) : (
                            /* Booking Blocks */
                            bayBookings.map((b) => {
                              const bStart = timeToMinutes(b.startTime);
                              const bEnd = timeToMinutes(b.endTime);

                              // Relative to 08:00 (480 mins)
                              const timelineStartMins = timelineStartHour * 60;
                              const leftPercent = Math.max(
                                0,
                                ((bStart - timelineStartMins) / timelineTotalMinutes) * 100
                              );
                              const widthPercent = Math.max(
                                3,
                                ((bEnd - bStart) / timelineTotalMinutes) * 100
                              );

                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setSelectedBooking(b)}
                                  style={{
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                  }}
                                  className={`absolute top-1 bottom-1 rounded-xl border px-2 py-1 text-left flex flex-col justify-center cursor-pointer transition-all shadow-md z-10 overflow-hidden ${getStatusBlockClass(
                                    b.status
                                  )}`}
                                >
                                  <div className="flex items-center justify-between text-[10px] font-bold leading-tight truncate">
                                    <span className="truncate">{b.carModel}</span>
                                    <span className="ml-1 shrink-0 opacity-80">{b.startTime}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[9px] opacity-90 truncate mt-0.5 font-mono">
                                    <span>{b.carPlate}</span>
                                    <span className="ml-1">{formatPrice(b.totalPrice)}</span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Management List: Bookings for Selected Date */}
          <div className="mt-8 rounded-3xl bg-[#0e111a] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">
                Список всех автомобилей на {formatRuDate(selectedDate)} ({dayBookings.length})
              </h3>
              <span className="text-xs text-zinc-400">Быстрое переключение статусов</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Код</th>
                    <th className="py-3 px-3">Бокс</th>
                    <th className="py-3 px-3">Время</th>
                    <th className="py-3 px-3">Автомобиль / Номер</th>
                    <th className="py-3 px-3">Программа</th>
                    <th className="py-3 px-3">Клиент / Телефон</th>
                    <th className="py-3 px-3">Сумма</th>
                    <th className="py-3 px-3">Текущий статус</th>
                    <th className="py-3 px-3 text-right">Управление статусом</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dayBookings.map((b) => {
                    const pkg = SERVICE_PACKAGES.find((p) => p.id === b.packageId);

                    return (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-cyan-400">{b.id}</td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              b.bayId === 1
                                ? 'border-cyan-500/40 text-cyan-300'
                                : 'border-blue-500/40 text-blue-300'
                            }`}
                          >
                            Бокс №{b.bayId}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-white">
                          {b.startTime} – {b.endTime}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{b.carModel}</div>
                          <span className="ru-license-plate text-[10px] mt-0.5">{b.carPlate}</span>
                        </td>
                        <td className="py-3 px-3 text-zinc-300">{pkg?.name || 'Мойка'}</td>
                        <td className="py-3 px-3">
                          <div className="text-white font-medium">{b.clientName}</div>
                          <div className="text-zinc-500 text-[11px] font-mono">{b.clientPhone}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-400">
                          {formatPrice(b.totalPrice)}
                        </td>
                        <td className="py-3 px-3">{getStatusBadge(b.status)}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            {b.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(b.id, 'in_progress')}
                                className="h-7 text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                              >
                                Заехал (В работу)
                              </Button>
                            )}
                            {b.status === 'in_progress' && (
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(b.id, 'completed')}
                                className="h-7 text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                              >
                                Готово (Выдано)
                              </Button>
                            )}
                            {b.status === 'completed' && (
                              <span className="text-[11px] text-zinc-500">Завершено ✓</span>
                            )}
                            {b.status === 'cancelled' && (
                              <span className="text-[11px] text-zinc-600">Отменено ✕</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Selected Booking Modal Details */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="rounded-3xl bg-[#11141e] border border-white/20 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-black text-cyan-400">{selectedBooking.id}</span>
              {getStatusBadge(selectedBooking.status)}
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-black/40 border border-white/10 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Автомобиль:</span>
                  <span className="font-bold text-white">{selectedBooking.carModel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Госномер:</span>
                  <span className="ru-license-plate text-[11px]">{selectedBooking.carPlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Бокс:</span>
                  <span className="font-bold text-cyan-300">
                    Бокс №{selectedBooking.bayId}{' '}
                    {selectedBooking.bayId === 1 ? '(Робот)' : '(Ручная мойка)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Интервал:</span>
                  <span className="font-bold text-white">
                    {selectedBooking.startTime} – {selectedBooking.endTime} ({selectedBooking.totalDurationMinutes} мин)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Клиент:</span>
                  <span className="text-zinc-200">
                    {selectedBooking.clientName} ({selectedBooking.clientPhone})
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span className="text-zinc-300 font-bold">Сумма:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    {formatPrice(selectedBooking.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Status Change Buttons in 1-Click */}
              <div>
                <span className="text-xs font-semibold text-zinc-300 block mb-2">
                  Сменить статус автомобиля:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={selectedBooking.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'pending');
                      setSelectedBooking((prev) => (prev ? { ...prev, status: 'pending' } : null));
                    }}
                    className="text-xs border-white/10"
                  >
                    Ожидает
                  </Button>

                  <Button
                    size="sm"
                    variant={selectedBooking.status === 'in_progress' ? 'default' : 'outline'}
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'in_progress');
                      setSelectedBooking((prev) =>
                        prev ? { ...prev, status: 'in_progress' } : null
                      );
                    }}
                    className="text-xs border-white/10 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                  >
                    В работе (Мойка)
                  </Button>

                  <Button
                    size="sm"
                    variant={selectedBooking.status === 'completed' ? 'default' : 'outline'}
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'completed');
                      setSelectedBooking((prev) =>
                        prev ? { ...prev, status: 'completed' } : null
                      );
                    }}
                    className="text-xs border-white/10 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  >
                    Завершено
                  </Button>

                  <Button
                    size="sm"
                    variant={selectedBooking.status === 'cancelled' ? 'destructive' : 'outline'}
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'cancelled');
                      setSelectedBooking((prev) =>
                        prev ? { ...prev, status: 'cancelled' } : null
                      );
                    }}
                    className="text-xs border-white/10 text-red-400"
                  >
                    Отменить
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBooking(null)}
                className="border-white/10 text-xs"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Walk-In Modal (Живая очередь) */}
      {isWalkInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="rounded-3xl bg-[#11141e] border border-white/20 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsWalkInOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="mb-4">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs mb-1">
                Экспресс-заезд
              </Badge>
              <h3 className="text-xl font-bold text-white">Прием автомобиля по живой очереди</h3>
              <p className="text-xs text-zinc-400">
                Автомобиль сразу будет помечен как «В работе» в выбранном боксе.
              </p>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-4 text-xs">
              {/* Bay selector */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Рабочий бокс:</label>
                <div className="grid grid-cols-3 gap-2">
                  {bays.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setWalkInBayId(b.id);
                        if (b.id === 1) {
                          setWalkInPackageId('robot_standard');
                        } else {
                          setWalkInPackageId('manual_complex');
                        }
                      }}
                      className={`p-2 rounded-xl border text-center font-bold ${
                        walkInBayId === b.id
                          ? 'bg-cyan-500 text-black border-cyan-400'
                          : 'bg-black/30 border-white/10 text-zinc-300'
                      }`}
                    >
                      {b.name} ({b.type === 'robot' ? 'Робот' : 'Ручной'})
                    </button>
                  ))}
                </div>
              </div>

              {/* Plate and Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Госномер РФ *</label>
                  <Input
                    required
                    value={walkInPlate}
                    onChange={(e) => setWalkInPlate(formatCarPlate(e.target.value))}
                    placeholder="А 123 АА 777"
                    className="bg-black/40 border-white/15 text-white font-mono uppercase h-10 tracking-wider"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Марка и модель *</label>
                  <Input
                    required
                    value={walkInModel}
                    onChange={(e) => setWalkInModel(e.target.value)}
                    placeholder="Например: BMW X5"
                    className="bg-black/40 border-white/15 text-white h-10"
                  />
                </div>
              </div>

              {/* Class & Package */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Класс авто:</label>
                  <select
                    value={walkInClassId}
                    onChange={(e) => setWalkInClassId(Number(e.target.value) as VehicleClassId)}
                    className="w-full bg-black/60 border border-white/15 text-white rounded-lg p-2.5 h-10"
                  >
                    {VEHICLE_CLASSES.map((vc) => (
                      <option key={vc.id} value={vc.id}>
                        {vc.category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Программа:</label>
                  <select
                    value={walkInPackageId}
                    onChange={(e) => setWalkInPackageId(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 text-white rounded-lg p-2.5 h-10"
                  >
                    {SERVICE_PACKAGES.filter((p) =>
                      walkInBayId === 1 ? p.washType === 'robot' : p.washType === 'manual'
                    ).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client name and phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Телефон (опционально)</label>
                  <Input
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(formatPhone(e.target.value))}
                    placeholder="+7 (999) 999-99-99"
                    className="bg-black/40 border-white/15 text-white font-mono h-10"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Имя (опционально)</label>
                  <Input
                    value={walkInClientName}
                    onChange={(e) => setWalkInClientName(e.target.value)}
                    placeholder="Клиент"
                    className="bg-black/40 border-white/15 text-white h-10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWalkInOpen(false)}
                  className="border-white/10 text-xs"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                >
                  Запустить в работу
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
