'use client'

import Link from 'next/link'

type ModuleColor = 'emerald' | 'blue' | 'purple'

type Module = {
  id: string
  title: string
  description: string
  icon: string
  topicCount: number
  color: ModuleColor
  gradient: string
}

const modules: Module[] = [
  {
    id: 'percabangan',
    title: 'Percabangan',
    description: 'Pelajari logika if-else, switch-case, dan pengambilan keputusan dalam program.',
    icon: '🔀',
    topicCount: 5,
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
  },
  {
    id: 'perulangan',
    title: 'Perulangan',
    description: 'Kuasai for loop, while loop, dan teknik iterasi untuk efisiensi kode.',
    icon: '🔄',
    topicCount: 5,
    color: 'blue',
    gradient: 'from-blue-500/20 to-blue-600/5',
  },
  {
    id: 'struktur-data',
    title: 'Struktur Data',
    description: 'Pahami array, stack, queue, dan algoritma sorting & searching.',
    icon: '📊',
    topicCount: 5,
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-600/5',
  },
]

type ModuleStyle = {
  border: string
  hover: string
  iconBg: string
  iconText: string
  button: string
}

const firstTopicByModule: Record<string, string> = {
  percabangan: 'if',
  perulangan: 'for-loop',
  'struktur-data': 'array',
}

const colorStyles: Record<ModuleColor, ModuleStyle> = {
  emerald: {
    border: 'border-emerald-500/30',
    hover: 'hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    button: 'text-emerald-400 hover:bg-emerald-500/10',
  },
  blue: {
    border: 'border-blue-500/30',
    hover: 'hover:border-blue-500/50',
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
    button: 'text-blue-400 hover:bg-blue-500/10',
  },
  purple: {
    border: 'border-purple-500/30',
    hover: 'hover:border-purple-500/50',
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    button: 'text-purple-400 hover:bg-purple-500/10',
  },
}

export default function ModuleGrid() {
  return (
    <section className="py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Pilih Modul Belajar
          </h2>
          <p className="mt-2 text-gray-400">
            Mulai dari mana saja, belajar sesuai kecepatanmu
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const firstTopic = firstTopicByModule[module.id] ?? 'if'
            return (
              <Link href={`/learn/${module.id}/${firstTopic}`} key={module.id}>
                <div
                  className={`group relative p-6 rounded-xl border ${colorStyles[module.color].border} ${colorStyles[module.color].hover} transition-all duration-200 hover:scale-[1.02] hover:shadow-xl bg-gradient-to-b ${module.gradient}`}
                >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl ${colorStyles[module.color].iconBg} flex items-center justify-center text-3xl mb-4`}>
                  {module.icon}
                </div>

                {/* Title */}
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {module.title}
                </h3>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-gray-400">
                  {module.description}
                </p>

                {/* Meta & CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {module.topicCount} topik
                  </span>
                  <span className={`text-sm font-medium ${colorStyles[module.color].button} transition-colors px-3 py-1.5 rounded-lg`}>
                    Mulai →
                  </span>
                </div>
              </div>
            </Link>
          )})}
        </div>
      </div>
    </section>
  )
}