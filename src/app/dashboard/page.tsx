'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PixelButton from '@/components/ui/PixelButton'
import PixelCard from '@/components/ui/PixelCard'
import PixelBadge from '@/components/ui/PixelBadge'
import PixelProgressBar from '@/components/ui/PixelProgressBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ScanlineOverlay from '@/components/ui/ScanlineOverlay'

// Modules data
const modules = [
  {
    id: 'percabangan',
    title: 'Percabangan',
    description: 'Belajar if, if-else, else-if, nested if, dan switch-case',
    icon: '🔀',
    topics: 5,
    difficulty: 'Beginner',
    color: 'green' as const,
    progress: 0,
  },
  {
    id: 'perulangan',
    title: 'Perulangan',
    description: 'Belajar for, while, do-while, nested loop, break & continue',
    icon: '🔄',
    topics: 5,
    difficulty: 'Intermediate',
    color: 'blue' as const,
    progress: 0,
  },
  {
    id: 'struktur-data',
    title: 'Struktur Data & Algoritma',
    description: 'Belajar Array, Stack, Queue, Linear Search, Bubble Sort',
    icon: '📊',
    topics: 5,
    difficulty: 'Advanced',
    color: 'purple' as const,
    progress: 0,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  if (loading) {
    return (
      <>
        <ScanlineOverlay />
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="font-pixel text-neon-green text-center">
            <p>LOADING...</p>
            <div className="w-8 h-8 border-2 border-neon-green border-t-transparent animate-spin mt-4 mx-auto"></div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <ScanlineOverlay />
      <Navbar />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block mb-2">
              <span className="font-mono text-neon-green text-sm animate-pixel-blink">
                █ DASHBOARD.exe █
              </span>
            </div>
            <h1 className="font-pixel text-2xl text-neon-green mb-2">
              Welcome Back!
            </h1>
            <p className="font-mono text-text-secondary">
              <span className="text-neon-blue">{user?.email}</span>
              <span className="text-text-muted"> | Level: PIXEL_APPRENTICE</span>
            </p>
          </div>

          {/* Stats Card */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-pixel-panel border-2 border-neon-green/50 p-4">
              <div className="font-mono text-text-muted text-xs">TOTAL PROGRESS</div>
              <div className="font-pixel text-neon-green text-2xl">0%</div>
              <PixelProgressBar value={0} max={100} className="mt-2" />
            </div>
            <div className="bg-pixel-panel border-2 border-neon-green/50 p-4">
              <div className="font-mono text-text-muted text-xs">MODULES</div>
              <div className="font-pixel text-neon-green text-2xl">0/3</div>
            </div>
            <div className="bg-pixel-panel border-2 border-neon-green/50 p-4">
              <div className="font-mono text-text-muted text-xs">TOPICS</div>
              <div className="font-pixel text-neon-green text-2xl">0/15</div>
            </div>
          </div>

          {/* Module Grid */}
          <h2 className="font-pixel text-neon-blue text-lg mb-4">
            Available Modules
          </h2>
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
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-text-muted font-mono text-xs">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                      </div>
                      <PixelProgressBar value={module.progress} max={100} />
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-mono text-text-muted text-xs">
                          {module.topics} Topics
                        </span>
                        <PixelButton variant="secondary" className="text-[8px] py-1 px-3">
                          START →
                        </PixelButton>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}