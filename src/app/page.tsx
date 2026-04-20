'use client'

import HeroSection from '@/components/sections/HeroSection'
import FeatureSection from '@/components/sections/FeatureSection'
import ModuleGrid from '@/components/sections/ModuleGrid'

export default function LandingPage() {
  return (
    <>
      <main>
        <HeroSection />
        
        {/* Fitur Section */}
        <div id="fitur">
          <FeatureSection />
        </div>
        
        {/* Modul Section */}
        <div id="modul">
          <ModuleGrid />
        </div>
        
        {/* CTA Section */}
        <section className="py-16 md:py-20">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">
                Siap Jadi Programmer Handal?
              </h2>
              <p className="mb-8 text-gray-400">
                Visualisasi algoritma terbaik untuk siswa SMK RPL se-Indonesia.
              </p>
              <a
                href="/auth/register"
                className="inline-flex px-6 py-3 font-medium text-white transition-all rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg"
              >
                Mulai Belajar Gratis →
              </a>
            </div>
          </div>
        </section>
      </main>

    </>
  )
}