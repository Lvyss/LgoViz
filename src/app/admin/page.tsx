'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalStudents: number
  totalTopicsCompleted: number
  totalQuizAttempts: number
  avgScore: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTopicsCompleted: 0,
    totalQuizAttempts: 0,
    avgScore: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()
      
      // Total students
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
      
      // Total completed topics
      const { count: completedCount } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
      
      // Total quiz attempts
      const { count: attemptsCount } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
      
      // Average score
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score')
      
      const avgScore = attempts && attempts.length > 0
        ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length)
        : 0
      
      setStats({
        totalStudents: studentsCount || 0,
        totalTopicsCompleted: completedCount || 0,
        totalQuizAttempts: attemptsCount || 0,
        avgScore,
      })
      setLoading(false)
    }
    
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  const statCards = [
    { title: 'Total Siswa', value: stats.totalStudents, icon: '👥', color: 'emerald' },
    { title: 'Topik Selesai', value: stats.totalTopicsCompleted, icon: '✅', color: 'blue' },
    { title: 'Quiz Dikerjakan', value: stats.totalQuizAttempts, icon: '📝', color: 'purple' },
    { title: 'Rata-rata Skor', value: `${stats.avgScore}%`, icon: '📊', color: 'orange' },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Dashboard Admin</h1>
      
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title} className="p-6 border rounded-xl bg-white/5 border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-xs px-2 py-1 rounded-full bg-${card.color}-500/20 text-${card.color}-400`}>
                {card.title}
              </span>
            </div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-xl bg-white/5 border-white/10">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/admin/questions/new" className="flex items-center gap-3 p-3 transition-colors rounded-lg bg-white/5 hover:bg-white/10">
              <span className="text-emerald-400">+</span>
              <span>Tambah Soal Baru</span>
            </a>
            <a href="/admin/materials" className="flex items-center gap-3 p-3 transition-colors rounded-lg bg-white/5 hover:bg-white/10">
              <span className="text-blue-400">✏️</span>
              <span>Edit Materi</span>
            </a>
            <a href="/admin/students" className="flex items-center gap-3 p-3 transition-colors rounded-lg bg-white/5 hover:bg-white/10">
              <span className="text-purple-400">👥</span>
              <span>Lihat Data Siswa</span>
            </a>
          </div>
        </div>

        <div className="p-6 border rounded-xl bg-white/5 border-white/10">
          <h2 className="mb-4 text-lg font-semibold">Info Sistem</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Database</span>
              <span className="text-green-400">✓ Connected</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-gray-400">Auth</span>
              <span className="text-green-400">✓ Active</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Total Modul</span>
              <span className="text-white">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}