import '@/styles/globals.css';
import { Metadata } from 'next';
import { siteConfig } from '@/app/common/config/site';
import { fontSans } from '@/app/common/config/fonts';
import clsx from 'clsx';
import { Suspense } from 'react';
import { Loading } from '@/app/common/components';
import ClientOnlyWidgets from '@/app/common/components/ClientOnlyWidgets';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  icons: {
    icon: '/images/favicon.ico',
    shortcut: '/images/favicon-16x16.png',
    apple: '/images/apple-icon-180x180.png',
  },
  verification: {
    google: siteConfig.verification.google,
    other: {
      'naver-site-verification': siteConfig.verification.naver,
    },
  },
  openGraph: {
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
    type: siteConfig.type,
    locale: 'ko_KR',
    url: siteConfig.url,
    images: {
      url: siteConfig.ogImage,
      alt: `${siteConfig.title} 로고`,
      type: 'image/png',
      width: '1200',
      height: '630',
    },
  },
  twitter: {
    title: siteConfig.title,
    description: siteConfig.description,
    images: {
      url: siteConfig.ogImage,
      alt: `${siteConfig.title} 로고`,
      type: 'image/png',
      width: '1200',
      height: '630',
    },
  },
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={clsx('font-sans antialiased', fontSans.variable)}>
        <Providers>
          <div className="relative flex flex-col h-auto min-h-[100dvh] min-w-[360px]">
            <main className="flex justify-center items-center w-full h-full">
              <Suspense fallback={<Loading />}>{children}</Suspense>
              <ClientOnlyWidgets />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
