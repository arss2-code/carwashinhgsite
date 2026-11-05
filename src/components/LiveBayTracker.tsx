'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCarWash } from '@/context/CarWashContext';
import { BayId } from '@/types';
import { SERVICE_PACKAGES } from '@/lib/data';

interface LiveBayTrackerProps {
  onSelectBayForBooking?: (bayId: BayId) => void;
}

export function LiveBayTracker({ onSelectBayForBooking }: LiveBayTrackerProps) {
  const { bays, getBayLiveStatus } = useCarWash();
  const [lastRefreshed, setLastRefreshed] = useState<string>('сейчас');

  // Simulated live tick every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLastRefreshed(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="live-bays" className="relative py-12 bg-[#0b0e16] border-y border-white/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
              Телеметрия комплекса в реальном времени
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Интерактивный статус 3-х рабочих зон (боксов)
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              1 автоматический роботизированный бокс экспресс-мойки и 2 синхронных детейлинг-поста с одновременным обслуживанием до 2-х авто.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <RefreshCw className="size-3 text-cyan-400 animate-spin" />
              <span>Обновлено: {lastRefreshed}</span>
            </div>
          </div>
        </div>

        {/* 3 Bays Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bays.map((bay) => {
            const liveInfo = getBayLiveStatus(bay.id);
            const isRobot = bay.type === 'robot';

            // Find package details if active
            const currentPackage = liveInfo.activeBooking
              ? SERVICE_PACKAGES.find((p) => p.id === liveInfo.activeBooking?.packageId)
              : null;

            return (
              <div
                key={bay.id}
                className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden ${
                  liveInfo.status === 'idle'
                    ? 'bg-[#111622]/90 border-emerald-500/30 shadow-lg shadow-emerald-950/20 hover:border-emerald-500/60'
                    : liveInfo.status === 'washing'
                    ? 'bg-[#141520]/90 border-amber-500/30 shadow-lg shadow-amber-950/20 hover:border-amber-500/60'
                    : 'bg-[#12141a]/90 border-zinc-700/40 text-zinc-400'
                }`}
              >
                {/* Top LED Indicator Bar */}
                <div
                  className={`h-1.5 w-full ${
                    liveInfo.status === 'idle'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : liveInfo.status === 'washing'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-zinc-600'
                  }`}
                />

                <div className="p-6">
                  {/* Bay Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-black text-white tracking-wide">
                          {bay.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0.5 ${
                            isRobot
                              ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40'
                              : 'border-blue-500/40 text-blue-400 bg-blue-950/40'
                          }`}
                        >
                          {isRobot ? 'Робот LeisuWash' : 'Ручной пост'}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1">{bay.title}</p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {liveInfo.status === 'idle' && (
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400 shadow-sm shadow-emerald-500/10">
                          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                          Свободен
                        </div>
                      )}
                      {liveInfo.status === 'washing' && (
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-400 shadow-sm shadow-amber-500/10">
                          <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                          Идет мойка
                        </div>
                      )}
                      {liveInfo.status === 'maintenance' && (
                        <div className="flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs font-semibold text-zinc-400">
                          <Wrench className="size-3 text-zinc-400" />
                          Тех. перерыв
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="my-4 rounded-xl bg-black/40 border border-white/5 p-4 min-h-[120px] flex flex-col justify-center">
                    {liveInfo.status === 'idle' && (
                      <div className="text-center py-2">
                        <div className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                          <CheckCircle2 className="size-5" />
                        </div>
                        <p className="text-sm font-semibold text-white">Бокс готов к заезду</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {isRobot
                            ? 'Свободный въезд или запись ко времени (10–20 мин)'
                            : 'Свободный пост для ручного комплекса или детейлинга'}
                        </p>
                      </div>
                    )}

                    {liveInfo.status === 'washing' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">В обслуживании:</span>
                          <span className="font-semibold text-white">
                            {liveInfo.activeBooking?.carModel || 'Автомобиль'}
                          </span>
                        </div>

                        {/* Russian Plate simulation */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">Госномер:</span>
                          <span className="ru-license-plate text-xs">
                            {liveInfo.activeBooking?.carPlate}
                          </span>
                        </div>

                        {/* Service program */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Программа:</span>
                          <span className="text-amber-300 font-medium truncate max-w-[150px]">
                            {currentPackage?.name || 'Мойка комплекса'}
                          </span>
                        </div>

                        {/* Progress Bar & Remaining time */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 flex items-center gap-1">
                              <Clock className="size-3 text-amber-400" />
                              Осталось:
                            </span>
                            <span className="font-bold text-amber-400">
                              ~ {liveInfo.remainingMinutes} мин
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                              style={{ width: `${liveInfo.progressPercent || 50}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {liveInfo.status === 'maintenance' && (
                      <div className="text-center py-2">
                        <Wrench className="size-6 text-zinc-400 mx-auto mb-1.5" />
                        <p className="text-xs font-semibold text-zinc-300">
                          {bay.maintenanceReason || 'Техническое обслуживание'}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Регулярная замена фильтров и калибровка
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bay specs info */}
                  <div className="space-y-1.5 text-xs text-zinc-400 border-t border-white/5 pt-3">
                    <div className="flex items-center justify-between">
                      <span>Вместимость зоны:</span>
                      <span className="font-semibold text-zinc-300">1 автомобиль</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Среднее время цикла:</span>
                      <span className="font-semibold text-zinc-300">
                        {isRobot ? '10 – 20 мин' : '30 – 90+ мин'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer action button */}
                <div className="p-4 bg-black/20 border-t border-white/5">
                  <Button
                    onClick={() => onSelectBayForBooking && onSelectBayForBooking(bay.id)}
                    variant={liveInfo.status === 'idle' ? 'default' : 'outline'}
                    className={`w-full text-xs font-semibold gap-1.5 ${
                      liveInfo.status === 'idle'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/30'
                        : 'border-white/10 hover:bg-white/5 text-zinc-300'
                    }`}
                  >
                    <Clock className="size-3.5" />
                    {liveInfo.status === 'idle' ? 'Записаться в этот бокс' : 'Выбрать свободный слот'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note on capacity */}
        <div className="mt-6 flex flex-wrap items-center justify-between rounded-xl bg-white/5 border border-white/10 p-4 text-xs text-zinc-400 gap-3">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck className="size-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Архитектура комплекса:</strong> Общая одновременная пропускная способность ручных постов = <strong>2 автомобиля</strong> (Бокс №2 и Бокс №3). Робот (Бокс №1) работает независимо в непрерывном режиме.
            </span>
          </div>
          <span className="text-zinc-500">Система автоматически проверяет и бронирует свободный бокс без двойных записей</span>
        </div>
      </div>
    </section>
  );
}
