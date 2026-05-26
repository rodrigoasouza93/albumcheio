import type { Metadata } from 'next';

import { SessionProvider } from '@web/features/auth/hooks/session-context';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  title: 'Álbum Cheio',
  description: 'Gestão de álbuns de figurinhas',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.png'
  },
  openGraph: {
    title: 'Álbum Cheio',
    description: 'Gestão de álbuns de figurinhas',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 1024,
        alt: 'Logo do Álbum Cheio'
      }
    ]
  }
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
