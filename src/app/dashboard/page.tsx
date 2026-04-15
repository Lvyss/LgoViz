'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type ModuleColor = 'emerald' | 'blue' | 'purple'

type Module = {
  id: string
  title: string
  description: string
  icon: string
  topics: number
  difficulty: string
  color: ModuleColor
  progress: number
}

const modules: Module[] = [
  {
    id: 'percabangan',
    title: 'Percabangan',
    description: 'Belajar if, if-else, else-if, nested if, dan switch-case',
    icon: '🔀',
    topics: 5,
    difficulty: 'Beginner',
    color: 'emerald',
    progress: 0,
  },
  {
    id: 'perulangan',
    title: 'Perulangan',
    description: 'Belajar for, while, do-while, nested loop, break & continue',
    icon: '🔄',
    topics: 5,
    difficulty: 'Intermediate',
    color: 'blue',
    progress: 0,
  },
  {
    id: 'struktur-data',
    title: 'Struktur Data & Algoritma',
    description: 'Belajar Array, Stack, Queue, Linear Search, Bubble Sort',
    icon: '📊',
    topics: 5,
    difficulty: 'Advanced',
    color: 'purple',
    progress: 0,
  },
]

const colorStyles: Record<ModuleColor, { text: string; border: string; hover: string; iconBg: string; badge: string; button: string }> = {
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    hover: 'hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    button: 'text-emerald-400 hover:bg-emerald-500/10',
  },
  blue: {
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    hover: 'hover:border-blue-500/50',
    iconBg: 'bg-blue-500/20',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    button: 'text-blue-400 hover:bg-blue-500/10',
  },
  purple: {
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    hover: 'hover:border-purple-500/50',
    iconBg: 'bg-purple-500/20',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    button: 'text-purple-400 hover:bg-purple-500/10',
  },
}

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const totalProgress = 0
  const completedModules = modules.filter(m => m.progress === 100).length
  const completedTopics = modules.reduce((acc, m) => acc + Math.floor(m.progress / 100 * m.topics), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-400">
          {user?.email} · Level: Beginner
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-sm text-gray-500 mb-1">Total Progress</div>
          <div className="text-3xl font-bold text-emerald-400">{totalProgress}%</div>
          <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalProgress}%` }} />
          </div>
        </div>
        
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-sm text-gray-500 mb-1">Completed Modules</div>
          <div className="text-3xl font-bold text-blue-400">{completedModules}/{modules.length}</div>
        </div>
        
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-sm text-gray-500 mb-1">Topics Completed</div>
          <div className="text-3xl font-bold text-purple-400">{completedTopics}/15</div>
        </div>
      </div>

      {/* Modules Grid */}
      <h2 className="text-2xl font-bold tracking-tight mb-6">Available Modules</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link href={`/learn/${module.id}`} key={module.id}>
            <div
              className={`group relative p-6 rounded-xl border ${colorStyles[module.color].border} ${colorStyles[module.color].hover} transition-all duration-200 hover:scale-[1.02] hover:shadow-xl bg-gradient-to-b from-${module.color}-500/20 to-${module.color}-600/5`}
            >
              {/* Difficulty Badge */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{module.icon}</div>
                <span className={`text-xs px-2 py-1 rounded-full border ${colorStyles[module.color].badge}`}>
                  {module.difficulty}
                </span>
              </div>
              
              {/* Title */}
              <h3 className={`text-xl font-semibold mb-2 ${colorStyles[module.color].text}`}>
                {module.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {module.description}
              </p>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{module.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      module.color === 'emerald' ? 'bg-emerald-500' 
                      : module.color === 'blue' ? 'bg-blue-500' 
                      : 'bg-purple-500'
                    }`}
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-gray-500">{module.topics} topics</span>
                  <span className={`text-sm font-medium ${colorStyles[module.color].button} transition-colors px-3 py-1.5 rounded-lg`}>
                    Start →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}