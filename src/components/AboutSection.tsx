'use client';

import React from 'react';
import {
  ShieldCheck,
  Zap,
  Coffee,
  Sparkles,
  Droplets,
  Award,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AboutSection() {
  const highlights = [
    {
      icon: Zap,
      title: 'Робот LeisuWash 360 (Бокс №1)',
      desc: 'Инновационная бесконтактная система контурного сканирования кузова с давлением воды 140 бар. Никаких щеток и микроцарапин.',
      badge: 'Скорость от 10 мин',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Droplets,
      title: 'Автохимия Koch Chemie & Ma-Fra',
      desc: 'Оригинальные немецкие и итальянские pH-нейтральные шампуни и защитные нано-воски ProtectorWax. Безопасно для пленок и керамики.',
      badge: 'Оригинал 100%',
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      icon: ShieldCheck,
      title: 'Европейский 3-фазный регламент',
      desc: 'Бесконтактное первичное растворение грязи, ручная мойка пористой варежкой по методу двух ведер и консервация гидрофобным составом.',
      badge: 'Без голограмм',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: Coffee,
      title: 'Премиальный лаундж ожидания',
      desc: 'Уютная зона отдыха с панорамным остеклением на рабочие боксы. Зерновой кофе Illy, скоростной Wi-Fi 200 Мбит/с и игровая приставка PS5.',
      badge: 'Зона релакса',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <section id="about" className="relative py-16 lg:py-24 bg-[#090b10] border-t border-white/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="outline" className="mb-3 border-cyan-500/40 text-cyan-400 bg-cyan-950/30 px-3 py-1">
            Преимущества комплекса
          </Badge>
          <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
            Новый стандарт чистоты и заботы об автомобиле
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Мы объединили скорость роботизированных технологий и филигранное внимание к деталям опытных детейлеров на одной локации.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#11141e]/80 border border-white/10 p-6 flex flex-col justify-between hover:border-white/30 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl ${item.bgColor} ${item.color} group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="size-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-300">
                    {item.badge}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-zinc-500">
                <Sparkles className="size-3 text-cyan-400" />
                <span>Сертифицированный стандарт</span>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#11141e] to-teal-950/40 border border-emerald-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Award className="size-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">100% Гарантия качества обслуживания</h4>
              <p className="text-xs text-zinc-300 mt-0.5 max-w-xl">
                Если вы заметите невымытый участок или разводы — сообщите администратору перед выездом, и мы перемоем автомобиль бесплатно без споров.
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <div className="text-xs text-zinc-400">Наш стандарт</div>
            <div className="text-xl font-black text-emerald-400">0% компромиссов</div>
          </div>
        </div>
      </div>
    </section>
  );
}
