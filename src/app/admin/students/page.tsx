'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Student {
  id: string
  full_name: string
  email: string
  created_at: string
  total_topics_completed: number
  avg_score: number
  last_active: string
}

export default function AdminStudentsPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad() {
    try {
      // Check if user is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        window.location.href = '/auth/login'
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
        window.location.href = '/dashboard'
        return
      }
      
      setIsAdmin(true)
      await loadStudents()
    } catch (err) {
      console.error('Error in checkAdminAndLoad:', err)
      setError('Terjadi kesalahan')
      setLoading(false)
    }
  }
async function loadStudents() {
  setLoading(true)
  setError(null)
  
  try {
    console.log('=== DEBUG: Loading students ===')
    
    // Get all students from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false })
    
    console.log('Profiles query result:', { profiles, profilesError })
    
    if (profilesError) {
      console.error('Error loading profiles:', profilesError)
      setError('Gagal memuat data siswa: ' + profilesError.message)
      setLoading(false)
      return
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('No profiles found with role=student')
      setStudents([])
      setLoading(false)
      return
    }
    
    console.log(`Found ${profiles.length} students`)
    
    // Get progress data for each student
    const studentsWithStats = await Promise.all(
      profiles.map(async (profile) => {
        console.log(`Processing student: ${profile.id} - ${profile.full_name}`)
        
        // Get completed topics count
        const { count: completedCount, error: completedError } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('status', 'completed')
        
        if (completedError) {
          console.error(`Error getting completed topics for ${profile.id}:`, completedError)
        }
        
        console.log(`Completed topics for ${profile.id}: ${completedCount || 0}`)
        
        // Get average quiz score
        const { data: attempts, error: attemptsError } = await supabase
          .from('quiz_attempts')
          .select('score')
          .eq('user_id', profile.id)
        
        if (attemptsError) {
          console.error(`Error getting attempts for ${profile.id}:`, attemptsError)
        }
        
        const avgScore = attempts && attempts.length > 0
          ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length)
          : 0
        
        console.log(`Avg score for ${profile.id}: ${avgScore}`)
        
        // Get last active from quiz_attempts
        const { data: lastAttempt, error: lastError } = await supabase
          .from('quiz_attempts')
          .select('attempted_at')
          .eq('user_id', profile.id)
          .order('attempted_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (lastError) {
          console.error(`Error getting last attempt for ${profile.id}:`, lastError)
        }
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          created_at: profile.created_at,
          total_topics_completed: completedCount || 0,
          avg_score: avgScore,
          last_active: lastAttempt?.attempted_at || profile.created_at
        }
      })
    )
    
    console.log('Final students data:', studentsWithStats)
    setStudents(studentsWithStats)
  } catch (err) {
    console.error('Error in loadStudents:', err)
    setError('Terjadi kesalahan saat memuat data')
  } finally {
    setLoading(false)
  }
}

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (!isAdmin && loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
      </div>
    )
  }

return (
    <div className="space-y-8 duration-700 animate-in fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-6 pb-8 border-b md:flex-row md:items-end border-white/5">
        <div>
          <h1 className="text-4xl italic font-black leading-none tracking-tighter text-white uppercase">
            Student<span className="text-orange-500">_Database</span>
          </h1>
          <p className="text-[10px] font-mono text-gray-500 mt-2 tracking-widest uppercase italic">
            Monitoring_Student_Performance_&_Learning_Metrics
          </p>
        </div>
        
        {/* Search Input - Cyberpunk Style */}
        <div className="relative w-full max-w-md group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-transparent opacity-20 rounded-xl blur group-focus-within:opacity-40 transition-all" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search_Name_or_Email..."
            className="relative w-full px-6 py-3 bg-[#080808] border border-white/10 rounded-xl text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
          />
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center justify-between p-4 border border-red-500/20 bg-red-500/5 rounded-2xl">
          <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">{error}</p>
          <button onClick={() => loadStudents()} className="text-[10px] font-black text-red-400 underline uppercase italic">Retry_Sync</button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="w-12 h-12 border-2 rounded-full border-orange-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
          <p className="text-[10px] font-mono tracking-[0.3em] text-orange-500 animate-pulse uppercase">Fetching_Student_Nodes...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        /* EMPTY STATE */
        <div className="py-24 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em]">No_Student_Records_Found</p>
        </div>
      ) : (
        /* STUDENTS TABLE */
        <div className="relative border rounded-[2.5rem] bg-[#080808] border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Siswa</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Metrik_Progress</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Rata_Skor</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Aktivitas</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="flex items-center justify-center w-10 h-10 italic font-black text-white transition-transform shadow-lg rounded-xl bg-gradient-to-br from-orange-600 to-orange-900 group-hover:scale-110">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#080808] rounded-full shadow-sm" />
                        </div>
                        <div>
                          <p className="text-sm italic font-black tracking-tight text-white uppercase transition-colors group-hover:text-orange-500">
                            {student.full_name}
                          </p>
                          <p className="text-[10px] font-mono text-gray-600 tracking-tighter lowercase">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-6">
                      <div className="flex items-end gap-2">
                        <span className="text-lg font-black leading-none text-white">{student.total_topics_completed}</span>
                        <span className="text-[10px] font-mono text-gray-600 mb-0.5 tracking-widest uppercase">/ 15_Topics</span>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-gray-500">
                          <span>Efficiency</span>
                          <span className={student.avg_score >= 80 ? 'text-emerald-500' : 'text-orange-500'}>{student.avg_score}%</span>
                        </div>
                        <div className="w-24 h-1 overflow-hidden rounded-full bg-white/5">
                          <div 
                            className={`h-full transition-all duration-1000 ${student.avg_score >= 80 ? 'bg-emerald-500' : 'bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.5)]'}`}
                            style={{ width: `${student.avg_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                        Last_Pulse: <span className="text-gray-600">{formatDate(student.last_active)}</span>
                      </p>
                      <p className="text-[9px] font-mono text-gray-700 uppercase tracking-tighter">
                        Joined: {formatDate(student.created_at)}
                      </p>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-orange-600 border border-white/10 hover:border-orange-500 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all shadow-xl group/btn"
                      >
                        Inspect_Profile
                        <svg className="w-3 h-3 ml-2 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer Decal */}
          <div className="bg-white/[0.02] border-t border-white/5 px-8 py-4">
            <p className="text-[8px] font-mono text-gray-700 uppercase tracking-[0.5em]">
              Authorized_Personnel_Only // LgoViz_Student_Registry_v2.0
            </p>
          </div>
        </div>
      )}
    </div>
  )
}