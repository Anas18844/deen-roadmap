import type { Metadata } from 'next';
import { Amiri, Noto_Naskh_Arabic } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import './styles/Navbar.css';
import './styles/Footer.css';
import './styles/PageHeader.css';
import './styles/SectionBlock.css';
import './styles/VoiceNote.css';
import './styles/TrackCards.css';
import './styles/Login.css';
import './styles/UserForm.css';
import './styles/app.css';

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
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
