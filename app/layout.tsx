import '@/styles/globals.css';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import clsx from 'clsx';
import { Suspense } from 'react';
import { QueryClientProvider, NextUIProvider, NextThemesProvider } from '@/lib/provider';
import { Loading } from '@/components';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head />
      <body className={clsx('min-h-screen bg-white text-black font-sans antialiased', fontSans.variable)}>
        <QueryClientProvider>
          <NextThemesProvider>
            <NextUIProvider>
              <div className="relative flex flex-col h-screen">
                <main className="flex items-center justify-center w-full h-full bg-white dark:bg-dark-b dark:lg:bg-dark-pb dark:text-white">
                  <Suspense fallback={<Loading />}>{children}</Suspense>
                </main>
              </div>
            </NextUIProvider>
          </NextThemesProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;
