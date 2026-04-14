'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import FeatureSection from '@/components/sections/FeatureSection'
import ModuleGrid from '@/components/sections/ModuleGrid'
import ScanlineOverlay from '@/components/ui/ScanlineOverlay'

export default function LandingPage() {
  return (
    <>
      <ScanlineOverlay />
      <Navbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <ModuleGrid />
        
        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-pixel-darker/30">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-block mb-4">
              <span className="font-mono text-neon-green text-sm animate-pixel-blink">
                █ READY_TO_CODE █
              </span>
            </div>
            <h2 className="font-pixel text-xl md:text-2xl text-neon-green mb-4">
              Siap Jadi Programmer Handal?
            </h2>
            <p className="font-mono text-text-secondary mb-8 max-w-md mx-auto">
              Visualisasi algoritma terbaik untuk siswa SMK RPL se-Indonesia.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/auth/register" className="inline-block">
                <button className="font-pixel text-xs md:text-sm px-6 md:px-8 py-3 md:py-4 bg-neon-green text-pixel-dark border-2 border-neon-green hover:bg-transparent hover:text-neon-green transition-colors">
                  ▶ REGISTER NOW
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}