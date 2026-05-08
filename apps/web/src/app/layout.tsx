import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryClientProviderWrapper } from './providers';
import { ToastProvider } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dealfinder — AI-powered marketplace deal scanner',
  description: 'Find underpriced deals across Tweedehands, eBay, Vinted and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <QueryClientProviderWrapper>
            {children}
          </QueryClientProviderWrapper>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
