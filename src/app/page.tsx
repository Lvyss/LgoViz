import HeroSection from '@/components/sections/HeroSection'
import FeatureSection from '@/components/sections/FeatureSection'
import ModuleGrid from '@/components/sections/ModuleGrid'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      <ModuleGrid />
      
      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-white text-3xl font-bold tracking-tight mb-4">
              Siap Jadi Programmer Handal?
            </h2>
            <p className="text-gray-400 mb-8">
              Visualisasi algoritma terbaik untuk siswa SMK RPL se-Indonesia.
            </p>
            <a
              href="/auth/register"
              className="inline-flex px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              Mulai Belajar Gratis →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}