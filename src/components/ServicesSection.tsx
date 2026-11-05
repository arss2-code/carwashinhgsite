'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Layers,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SERVICE_PACKAGES, ADD_ON_SERVICES } from '@/lib/data';
import { formatPrice } from '@/lib/formatters';
import { WashType } from '@/types';

interface ServicesSectionProps {
  onSelectPackageForBooking: (packageId: string) => void;
}

export function ServicesSection({ onSelectPackageForBooking }: ServicesSectionProps) {
  const [activeTab, setActiveTab] = useState<WashType>('manual');

  const robotPackages = SERVICE_PACKAGES.filter((p) => p.washType === 'robot');
  const manualPackages = SERVICE_PACKAGES.filter((p) => p.washType === 'manual');

  return (
    <section id="services" className="relative py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <Badge variant="outline" className="mb-3 border-cyan-500/40 text-cyan-400 bg-cyan-950/30 px-3 py-1">
            Прейскурант и программы обслуживания
          </Badge>
          <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
            Пакеты услуг премиального ухода за авто
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            Используем сертифицированную химию Koch Chemie (Германия) и безопасные технологии бесконтактной и ручной мойки для сохранения идеального состояния лакокрасочного покрытия.
          </p>

          {/* Wash Type Switcher */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-xl bg-[#12151f] p-1.5 border border-white/10 shadow-inner">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === 'manual'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="size-4" />
                Ручная мойка & Детейлинг (Боксы №2 и №3)
              </button>

              <button
                onClick={() => setActiveTab('robot')}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === 'robot'
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-900/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Bot className="size-4" />
                Роботизированная мойка (Бокс №1)
              </button>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'manual' ? manualPackages : robotPackages).map((pkg) => {
            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-2xl bg-[#11141e]/90 border transition-all duration-300 hover:translate-y-[-2px] ${
                  pkg.popular
                    ? 'border-cyan-500/60 shadow-xl shadow-cyan-950/20'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1 text-xs font-bold text-white shadow-md shadow-cyan-950/40">
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Top info */}
                  <div className="flex items-center justify-between gap-2 mb-2 pt-2">
                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-medium text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded-md border border-cyan-500/20">
                      <Clock className="size-3" />
                      {pkg.baseDurationMinutes} мин
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{pkg.shortDesc}</p>

                  {/* Price */}
                  <div className="mb-6 rounded-xl bg-black/40 border border-white/5 p-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-zinc-400">Стоимость от:</span>
                      <div className="text-2xl font-black text-white tracking-tight">
                        {formatPrice(pkg.basePrice)}
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-500">для 1-го класса авто</span>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Что входит в программу:
                    </span>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                          <CheckCircle2 className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-6 pt-0 border-t border-white/5 mt-4">
                  <Button
                    onClick={() => onSelectPackageForBooking(pkg.id)}
                    className="w-full bg-white/5 hover:bg-cyan-500 hover:text-white text-zinc-200 border border-white/10 hover:border-cyan-400 font-semibold gap-2 transition-all mt-4"
                  >
                    <span>Выбрать этот пакет</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add-ons showcase banner */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-blue-950/30 via-[#11141f] to-cyan-950/30 border border-white/10 p-6 lg:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-1">
                <Sparkles className="size-3.5" />
                Дополнительные опции детейлинга
              </div>
              <h3 className="text-xl font-bold text-white">
                Улучшите результат защитными и уходовыми процедурами
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Чернение резины кремнием, антидождь Aquapel, бережная глубокая очистка дисков и кондиционирование кожи. Выберите при записи или в калькуляторе.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              {ADD_ON_SERVICES.slice(0, 4).map((addon) => (
                <div
                  key={addon.id}
                  className="rounded-lg bg-black/40 border border-white/5 px-3 py-1.5 text-xs text-zinc-300 flex items-center gap-1.5"
                >
                  <span className="size-1.5 rounded-full bg-cyan-400" />
                  <span>{addon.name.split(' (')[0]}</span>
                  <span className="font-semibold text-white">+{formatPrice(addon.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
