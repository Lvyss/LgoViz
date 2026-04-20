'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/[0.03] pt-20 pb-10 font-poppins">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 mb-16 md:grid-cols-12">
          
          {/* Brand Section - Span 4 */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-20 h-20 ">
<img src="/images/logo.png" alt="" />
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              Platform visualisasi algoritma interaktif yang dirancang khusus untuk mempercepat pemahaman logika pemrograman bagi siswa RPL.
            </p>
          </div>

          {/* Navigation - Span 8 (Sub-grid for links) */}
          <div className="grid grid-cols-2 gap-8 md:col-span-8 md:grid-cols-3">
            {/* Quick Links */}
            <div>
              <h3 className="mb-6 text-xs font-bold tracking-[0.2em] text-white uppercase">Platform</h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link href="/" className="text-gray-500 transition-colors hover:text-orange-500">Beranda</Link>
                </li>
                <li>
                  <a href="#fitur" className="text-gray-500 transition-colors hover:text-orange-500">Fitur Utama</a>
                </li>
                <li>
                  <a href="#modul" className="text-gray-500 transition-colors hover:text-orange-500">Kurikulum</a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-6 text-xs font-bold tracking-[0.2em] text-white uppercase">Resources</h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href="#" className="text-gray-500 transition-colors hover:text-orange-500">Dokumentasi</a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 transition-colors hover:text-orange-500">API Reference</a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 transition-colors hover:text-orange-500">Community</a>
                </li>
              </ul>
            </div>

            {/* Support/Social */}
            <div>
              <h3 className="mb-6 text-xs font-bold tracking-[0.2em] text-white uppercase">Connect</h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href="mailto:support@lgoviz.com" className="text-gray-500 transition-colors hover:text-orange-500 underline-offset-4 hover:underline">
                    support@lgoviz.com
                  </a>
                </li>
                <li className="flex gap-5 pt-2">
                  <a href="#" className="text-gray-500 transition-all hover:text-orange-500 hover:scale-110">
                    <span className="sr-only">Twitter</span>
                    🐦
                  </a>
                  <a href="#" className="text-gray-500 transition-all hover:text-orange-500 hover:scale-110">
                    <span className="sr-only">GitHub</span>
                    📁
                  </a>
                  <a href="#" className="text-gray-500 transition-all hover:text-orange-500 hover:scale-110">
                    <span className="sr-only">Discord</span>
                    💬
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-6 pt-10 border-t border-white/5 md:flex-row">
          <p className="text-[10px] tracking-widest text-gray-600 uppercase">
            &copy; {new Date().getFullYear()} LgoViz — Visualizer for Excellence.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] tracking-widest text-gray-600 uppercase hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] tracking-widest text-gray-600 uppercase hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/10 to-transparent" />
    </footer>
  )
}