import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instagram',
  icons: {
    icon: '/insta.png',
  },
  description: 'Посмотрите фото и видео ваших друзей',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}