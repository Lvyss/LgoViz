'use client'

import Link from 'next/link'
import PixelButton from '../ui/PixelButton'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-green/5 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Pixel cursor decoration */}
          <div className="inline-block mb-4">
            <span className="font-mono text-neon-green text-sm animate-pixel-blink">
              █ LOGIN_SEQUENCE_INITIATED █
            </span>
          </div>

          <h1 className="font-pixel text-3xl md:text-5xl lg:text-6xl mb-6">
            <span className="text-neon-green glow-text">Lgo</span>
            <span className="text-neon-blue">Viz</span>
          </h1>
          
          <p className="font-mono text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-4">
            Visualisasi Algoritma C++ Langkah demi Langkah
          </p>
          
          <p className="font-mono text-text-muted text-sm mb-8">
            Bergaya Pixel Art untuk SMK RPL
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <PixelButton>
                ▶ START
              </PixelButton>
            </Link>
            <Link href="/auth/login">
              <PixelButton variant="secondary">
                ⚡ LOAD SAVE
              </PixelButton>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex gap-6 justify-center text-center">
            <div>
              <div className="font-pixel text-neon-green text-xl md:text-2xl">15+</div>
              <div className="font-mono text-text-muted text-xs">Topik</div>
            </div>
            <div>
              <div className="font-pixel text-neon-green text-xl md:text-2xl">3</div>
              <div className="font-mono text-text-muted text-xs">Modul</div>
            </div>
            <div>
              <div className="font-pixel text-neon-green text-xl md:text-2xl">100%</div>
              <div className="font-mono text-text-muted text-xs">Gratis</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}