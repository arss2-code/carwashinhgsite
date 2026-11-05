'use client';

import React from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Car,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ContactsSection() {
  return (
    <section id="contacts" className="relative py-16 bg-[#090b10] border-t border-white/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <Badge variant="outline" className="mb-2 border-cyan-500/40 text-cyan-400 bg-cyan-950/30 px-3 py-1">
            Локация и схема проезда
          </Badge>
          <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
            Как нас найти и добраться
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Удобный заезд с Ленинградского проспекта и Третьего транспортного кольца (ТТК) без пробок и шлагбаумов.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contacts Details (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#11141e]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Фактический адрес</h4>
                  <p className="text-xs text-zinc-300">
                    г. Москва, Ленинградский проспект, 39, строение 14
                  </p>
                  <span className="text-[11px] text-zinc-500 mt-0.5 block">
                    Ориентир: съезд перед ТЦ «Авиапарк» в сторону центра
                  </span>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Режим работы</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">Круглосуточно 24/7</span>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300">
                      Без выходных
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Технологический перерыв: ежедневно 05:00 – 05:30 (калибровка робота)
                  </p>
                </div>
              </div>

              {/* Phones */}
              <div className="flex items-start gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Телефоны связи</h4>
                  <a
                    href="tel:+74957902211"
                    className="text-base font-bold text-white hover:text-cyan-400 transition-colors block"
                  >
                    +7 (495) 790-22-11
                  </a>
                  <a
                    href="tel:+79998882211"
                    className="text-xs text-zinc-400 hover:text-white transition-colors block mt-0.5"
                  >
                    +7 (999) 888-22-11 (Прямой пост администратора)
                  </a>
                </div>
              </div>

              {/* Navigators buttons */}
              <div className="border-t border-white/10 pt-4">
                <span className="text-xs font-semibold text-zinc-300 block mb-2.5">
                  Построить маршрут в навигаторе:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://yandex.ru/maps"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 py-2.5 text-xs font-bold transition-all"
                  >
                    <Navigation className="size-3.5" />
                    Яндекс.Карты
                  </a>

                  <a
                    href="https://2gis.ru"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 py-2.5 text-xs font-bold transition-all"
                  >
                    <Navigation className="size-3.5" />
                    2GIS
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
              <span>Парковка для клиентов:</span>
              <strong className="text-white">Бесплатная (на 15 машиномест)</strong>
            </div>
          </div>

          {/* Interactive Visual Map & Driving Directions (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#11141e]/90 border border-white/10 p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative">
            {/* Visual Schematic Map Representation */}
            <div className="relative rounded-2xl bg-[#090b10] border border-white/10 p-6 overflow-hidden min-h-[300px] flex flex-col justify-between">
              {/* Grid backdrop */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Map header */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-3 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Схема заезда и парковки
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-300">
                  Широкий въезд 4.2 м
                </Badge>
              </div>

              {/* Central Map Illustration */}
              <div className="relative z-10 my-6 py-6 text-center space-y-4">
                <div className="inline-flex flex-col items-center justify-center p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/50 shadow-2xl shadow-cyan-950/50">
                  <div className="flex items-center gap-2 text-cyan-300 font-black text-sm mb-1">
                    <Car className="size-4 text-cyan-400" />
                    АВТОМОЕЧНЫЙ КОМПЛЕКС AQUA PRO
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      Бокс 1 (Робот)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                      Бокс 2 (Ручная)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                      Бокс 3 (Ручная)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    Зона ожидания & Лаундж
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-cyan-400" />
                    Выезд на Ленинградку
                  </span>
                </div>
              </div>

              {/* Map footer note */}
              <div className="relative z-10 rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-zinc-300 flex items-center justify-between">
                <span>Въезд через автоматический шлагбаум с распознаванием госномера</span>
                <span className="text-cyan-400 font-semibold">24 часа</span>
              </div>
            </div>

            {/* Driving tips */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400">
              <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                <strong className="text-white block mb-0.5">Со стороны центра:</strong>
                По Ленинградскому проспекту, правый съезд на дублер сразу за метро Динамо.
              </div>
              <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                <strong className="text-white block mb-0.5">С внешней стороны ТТК:</strong>
                Съезд на Ленинградский проспект в сторону области, разворот на эстакаде.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
