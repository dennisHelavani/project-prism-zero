import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Vortex } from '@/components/ui/vortex';

export const metadata: Metadata = {
  title: 'Hard Hat AI',
  description: 'AI-powered HSE & CDM documents delivered in minutes — editable, compliant, ready to send.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Vortex
          backgroundColor="transparent"
          particleCount={200}
          baseHue={240}
          rangeY={200}
          baseSpeed={0.05}
          rangeSpeed={0.5}
          baseRadius={0.5}
          rangeRadius={1.5}
          className="fixed inset-0 -z-10"
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
