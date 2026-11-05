'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  Coffee,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCarWash } from '@/context/CarWashContext';

interface HeroSectionProps {
  onOpenBooking: () => void;
}

export function HeroSection({ onOpenBooking }: HeroSectionProps) {
  const { getBayLiveStatus } = useCarWash();

  const bay1Status = getBayLiveStatus(1);
  const bay2Status = getBayLiveStatus(2);
  const bay3Status = getBayLiveStatus(3);

  const getStatusText = (status: 'idle' | 'washing' | 'maintenance') => {
    switch (status) {
      case 'idle':
        return { text: 'Свободен', color: 'text-emerald-400', dot: 'bg-emerald-500' };
      case 'washing':
        return { text: 'Идет мойка', color: 'text-amber-400', dot: 'bg-amber-500' };
      case 'maintenance':
        return { text: 'Тех. перерыв', color: 'text-zinc-400', dot: 'bg-zinc-500' };
    }
  };

  const s1 = getStatusText(bay1Status.status);
  const s2 = getStatusText(bay2Status.status);
  const s3 = getStatusText(bay3Status.status);

  // Count available bays
  const freeBaysCount = [bay1Status, bay2Status, bay3Status].filter(
    (b) => b.status === 'idle'
  ).length;

  return (
    <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28">
      {/* Background ambient lighting glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden opacity-30">
        <div className="absolute -top-32 left-1/4 size-[450px] rounded-full bg-cyan-600/30 blur-[130px]" />
        <div className="absolute top-10 right-1/4 size-[400px] rounded-full bg-blue-600/25 blur-[140px]" />
      </div>

      <div className="container relative mx-auto px-4">
        {/* Top Occupancy Pill Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs text-zinc-200 backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <span className="flex size-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-semibold text-cyan-300">Live-статус комплекса:</span>
            <span>
              {freeBaysCount > 0 ? (
                <>Свободно прямо сейчас: <strong className="text-white">{freeBaysCount} из 3 боксов</strong></>
              ) : (
                <strong className="text-amber-400">Все 3 бокса в работе (очередь 10 мин)</strong>
              )}
            </span>
          </div>

          {/* Individual mini bay pills */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300">
              <span className={`size-1.5 rounded-full ${s1.dot}`} />
              <span>Бокс 1 (Робот):</span>
              <span className={`font-semibold ${s1.color}`}>{s1.text}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300">
              <span className={`size-1.5 rounded-full ${s2.dot}`} />
              <span>Бокс 2 (Ручная):</span>
              <span className={`font-semibold ${s2.color}`}>{s2.text}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300">
              <span className={`size-1.5 rounded-full ${s3.dot}`} />
              <span>Бокс 3 (Ручная):</span>
              <span className={`font-semibold ${s3.color}`}>{s3.text}</span>
            </div>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-cyan-400">
            <Zap className="size-3.5 text-cyan-400" />
            Технологии LeisuWash 360 & Премиальная химия Koch Chemie
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl sm:leading-[1.15]">
            Современный автомоечный комплекс{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              в Москве 24/7
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-300 sm:text-lg">
            3 выделенных бокса: мгновенная роботизированная мойка от 10 минут и профессиональный 3-фазный европейский детейлинг без царапин. Умная запись ко времени без ожидания в очереди.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={onOpenBooking}
              size="lg"
              className="h-12 w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 text-base shadow-xl shadow-cyan-500/25 border-0 gap-2"
            >
              <Sparkles className="size-5" />
              Записаться онлайн на удобное время
            </Button>

            <Link href="#calculator" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 gap-2"
              >
                Рассчитать стоимость
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>

          {/* Benefits micro-bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 sm:grid-cols-4">
            <div className="flex flex-col items-center text-center p-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-2">
                <Zap className="size-5" />
              </div>
              <span className="text-sm font-semibold text-white">Робот от 10 минут</span>
              <span className="text-xs text-zinc-400">Скоростные циклы 140 бар</span>
            </div>

            <div className="flex flex-col items-center text-center p-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-2">
                <Layers className="size-5" />
              </div>
              <span className="text-sm font-semibold text-white">3-фазный детейлинг</span>
              <span className="text-xs text-zinc-400">2 ручных поста одновременно</span>
            </div>

            <div className="flex flex-col items-center text-center p-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-2">
                <Shield className="size-5" />
              </div>
              <span className="text-sm font-semibold text-white">Гарантия чистоты</span>
              <span className="text-xs text-zinc-400">Перемоем, если не понравится</span>
            </div>

            <div className="flex flex-col items-center text-center p-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-2">
                <Coffee className="size-5" />
              </div>
              <span className="text-sm font-semibold text-white">Комфорт-лаундж</span>
              <span className="text-xs text-zinc-400">Кофе Illy, Wi-Fi и PS5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
