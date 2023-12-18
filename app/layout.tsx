import '@/styles/globals.css';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import clsx from 'clsx';
import Header from '@/components/common/Header';
import Nav from '@/components/common/Nav';
import { Suspense } from 'react';
import QueryProvider from './lib/query';
import { Providers } from './lib/providers';

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
      <body className={clsx('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'white' }}>
          <QueryProvider>
            <div className="relative flex flex-col h-screen">
              <main className="flex items-center justify-center w-full h-full">
                <section className="w-full h-full flex flex-col items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  sm:w-[430px] md:h-[788px]">
                  <Header />
                  <section className="w-full h-full overflow-scroll gap-2 py-[10px]">
                    <Suspense fallback={<div>로딩...</div>}>{children}</Suspense>
                  </section>
                  <Nav />
                </section>
              </main>
            </div>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
