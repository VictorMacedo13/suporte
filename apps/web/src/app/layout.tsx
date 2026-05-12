import type { Metadata } from 'next';
import { Geist, Geist_Mono, DM_Serif_Display } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Suporte DGcom',
  description: 'Central de atendimento DGcom',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geist.variable} ${geistMono.variable} ${dmSerifDisplay.variable}`}
    >
      <body className="font-sans">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
