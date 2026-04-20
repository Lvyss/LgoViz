'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0f] py-12">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500">
                <span className="text-sm font-bold text-white">L</span>
              </div>
              <span className="text-lg font-semibold">
                <span className="text-white">Lgo</span>
                <span className="text-emerald-400">Viz</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Visualisasi algoritma interaktif untuk siswa SMK RPL.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-medium text-white">Menu</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-400 transition-colors hover:text-emerald-400">
                  Beranda
                </a>
              </li>
              <li>
                <a href="/#fitur" className="text-gray-400 transition-colors hover:text-emerald-400">
                  Fitur
                </a>
              </li>
              <li>
                <a href="/#modul" className="text-gray-400 transition-colors hover:text-emerald-400">
                  Modul
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 transition-colors hover:text-emerald-400">
                  Learn
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-medium text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 transition-colors hover:text-emerald-400">
                  Dokumentasi
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 transition-colors hover:text-emerald-400">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-medium text-white">Contact</h3>
            <p className="text-sm text-gray-400">
              Email: support@lgoviz.com
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 transition-colors hover:text-emerald-400">
                📘
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-emerald-400">
                🐦
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-emerald-400">
                💬
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 text-sm text-center text-gray-500 border-t border-white/10">
          &copy; {new Date().getFullYear()} LgoViz. All rights reserved.
        </div>
      </div>
    </footer>
  )
}