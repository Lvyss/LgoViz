'use client'

import { usePathname } from 'next/navigation'
import { Inter, JetBrains_Mono } from 'next/font/google'
import '@/app/globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

// Daftar halaman yang tidak perlu Navbar & Footer
const noLayoutPaths = ['/auth/login', '/auth/register']

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Cek apakah halaman saat ini butuh layout khusus
  const isNoLayout = noLayoutPaths.includes(pathname || '')

  if (isNoLayout) {
    // Halaman auth: tanpa Navbar & Footer
    return (
      <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="min-h-screen">
          {children}
        </body>
      </html>
    )
  }

  // Halaman lain: dengan Navbar & Footer
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex flex-col min-h-screen">
        <div className="bg-glow-orb" />
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <div id="about">
          <Footer />
        </div>
      </body>
    </html>
  )
}