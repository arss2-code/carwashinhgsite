'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ReviewsSection() {
  const reviews = [
    {
      name: 'Константин Васильев',
      car: 'Porsche Cayenne Turbo GT',
      date: '2 дня назад',
      rating: 5,
      plate: 'О 999 ОО 777',
      text: 'Заезжал на Евромойку (3-фазная) в Бокс №2. Очень щепетильный подход! Машина в матовой защитной пленке, боялся царапин, но ребята работали новыми мягкими губками и бережно продули все стыки турбосушкой. Блеск великолепный!',
      service: 'Евромойка 3-фазная',
    },
    {
      name: 'Елена Стрельцова',
      car: 'BMW X3 xDrive30i',
      date: 'Вчера',
      rating: 5,
      plate: 'А 321 АА 199',
      text: 'Робот в Боксе №1 просто космос! Заехала перед работой в 8:15 утра, выбрала программу Стандарт + Воск. Ровно 15 минут, и машина идеально чистая, включая колесные арки и диски. Очень удобная онлайн-запись!',
      service: 'Робот «Стандарт + Воск»',
    },
    {
      name: 'Артур Мирзоян',
      car: 'Mercedes-Benz S 500 W223',
      date: '4 дня назад',
      rating: 5,
      plate: 'М 777 ММ 77',
      text: 'Постоянно заказываю Комплекс с кондиционированием кожи. Отдельное спасибо за лаундж-зону: пока ждал, успел провести зум-конференцию на скоростном Wi-Fi и выпил отличный кофе. Рекомендую комплекс без сомнений.',
      service: 'Комплекс + Кондиционер кожи',
    },
  ];

  return (
    <section className="relative py-16 bg-[#0b0e16] border-t border-white/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Badge variant="outline" className="mb-2 border-cyan-500/40 text-cyan-400 bg-cyan-950/30 px-3 py-1">
              Репутация и отзывы
            </Badge>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Что говорят наши клиенты
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Честные оценки автовладельцев из Москвы. Рейтинг подтвержден отзывами в Яндекс.Картах и 2GIS.
            </p>
          </div>

          {/* Rating Summary Box */}
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="text-center border-r border-white/10 pr-4">
              <div className="text-3xl font-black text-amber-400">4.9</div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Высший рейтинг в САО</div>
              <div className="text-[11px] text-zinc-400">Более 2 400 проверенных отзывов</div>
            </div>
          </div>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#11141e]/90 border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-500">{rev.date}</span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-6 italic">
                  «{rev.text}»
                </p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{rev.name}</span>
                  <span className="ru-license-plate text-[10px]">{rev.plate}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{rev.car}</span>
                  <span className="text-cyan-400 font-medium">{rev.service}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
