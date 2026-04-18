'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative flex items-center justify-center min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Background Bar Charts */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Left side bars - Algoritma */}
        <div className="absolute left-0 bottom-0 flex items-end gap-1 translate-y-8">
          <div className="w-6 h-24 bg-emerald-500/20 rounded-t-sm" />
          <div className="w-6 h-32 bg-emerald-500/25 rounded-t-sm" />
          <div className="w-6 h-20 bg-emerald-500/15 rounded-t-sm" />
          <div className="w-6 h-40 bg-emerald-500/30 rounded-t-sm" />
          <div className="w-6 h-28 bg-emerald-500/20 rounded-t-sm" />
          <div className="w-6 h-36 bg-emerald-500/35 rounded-t-sm" />
          <div className="w-6 h-44 bg-emerald-500/40 rounded-t-sm" />
          <div className="w-6 h-32 bg-emerald-500/25 rounded-t-sm" />
        </div>
        <div className="absolute left-4 bottom-2 text-[10px] font-mono text-emerald-500/60 tracking-widest">
          ALGORITMA
        </div>

        {/* Right side bars - Logika */}
        <div className="absolute right-0 bottom-0 flex items-end gap-1 translate-y-8">
          <div className="w-6 h-36 bg-blue-500/35 rounded-t-sm" />
          <div className="w-6 h-28 bg-blue-500/25 rounded-t-sm" />
          <div className="w-6 h-44 bg-blue-500/40 rounded-t-sm" />
          <div className="w-6 h-32 bg-blue-500/30 rounded-t-sm" />
          <div className="w-6 h-40 bg-blue-500/35 rounded-t-sm" />
          <div className="w-6 h-24 bg-blue-500/20 rounded-t-sm" />
          <div className="w-6 h-32 bg-blue-500/25 rounded-t-sm" />
          <div className="w-6 h-20 bg-blue-500/15 rounded-t-sm" />
        </div>
        <div className="absolute right-4 bottom-2 text-[10px] font-mono text-blue-500/60 tracking-widest">
          LOGIKA
        </div>

        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl mx-auto text-center"
        >
          {/* Logo Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 blur-xl opacity-30 rounded-full" />
              <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-white to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
                LGOVIZ
              </h1>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-300 tracking-wide"
          >
            Visualisasi Logika & Algoritma
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base text-gray-500 tracking-widest uppercase"
          >
            Jelajahi, Pahami, Kuasai
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
          >
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300"
            >
              Mulai Belajar Gratis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/modules"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/5 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 hover:scale-105 transition-all duration-300"
            >
              Lihat Modul
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}