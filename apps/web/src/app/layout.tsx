import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'AlbumCheio',
  description: 'Sticker album management'
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
