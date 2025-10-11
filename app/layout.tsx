import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Recortador SVG - Elimina espacio vacío automáticamente',
  description: 'Herramienta para recortar SVGs y eliminar espacio vacío usando getBBox()',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
}

export function generateViewport() {
  return {
    themeColor: [{ color: 'oklch(0.141 0.005 285.823)' }],
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Prevent theme flash on first load
            const theme =
            localStorage.getItem('theme') ||
            (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            document.documentElement.classList.add(theme);
            
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) {
              meta.content = theme === 'dark' ? 'oklch(0.141 0.005 285.823)' : 'oklch(1 0 0)';
              }
              `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableColorScheme
        >
          <NextTopLoader color="var(--ring)" height={2} easing="linear" showSpinner={false} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
