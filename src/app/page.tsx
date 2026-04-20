'use client'

import FeatureSection from '@/components/sections/FeatureSection'
import HeroSection from '@/components/sections/HeroSection'
import ModuleGrid from '@/components/sections/ModuleGrid'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="bg-black">
      <HeroSection />
      <FeatureSection />
      <ModuleGrid />
<section className="relative py-40 overflow-hidden bg-black font-poppins">
      
      {/* Konten Utama */}
      <div className="relative z-10 max-w-4xl px-6 mx-auto text-center">
        
        {/* Label Kecil */}
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[10px] tracking-[0.8em] uppercase text-orange-500 font-bold mb-10 block"
        >
          Get Started
        </motion.span>

        {/* Tipografi Tipis & Kuat */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-5xl font-light tracking-tighter text-white md:text-7xl"
        >
          Kuasai logika. <br />
          <span className="font-serif italic text-white/30">Wujudkan koding nyata.</span>
        </motion.h2>

        {/* Deskripsi Singkat */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-16 text-sm font-light leading-relaxed text-gray-500"
        >
          Visualisasi algoritma terbaik untuk siswa SMK RPL se-Indonesia. 
          Mulai perjalanan programming-mu sekarang secara gratis.
        </motion.p>

        {/* Tombol Aksi Minimalis */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-10 sm:flex-row"
        >
          <Link
            href="/auth/register"
            className="px-14 py-4 bg-white text-black text-[13px] font-bold rounded-full hover:bg-orange-500 hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.05)] active:scale-95"
          >
            Mulai Belajar Gratis
          </Link>
          
          <Link 
            href="/auth/login" 
            className="group text-[13px] font-medium text-white/40 hover:text-white transition-colors flex items-center gap-2"
          >
            Masuk ke Akun
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>

      {/* --- GARIS PEMBATAS MOLTEN (SIGNATURE) --- */}
      {/* Garis ini berfungsi sebagai pemisah antara Landing Page dan Footer eksternal kamu */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      
      {/* Ambient Glow Tipis agar garis tidak melayang sendirian */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-orange-600/5 blur-[100px] pointer-events-none" />
    </section>
    </main>
  )
}