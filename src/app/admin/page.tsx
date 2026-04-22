'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

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
      
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
      
      const { count: completedCount } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
      
      const { count: attemptsCount } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
      
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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-2 rounded-full border-orange-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
        <p className="text-[10px] font-mono tracking-[0.3em] text-orange-500 animate-pulse uppercase">Syncing_Neural_Data...</p>
      </div>
    )
  }

  const statCards = [
    { title: 'Total Siswa', value: stats.totalStudents, icon: '👥', color: 'from-orange-600 to-red-600' },
    { title: 'Topik Selesai', value: stats.totalTopicsCompleted, icon: '✅', color: 'from-yellow-500 to-orange-500' },
    { title: 'Quiz Dikerjakan', value: stats.totalQuizAttempts, icon: '📝', color: 'from-red-600 to-rose-700' },
    { title: 'Rata-rata Skor', value: `${stats.avgScore}%`, icon: '📊', color: 'from-amber-400 to-orange-600' },
  ]

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl italic font-black leading-none tracking-tighter uppercase">
            Dash<span className="text-orange-500">board</span>
          </h1>
          <p className="text-[10px] font-mono text-gray-500 mt-2 tracking-widest uppercase">Overview_System_Analytic_v1.0</p>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Server_Status</p>
          <p className="font-mono text-xs text-white">OPERATIONAL</p>
        </div>
      </div>
      
      {/* STATS CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={card.title} 
            className="group relative p-6 rounded-[2rem] border border-white/5 bg-[#080808] hover:border-orange-500/30 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg shadow-orange-900/20`}>
                <span className="text-lg">{card.icon}</span>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{card.title}</p>
                <div className="mt-1 text-3xl font-black tracking-tighter text-white">{card.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* QUICK ACTIONS: REDESIGNED */}
        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#080808] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-[50px]" />
          <h2 className="relative z-10 mb-6 text-xs font-black uppercase tracking-[0.3em] text-gray-400">Quick_Actions</h2>
          
          <div className="relative z-10 grid gap-3">
            {[
              { href: "/admin/questions/new", label: "Tambah Soal Baru", icon: "plus", color: "text-orange-500" },
              { href: "/admin/materials", label: "Edit Materi", icon: "edit", color: "text-yellow-500" },
              { href: "/admin/students", label: "Data Siswa", icon: "user", color: "text-red-500" }
            ].map((action) => (
              <a 
                key={action.label}
                href={action.href} 
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-orange-500/20 hover:bg-white/[0.05] transition-all duration-300 group/item"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-[10px] font-black tracking-widest uppercase ${action.color}`}>[ {action.icon} ]</div>
                  <span className="text-xs font-bold tracking-wide uppercase transition-transform group-hover/item:translate-x-1">{action.label}</span>
                </div>
                <div className="flex items-center justify-center w-5 h-5 transition-colors border rounded-full border-white/10 group-hover/item:border-orange-500">
                  <span className="text-[10px] group-hover/item:text-orange-500">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* SYSTEM INFO: TERMINAL STYLE */}
        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#080808] font-mono">
          <h2 className="mb-6 text-xs font-black uppercase tracking-[0.3em] text-gray-400">System_Diagnostics</h2>
          <div className="space-y-4">
            {[
              { label: "Database", status: "Connected", color: "text-emerald-500" },
              { label: "Auth_Service", status: "Active", color: "text-emerald-500" },
              { label: "Total_Modul", status: "03", color: "text-white" },
              { label: "Cache_Status", status: "Optimized", color: "text-orange-500" }
            ].map((info) => (
              <div key={info.label} className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                <span className="text-[10px] text-gray-600 uppercase tracking-widest">{info.label}</span>
                <span className={`text-[10px] font-bold uppercase ${info.color}`}>{info.status}</span>
              </div>
            ))}
            <div className="mt-6 pt-4 text-[9px] text-gray-700 leading-relaxed italic">
              // All systems functioning within normal parameters. <br />
              // Last sync: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}