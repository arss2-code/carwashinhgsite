'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, LayoutDashboard } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#07090d] text-zinc-400 text-xs">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <Sparkles className="size-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                AQUA<span className="text-cyan-400">PRO</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Премиальный круглосуточный автомоечный комплекс. 1 роботизированный бокс экспресс-мойки и 2 синхронных детейлинг-поста.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Работаем круглосуточно 24/7
            </div>
          </div>

          {/* Services nav */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Программы</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#services" className="hover:text-cyan-400 transition-colors">
                  Робот «Экспресс» (10 мин)
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-cyan-400 transition-colors">
                  Робот «Стандарт + Воск» (15 мин)
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-cyan-400 transition-colors">
                  Евромойка (3-фазная)
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-cyan-400 transition-colors">
                  Детейлинг-мойка кузова
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-cyan-400 transition-colors">
                  Химчистка и озонирование
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Клиентам</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#calculator" className="hover:text-cyan-400 transition-colors">
                  Калькулятор услуг
                </Link>
              </li>
              <li>
                <Link href="/check-booking" className="hover:text-cyan-400 transition-colors">
                  Проверить статус брони
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-cyan-400 transition-colors">
                  Оборудование и химия
                </Link>
              </li>
              <li>
                <Link href="/#contacts" className="hover:text-cyan-400 transition-colors">
                  Схема проезда
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  <LayoutDashboard className="size-3" />
                  Панель оператора (Шахматка)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Контакты</h4>
            <div className="space-y-2">
              <p className="text-zinc-300">
                г. Москва, Ленинградский пр-т, 39, стр. 14
              </p>
              <a
                href="tel:+74957902211"
                className="text-sm font-bold text-white hover:text-cyan-400 block transition-colors"
              >
                +7 (495) 790-22-11
              </a>
              <p className="text-[11px] text-zinc-500">
                Заезд круглосуточный, без предварительного пропуска
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} Автомоечный комплекс «AQUA PRO». Все права защищены.
          </div>
          <div className="flex items-center gap-4">
            <span>ООО «АКВАПРО ДЕТЕЙЛИНГ» ОГРН 1227700412890</span>
            <span>Политика конфиденциальности</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
