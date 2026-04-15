'use client'

type FeatureColor = 'emerald' | 'blue' | 'purple'

type Feature = {
  icon: string
  title: string
  description: string
  color: FeatureColor
}

const features: Feature[] = [
  {
    icon: '🎮',
    title: 'Visual Interaktif',
    description: 'Lihat eksekusi kode C++ step-by-step dengan highlight baris aktif.',
    color: 'emerald',
  },
  {
    icon: '⚡',
    title: 'Real-time Variable Tracker',
    description: 'Pantau perubahan nilai variabel di setiap langkah eksekusi.',
    color: 'blue',
  },
  {
    icon: '📚',
    title: '15+ Topik Lengkap',
    description: 'Dari percabangan, perulangan, sampai struktur data dan algoritma.',
    color: 'purple',
  },
  {
    icon: '⌨️',
    title: 'Code Editor',
    description: 'Tulis dan edit kode C++ langsung di browser dengan syntax highlight.',
    color: 'emerald',
  },
  {
    icon: '🎬',
    title: 'Animation Control',
    description: 'Play, pause, dan atur kecepatan eksekusi sesuai keinginan.',
    color: 'blue',
  },
  {
    icon: '🎯',
    title: 'Gratis & Aksesibel',
    description: 'Tidak perlu install apa pun, cukup buka browser dan belajar.',
    color: 'purple',
  },
]

type ColorClass = {
  bg: string
  border: string
  icon: string
}

const colorClasses: Record<FeatureColor, ColorClass> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'bg-emerald-500/20 text-emerald-400',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'bg-blue-500/20 text-blue-400',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: 'bg-purple-500/20 text-purple-400',
  },
}

export default function FeatureSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-white text-3xl font-bold tracking-tight">
            Fitur yang Membantu Belajarmu
          </h2>
          <p className="text-gray-400 mt-2">
            Semua tools yang kamu butuhkan dalam satu platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl ${colorClasses[feature.color].bg} border ${colorClasses[feature.color].border} hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className={`w-12 h-12 rounded-lg ${colorClasses[feature.color].icon} flex items-center justify-center text-2xl mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}