import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <title>Gridiron Guru</title>
        <meta name="description" content="Weekly Football Team Selections & Leaderboard" />
      </head>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
