'use client'

import PixelCard from '../ui/PixelCard'
import PixelBadge from '../ui/PixelBadge'

const features = [
  {
    icon: '🎮',
    title: 'Pixel Art UI',
    description: 'Antarmuka retro game yang bikin belajar algoritma jadi seru dan engaging.',
    badge: 'RETRO',
    badgeVariant: 'green' as const,
  },
  {
    icon: '⚡',
    title: 'Step-by-Step',
    description: 'Lihat eksekusi kode C++ langkah demi langkah dengan visualisasi variabel.',
    badge: 'REAL-TIME',
    badgeVariant: 'blue' as const,
  },
  {
    icon: '📚',
    title: '15+ Topik',
    description: 'Dari percabangan sampai algoritma sorting, lengkap dengan contoh interaktif.',
    badge: 'COMPLETE',
    badgeVariant: 'purple' as const,
  },
  {
    icon: '🎯',
    title: 'Variable Tracker',
    description: 'Pantau perubahan nilai variabel setiap langkah eksekusi.',
    badge: 'VISUAL',
    badgeVariant: 'yellow' as const,
  },
  {
    icon: '⌨️',
    title: 'Code Editor',
    description: 'Tulis dan edit kode C++ langsung di browser dengan syntax highlighting.',
    badge: 'INTERACTIVE',
    badgeVariant: 'green' as const,
  },
  {
    icon: '🎬',
    title: 'Animation Control',
    description: 'Play, pause, dan atur kecepatan eksekusi sesuai keinginan.',
    badge: 'CONTROL',
    badgeVariant: 'blue' as const,
  },
]

export default function FeatureSection() {
  return (
    <section className="py-16 md:py-20 bg-pixel-darker/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <PixelBadge variant="purple" className="mb-4">FEATURES.exe</PixelBadge>
          <h2 className="font-pixel text-xl md:text-2xl text-neon-green">
            Fitur Unggulan
          </h2>
          <p className="font-mono text-text-muted text-sm mt-2">
            Loaded with pixel-powered features
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <PixelCard key={index} glow>
              <div className="flex items-start gap-3">
                <div className="text-3xl">{feature.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-pixel text-neon-blue text-sm">
                      {feature.title}
                    </h3>
                    <PixelBadge variant={feature.badgeVariant} className="text-[6px] md:text-[8px]">
                      {feature.badge}
                    </PixelBadge>
                  </div>
                  <p className="font-mono text-text-secondary text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </PixelCard>
          ))}
        </div>
      </div>
    </section>
  )
}