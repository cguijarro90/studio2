import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Hotjar from '@/components/hotjar';

export const metadata: Metadata = {
  title: 'Biomass',
  description: 'Find biomass sources near you.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <Hotjar />
      </body>
    </html>
  );
}
