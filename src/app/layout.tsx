import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

// The following import is required even if you don't use it directly in this file.
// It ensures that the internationalization provider is initialized.
import {NextIntlClientProvider} from 'next-intl';


export const metadata: Metadata = {
  title: 'ParkPay Kiosk',
  description: 'Cashier Parking System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The lang and dir attributes are handled by the `[locale]/layout.tsx` file.
    // However, some linting tools might complain about their absence here.
    // We can suppress this warning since the final rendered HTML will have them.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* The following font is good for Arabic text */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased', 'min-h-screen bg-background')}>
          {children}
          <Toaster />
      </body>
    </html>
  );
}
