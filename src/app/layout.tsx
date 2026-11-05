import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CarWashProvider } from '@/context/CarWashContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AQUA PRO | Премиальный автомоечный комплекс и детейлинг в Москве 24/7',
  description:
    'Высокотехнологичный комплекс из 3-х боксов: быстрая бесконтактная робот-мойка от 10 минут и профессиональный 3-фазный детейлинг. Умная онлайн-запись без ожидания.',
  keywords: [
    'автомойка москва',
    'робот мойка',
    'роботизированная мойка',
    'детейлинг москва',
    '3 фазная мойка',
    'химчистка авто',
    'онлайн запись автомойка',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#090b10] text-[#f3f4f6] min-h-screen flex flex-col`}
      >
        <CarWashProvider>{children}</CarWashProvider>
      </body>
    </html>
  );
}
