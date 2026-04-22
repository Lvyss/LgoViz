'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface StudentDetail {
  id: string
  full_name: string
  email: string
  created_at: string
}

interface TopicProgress {
  topic_id: string
  topic_title: string
  module_id: string
  module_title: string
  status: 'locked' | 'unlocked' | 'completed'
  best_score: number
  completed_at: string | null
}

interface QuizAttempt {
  id: string
  topic_id: string
  topic_title: string
  score: number
  passed: boolean
  attempted_at: string
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const supabase = createClient()
  
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [progress, setProgress] = useState<TopicProgress[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad() {
    try {
      // Check if user is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }
      
      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      
      if (profileError) {
        console.error('Error checking profile:', profileError)
        setError('Gagal memverifikasi akses admin')
        setLoading(false)
        return
      }
      
      if (profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      
      await loadData()
    } catch (err) {
      console.error('Error in checkAdminAndLoad:', err)
      setError('Terjadi kesalahan')
      setLoading(false)
    }
  }

  async function loadData() {
    setLoading(true)
    setError(null)
    
    try {
      // Get student profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .maybeSingle()
      
      if (profileError) {
        console.error('Error loading profile:', profileError)
        setError('Gagal memuat data siswa')
        setLoading(false)
        return
      }
      
      if (!profile) {
        setError('Siswa tidak ditemukan')
        setLoading(false)
        return
      }
      
      setStudent(profile)
      
      // Get all topics with module info
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select(`
          id, 
          title, 
          module_id, 
          modules (
            title
          )
        `)
        .order('module_id', { ascending: true })
        .order('order_index', { ascending: true })
      
      if (topicsError) {
        console.error('Error loading topics:', topicsError)
      }
      
      // Get user progress
      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', studentId)
      
      if (progressError) {
        console.error('Error loading progress:', progressError)
      }
      
      const progressMap = new Map()
      userProgress?.forEach(p => {
        progressMap.set(p.topic_id, p)
      })
      
      // Build progress list
      const progressList: TopicProgress[] = (topics || []).map((topic: any) => {
        const prog = progressMap.get(topic.id)
        return {
          topic_id: topic.id,
          topic_title: topic.title,
          module_id: topic.module_id,
          module_title: topic.modules?.title || topic.module_id,
          status: prog?.status || 'locked',
          best_score: prog?.best_score || 0,
          completed_at: prog?.completed_at || null
        }
      })
      
      setProgress(progressList)
      
      // Get quiz attempts
      const { data: quizAttempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          topics (
            title
          )
        `)
        .eq('user_id', studentId)
        .order('attempted_at', { ascending: false })
      
      if (attemptsError) {
        console.error('Error loading attempts:', attemptsError)
      }
      
      const attemptsList: QuizAttempt[] = (quizAttempts || []).map((attempt: any) => ({
        id: attempt.id,
        topic_id: attempt.topic_id,
        topic_title: attempt.topics?.title || attempt.topic_id,
        score: attempt.score,
        passed: attempt.passed,
        attempted_at: attempt.attempted_at
      }))
      
      setAttempts(attemptsList)
    } catch (err) {
      console.error('Error in loadData:', err)
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getStatusBadge(status: string, score: number) {
    if (status === 'completed') {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">
          ✓ Completed ({score}%)
        </span>
      )
    }
    if (status === 'unlocked') {
      return (
        <span className="px-2 py-1 text-xs text-blue-400 rounded-full bg-blue-500/20">
          🔓 Unlocked
        </span>
      )
    }
    return (
      <span className="px-2 py-1 text-xs text-gray-400 rounded-full bg-gray-500/20">
        🔒 Locked
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block p-6 border bg-red-500/10 border-red-500/20 rounded-xl">
          <p className="text-red-400">{error || 'Siswa tidak ditemukan'}</p>
          <Link href="/admin/students" className="inline-block mt-4 text-emerald-400 hover:underline">
            ← Kembali ke daftar siswa
          </Link>
        </div>
      </div>
    )
  }

  const totalTopics = progress.length
  const completedTopics = progress.filter(p => p.status === 'completed').length
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length)
    : 0

  // Group progress by module
  const progressByModule: Record<string, TopicProgress[]> = {}
  progress.forEach(p => {
    if (!progressByModule[p.module_title]) {
      progressByModule[p.module_title] = []
    }
    progressByModule[p.module_title].push(p)
  })

return (
    <div className="space-y-10 duration-700 animate-in fade-in slide-in-from-bottom-4">
      
      {/* HEADER & NAVIGATION */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <Link
            href="/admin/students"
            className="group flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-orange-500 transition-colors"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back_to_Registry
          </Link>
          <h1 className="text-4xl italic font-black leading-none tracking-tighter text-white uppercase">
            Student<span className="text-orange-500">_Analysis</span>
          </h1>
        </div>
        
        <div className="flex gap-4">
          <div className="px-6 py-3 border border-white/5 bg-[#080808] rounded-2xl">
             <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest leading-none mb-1">Status_Node</p>
             <p className="text-xs font-black tracking-widest uppercase text-emerald-500">Active_Session</p>
          </div>
        </div>
      </div>

      {/* STUDENT PROFILE CARD */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3 p-8 border rounded-[2.5rem] bg-[#080808] border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
             </svg>
          </div>
          
          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div className="relative group">
              <div className="absolute transition-all bg-orange-600 -inset-1 rounded-3xl blur opacity-20 group-hover:opacity-40" />
              <div className="relative flex items-center justify-center w-24 h-24 text-4xl italic font-black text-white shadow-2xl rounded-3xl bg-gradient-to-br from-orange-600 to-orange-900">
                {student.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl italic font-black leading-none tracking-tighter text-white uppercase">
                {student.full_name}
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-mono text-xs text-gray-500">{student.email}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[10px] font-mono text-orange-500/80 uppercase tracking-widest border border-orange-500/20 px-2 py-0.5 rounded">
                  Student_UID: {student.id.slice(0,8)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 mt-12 border-t md:grid-cols-4 border-white/5">
            <div>
              <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Registration_Date</p>
              <p className="text-xs font-bold text-white uppercase">{formatDate(student.created_at)}</p>
            </div>
            <div>
              <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Total_Engagement</p>
              <p className="text-xs font-bold uppercase text-emerald-500">{overallProgress}% Completion</p>
            </div>
            <div>
              <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Cognitive_Score</p>
              <p className="text-xs font-bold text-blue-400 uppercase">{avgScore}% Accuracy</p>
            </div>
             <div>
              <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Learning_Tier</p>
              <p className="text-xs font-bold text-white uppercase">{overallProgress > 50 ? 'Advanced' : 'Novice'}</p>
            </div>
          </div>
        </div>

        {/* PROGRESS CIRCLE CARD */}
        <div className="p-8 border rounded-[2.5rem] bg-[#080808] border-white/5 flex flex-col items-center justify-center text-center shadow-xl">
           <div className="relative flex items-center justify-center w-32 h-32 mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                <circle 
                  cx="64" cy="64" r="58" fill="transparent" stroke="url(#orangeGradient)" strokeWidth="8" 
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * overallProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black leading-none text-white">{completedTopics}</span>
                <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Topics</span>
              </div>
           </div>
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Curriculum_Progress</p>
        </div>
      </div>

      {/* TOPIC BREAKDOWN */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">
            Module_Breakdown
            <div className="h-[1px] flex-1 bg-white/5" />
          </h2>
          
          <div className="space-y-4">
            {Object.entries(progressByModule).map(([moduleTitle, topics]) => (
              <div key={moduleTitle} className="border border-white/5 rounded-3xl bg-[#080808] overflow-hidden group hover:border-white/10 transition-colors">
                <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{moduleTitle}</h3>
                  <span className="text-[8px] font-mono text-gray-600">{topics.length} Nodes</span>
                </div>
                <div className="p-6 space-y-3">
                  {topics.map(topic => (
                    <div key={topic.topic_id} className="flex items-center justify-between group/item">
                      <span className="text-xs text-gray-500 transition-colors group-hover/item:text-gray-300">{topic.topic_title}</span>
                      {topic.status === 'completed' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-500">{topic.best_score}%</span>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                      ) : topic.status === 'unlocked' ? (
                        <div className="w-2 h-2 rounded-full bg-blue-500/30" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUIZ LOG */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">
            Recent_Attempts
            <div className="h-[1px] flex-1 bg-white/5" />
          </h2>

          <div className="border rounded-[2.5rem] bg-[#080808] border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">Topic</th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Score</th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-600 uppercase tracking-widest text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-5 text-xs font-medium text-white transition-colors group-hover:text-orange-500">{attempt.topic_title}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
                          attempt.passed 
                          ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' 
                          : 'text-red-500 border-red-500/20 bg-red-500/5'
                        }`}>
                          {attempt.score}%
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right text-[10px] font-mono text-gray-600 uppercase">
                        {formatDate(attempt.attempted_at)}
                      </td>
                    </tr>
                  ))}
                  {attempts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-[10px] font-mono text-gray-700 uppercase tracking-widest">
                        Data_Buffer_Empty
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}