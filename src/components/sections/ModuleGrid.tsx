'use client'

import Link from 'next/link'
import PixelCard from '../ui/PixelCard'
import PixelButton from '../ui/PixelButton'
import PixelBadge from '../ui/PixelBadge'

const modules = [
  {
    id: 'percabangan',
    title: 'Percabangan',
    description: 'Belajar if, if-else, else-if, nested if, dan switch-case',
    icon: '🔀',
    topics: 5,
    difficulty: 'Beginner',
    color: 'green' as const,
  },
  {
    id: 'perulangan',
    title: 'Perulangan',
    description: 'Belajar for, while, do-while, nested loop, break & continue',
    icon: '🔄',
    topics: 5,
    difficulty: 'Intermediate',
    color: 'blue' as const,
  },
  {
    id: 'struktur-data',
    title: 'Struktur Data',
    description: 'Belajar Array, Stack, Queue, Linear Search, Bubble Sort',
    icon: '📊',
    topics: 5,
    difficulty: 'Advanced',
    color: 'purple' as const,
  },
]

export default function ModuleGrid() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <PixelBadge variant="green" className="mb-4">MODULES.exe</PixelBadge>
          <h2 className="font-pixel text-xl md:text-2xl text-neon-green">
            Pilih Modul
          </h2>
          <p className="font-mono text-text-muted text-sm mt-2">
            Start your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link href={`/learn/${module.id}`} key={module.id}>
              <PixelCard glow className="group hover:scale-[1.02] transition-transform cursor-pointer h-full">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-4xl">{module.icon}</div>
                    <PixelBadge variant={module.color}>
                      {module.difficulty}
                    </PixelBadge>
                  </div>
                  
                  <h3 className="font-pixel text-neon-blue text-lg mb-2">
                    {module.title}
                  </h3>
                  
                  <p className="font-mono text-text-secondary text-sm mb-4 flex-1">
                    {module.description}
                  </p>
                  
                  <div className="flex justify-between items-center mt-auto">
                    <div className="font-mono text-text-muted text-xs">
                      {module.topics} Topik
                    </div>
                    <PixelButton variant="secondary" className="text-[8px] py-1 px-3">
                      SELECT →
                    </PixelButton>
                  </div>
                </div>
              </PixelCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}