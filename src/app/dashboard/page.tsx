'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getAllModules, getTopicsByModule, getUserProgress } from '@/lib/supabase/queries'
import { initializeUserProgress } from '@/lib/supabase/queries'


type ModuleColor = 'emerald' | 'blue' | 'purple'

type Module = {
  id: string
  title: string
  description: string
  icon: string
  difficulty: string
  color: ModuleColor
  totalTopics: number
  completedTopics: number
  progress: number
}

const moduleIcons: Record<string, string> = {
  percabangan: '🔀',
  perulangan: '🔄',
  'struktur-data': '📊',
}

const moduleColors: Record<string, ModuleColor> = {
  percabangan: 'emerald',
  perulangan: 'blue',
  'struktur-data': 'purple',
}

const moduleDifficulties: Record<string, string> = {
  percabangan: 'Beginner',
  perulangan: 'Intermediate',
  'struktur-data': 'Advanced',
}

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
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProgress, setTotalProgress] = useState(0)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      
          if (user) {
      // Initialize user progress if first time
      const existingProgress = await getUserProgress(user.id)
      if (existingProgress.length === 0) {
        console.log('First time user, initializing progress...')
        await initializeUserProgress(user.id)
      }
    }

      // Get modules from Supabase
      const modulesData = await getAllModules()
      
      // Get user progress
      const userProgress = await getUserProgress(user.id)
      
      // Create progress map for quick lookup
      const progressMap = new Map()
      userProgress.forEach(progress => {
        progressMap.set(progress.topic_id, progress)
      })

      // Build modules with progress
      const modulesWithProgress: Module[] = []
      let totalCompletedTopics = 0
      let totalTopics = 0

      for (const module of modulesData) {
        // Get topics for this module
        const topics = await getTopicsByModule(module.id)
        const totalTopicsCount = topics.length
        
        // Count completed topics for this module
        let completedCount = 0
        for (const topic of topics) {
          const progress = progressMap.get(topic.id)
          if (progress?.status === 'completed') {
            completedCount++
          }
        }
        
        const progressPercent = totalTopicsCount > 0 
          ? Math.round((completedCount / totalTopicsCount) * 100) 
          : 0
        
        modulesWithProgress.push({
          id: module.id,
          title: module.title,
          description: module.description,
          icon: moduleIcons[module.id] || '📚',
          difficulty: moduleDifficulties[module.id] || 'Beginner',
          color: moduleColors[module.id] || 'emerald',
          totalTopics: totalTopicsCount,
          completedTopics: completedCount,
          progress: progressPercent,
        })
        
        totalCompletedTopics += completedCount
        totalTopics += totalTopicsCount
      }
      
      setModules(modulesWithProgress)
      setTotalProgress(totalTopics > 0 ? Math.round((totalCompletedTopics / totalTopics) * 100) : 0)
      setLoading(false)
    }

    loadDashboard()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const completedModules = modules.filter(m => m.progress === 100).length
  const totalCompletedTopics = modules.reduce((acc, m) => acc + m.completedTopics, 0)

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-400">
          Continue your learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 mb-12 md:grid-cols-3">
        <div className="p-6 border rounded-xl bg-white/5 border-white/10">
          <div className="mb-1 text-sm text-gray-500">Total Progress</div>
          <div className="text-3xl font-bold text-emerald-400">{totalProgress}%</div>
          <div className="h-2 mt-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full transition-all duration-500 rounded-full bg-emerald-500" style={{ width: `${totalProgress}%` }} />
          </div>
        </div>
        
        <div className="p-6 border rounded-xl bg-white/5 border-white/10">
          <div className="mb-1 text-sm text-gray-500">Completed Modules</div>
          <div className="text-3xl font-bold text-blue-400">{completedModules}/{modules.length}</div>
          <p className="mt-2 text-xs text-gray-500">Modules fully completed</p>
        </div>
        
        <div className="p-6 border rounded-xl bg-white/5 border-white/10">
          <div className="mb-1 text-sm text-gray-500">Topics Completed</div>
          <div className="text-3xl font-bold text-purple-400">{totalCompletedTopics}/{modules.reduce((acc, m) => acc + m.totalTopics, 0)}</div>
          <p className="mt-2 text-xs text-gray-500">Topics mastered</p>
        </div>
      </div>

      {/* Modules Grid */}
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Available Modules</h2>
      {modules.length === 0 ? (
        <div className="py-12 text-center border bg-white/5 rounded-xl border-white/10">
          <p className="text-gray-400">No modules available yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const styles = colorStyles[module.color]
            const firstUnlockedTopic = module.id === 'percabangan' ? 'if' : 
                                        module.id === 'perulangan' ? 'for-loop' : 'array'
            
            return (
              <Link href={`/learn/${module.id}/${firstUnlockedTopic}`} key={module.id}>
                <div
                  className={`group relative p-6 rounded-xl border ${styles.border} ${styles.hover} transition-all duration-200 hover:scale-[1.02] hover:shadow-xl bg-white/5 cursor-pointer`}
                >
                  {/* Difficulty Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{module.icon}</div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${styles.badge}`}>
                      {module.difficulty}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className={`text-xl font-semibold mb-2 ${styles.text}`}>
                    {module.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="mb-4 text-sm leading-relaxed text-gray-400">
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
                        className={`h-full rounded-full transition-all duration-500 ${
                          module.color === 'emerald' ? 'bg-emerald-500' 
                          : module.color === 'blue' ? 'bg-blue-500' 
                          : 'bg-purple-500'
                        }`}
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">{module.completedTopics}/{module.totalTopics} topics</span>
                      <span className={`text-sm font-medium ${styles.button} transition-colors px-3 py-1.5 rounded-lg`}>
                        {module.progress === 0 ? 'Start →' : module.progress === 100 ? 'Review →' : 'Continue →'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}