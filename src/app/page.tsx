'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import FeatureSection from '@/components/sections/FeatureSection'
import HeroSection from '@/components/sections/HeroSection'
import ModuleGrid from '@/components/sections/ModuleGrid'
import Footer from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LandingPage() {
  const pathname = usePathname()

  // Handle hash dari URL untuk mobile
  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const sectionId = window.location.hash.slice(1)
      const tryScroll = () => {
        const section = document.getElementById(sectionId)
        if (section) {
          const navbarHeight = 56
          const elementPosition = section.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - navbarHeight
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
          return true
        }
        return false
      }

      if (!tryScroll()) {
        let attempts = 0
        const interval = setInterval(() => {
          attempts++
          if (tryScroll() || attempts > 20) {
            clearInterval(interval)
          }
        }, 100)
      }
    }
  }, [pathname])

  return (
    <main className="bg-black">
      <HeroSection />
      <FeatureSection />
      <ModuleGrid />
      
      <section className="relative py-40 overflow-hidden bg-black font-poppins">
        
        <div className="relative z-10 max-w-4xl px-6 mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.8em] uppercase text-orange-500 font-bold mb-10 block"
          >
            Siap Memulai?
          </motion.span>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-5xl font-light tracking-tighter text-white md:text-7xl"
          >
            Pahami algoritma, <br />
            <span className="font-serif italic text-white/30">bukan sekadar menghafal kode.</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto mb-16 text-sm font-light leading-relaxed text-gray-500"
          >
            Visualisasi interaktif, quiz untuk menguji pemahaman, 
            dan sistem unlock topik yang membuatmu belajar secara bertahap. 
            Semua gratis untuk siswa SMK RPL.
          </motion.p>

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
              Sudah punya akun?
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-orange-600/5 blur-[100px] pointer-events-none" />
      </section>
      <Footer />
    </main>
  )
}