import type { Metadata } from 'next'
import { Cormorant_Garamond, EB_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cormorantGaramond = Cormorant_Garamond({ 
  subsets: ["latin"],
  variable: '--font-serif',
  weight: ['300', '400', '500', '600', '700']
});
const ebGaramond = EB_Garamond({ 
  subsets: ["latin"],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'noir',
  description: 'minimal study timer and archive',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${cormorantGaramond.variable} ${ebGaramond.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
