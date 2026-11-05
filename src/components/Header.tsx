'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  PhoneCall,
  Clock,
  Menu,
  X,
  CalendarCheck2,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onOpenBooking?: () => void;
}

export function Header({ onOpenBooking }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/#live-bays', label: 'Статус боксов' },
    { href: '/#services', label: 'Услуги и цены' },
    { href: '/#calculator', label: 'Калькулятор' },
    { href: '/#about', label: 'О комплексе' },
    { href: '/check-booking', label: 'Моя бронь', badge: 'Поиск' },
    { href: '/admin', label: 'Оператор', isOperator: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#090b10]/90 backdrop-blur-md transition-all">
      {/* Top micro status bar */}
      <div className="hidden border-b border-white/5 bg-[#0e111a] py-1.5 text-xs text-muted-foreground md:block">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Комплекс работает 24/7 (3 выделенных бокса)
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-cyan-400" />
              Москва, Ленинградский пр-т, 39, стр. 14 (заезд с ТТК)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-zinc-300">
              <ShieldCheck className="size-3.5 text-sky-400" />
              Koch Chemie & LeisuWash
            </span>
            <a
              href="tel:+74957902211"
              className="flex items-center gap-1 font-semibold text-white hover:text-cyan-400 transition-colors"
            >
              <PhoneCall className="size-3.5 text-cyan-400" />
              +7 (495) 790-22-11
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
            <div className="flex size-full items-center justify-center rounded-[10px] bg-[#090b10]">
              <Sparkles className="size-5 text-cyan-400 transition-transform group-hover:scale-110" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                AQUA<span className="text-cyan-400">PRO</span>
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-cyan-500/40 text-cyan-400 bg-cyan-950/40">
                3 БОКСА
              </Badge>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Робот-мойка & Детейлинг 24/7
            </span>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            if (link.isOperator) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                >
                  <LayoutDashboard className="size-3.5" />
                  {link.label}
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors hover:text-white ${
                  isActive ? 'text-cyan-400' : 'text-zinc-400'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="ml-1.5 rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[10px] text-cyan-300 border border-cyan-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/check-booking">
            <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white hover:bg-white/5 gap-1.5">
              <CalendarCheck2 className="size-4 text-cyan-400" />
              Проверить запись
            </Button>
          </Link>

          {onOpenBooking ? (
            <Button
              onClick={onOpenBooking}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 border-0 gap-1.5 transition-all"
            >
              <Sparkles className="size-4" />
              Записаться онлайн
            </Button>
          ) : (
            <Link href="/#booking">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 border-0 gap-1.5 transition-all">
                <Sparkles className="size-4" />
                Записаться онлайн
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex size-10 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/5 lg:hidden"
          aria-label="Меню"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#0d1017] px-4 py-6 lg:hidden animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  {link.isOperator && <LayoutDashboard className="size-4 text-amber-400" />}
                  {link.label}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}

            <div className="my-2 border-t border-white/10 pt-3 flex flex-col gap-2.5">
              <a
                href="tel:+74957902211"
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white"
              >
                <PhoneCall className="size-4 text-cyan-400" />
                +7 (495) 790-22-11
              </a>

              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenBooking) onOpenBooking();
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5"
              >
                <Sparkles className="size-4 mr-1.5" />
                Записаться онлайн
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
