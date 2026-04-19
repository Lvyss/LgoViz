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
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Daftar Siswa
        </Link>
      </div>

      {/* Student Info */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <div className="p-6 border md:col-span-2 rounded-xl bg-white/5 border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20">
              <span className="text-2xl text-emerald-400">
                {student.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{student.full_name}</h1>
              <p className="text-gray-400">{student.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-gray-500">Bergabung</p>
              <p className="text-sm text-white">{formatDate(student.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Progress Overall</p>
              <p className="text-sm text-emerald-400">{overallProgress}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Rata-rata Quiz</p>
              <p className="text-sm text-blue-400">{avgScore}%</p>
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-xl bg-white/5 border-white/10">
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-emerald-400">{completedTopics}</div>
            <p className="text-sm text-gray-400">Topik Selesai</p>
            <div className="h-2 mt-4 overflow-hidden rounded-full bg-white/10">
              <div 
                className="h-full transition-all rounded-full bg-emerald-500"
                style={{ width: `${(completedTopics / totalTopics) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">dari {totalTopics} topik</p>
          </div>
        </div>
      </div>

      {/* Progress Detail */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Progress Per Topik</h2>
        {progress.length === 0 ? (
          <div className="p-6 text-center border rounded-xl bg-white/5 border-white/10">
            <p className="text-gray-400">Belum ada data progress</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(progressByModule).map(([moduleTitle, topics]) => (
              <div key={moduleTitle} className="p-4 border rounded-xl bg-white/5 border-white/10">
                <h3 className="mb-3 font-medium text-gray-300 text-md">{moduleTitle}</h3>
                <div className="space-y-2">
                  {topics.map(topic => (
                    <div key={topic.topic_id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-gray-300">{topic.topic_title}</span>
                      {getStatusBadge(topic.status, topic.best_score)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz History */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Riwayat Quiz</h2>
        {attempts.length === 0 ? (
          <div className="p-6 text-center border rounded-xl bg-white/5 border-white/10">
            <p className="text-gray-400">Belum ada quiz yang dikerjakan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-xs text-left text-gray-500">
                  <th className="pb-3 font-medium">Topik</th>
                  <th className="pb-3 font-medium">Skor</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Tanggal</th>
                 </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-white/5">
                    <td className="py-3 text-sm text-white">{attempt.topic_title}</td>
                    <td className="py-3">
                      <span className={`text-sm font-medium ${attempt.score >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {attempt.score}%
                      </span>
                    </td>
                    <td className="py-3">
                      {attempt.passed ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Lulus</span>
                      ) : (
                        <span className="px-2 py-1 text-xs text-red-400 rounded-full bg-red-500/20">Tidak Lulus</span>
                      )}
                    </td>
                    <td className="py-3 text-sm text-gray-400">{formatDate(attempt.attempted_at)}</td>
                   </tr>
                ))}
              </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  )
}