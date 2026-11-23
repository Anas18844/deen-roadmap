import type { Metadata } from 'next';
import { Amiri, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';

const amiri = Amiri({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-amiri' });
const naskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-naskh',
});

export const metadata: Metadata = {
  title: 'خريطة الطريق',
  description: 'منصة تعليمية متدرجة لطلب العلم الشرعي وتزكية النفس',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${naskh.variable}`}>
      <body>{children}</body>
    </html>
  );
}
