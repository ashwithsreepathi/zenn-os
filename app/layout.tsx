import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppStoreProvider } from '@/lib/store';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Zenn OS | Agency Operating System',
  description: 'The secure internal operating system for Zenn Studios — managing projects, finance, talent, and client relations.',
};

export const viewport: Viewport = {
  themeColor: '#b6332e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="antialiased bg-black text-[#eeeeee] min-h-screen">
        <AppStoreProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AppStoreProvider>
      </body>
    </html>
  );
}
