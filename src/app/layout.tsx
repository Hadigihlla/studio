import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'HIRAFUS LEAGUE',
  description: 'Weekly Football Team Selections & Leaderboard',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
