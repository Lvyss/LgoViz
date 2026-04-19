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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Data Siswa</h1>
        <p className="mt-1 text-sm text-gray-400">Lihat dan pantau progress siswa</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-6 border bg-red-500/10 border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
          <button 
            onClick={() => loadStudents()} 
            className="mt-2 text-sm text-red-400 hover:text-red-300"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan nama atau email..."
          className="w-full max-w-md px-4 py-2 text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-12 text-center border bg-white/5 rounded-xl border-white/10">
          <p className="text-gray-400">
            {students.length === 0 
              ? 'Belum ada siswa terdaftar.' 
              : 'Tidak ada siswa yang cocok dengan pencarian.'}
          </p>
          {students.length === 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Pastikan tabel profiles sudah terisi data dari user yang registrasi.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-xs text-left text-gray-500">
                <th className="pb-3 font-medium">Siswa</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Topik Selesai</th>
                <th className="pb-3 font-medium">Rata-rata Skor</th>
                <th className="pb-3 font-medium">Terakhir Aktif</th>
                <th className="pb-3 font-medium">Bergabung</th>
                <th className="pb-3 font-medium"></th>
               </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
                        <span className="text-sm text-emerald-400">
                          {student.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-white">{student.full_name}</span>
                    </div>
                   </td>
                  <td className="py-3 text-sm text-gray-400">{student.email}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-emerald-400">{student.total_topics_completed}</span>
                      <span className="text-xs text-gray-500">/ 15</span>
                    </div>
                   </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${student.avg_score}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{student.avg_score}%</span>
                    </div>
                   </td>
                  <td className="py-3 text-sm text-gray-400">{formatDate(student.last_active)}</td>
                  <td className="py-3 text-sm text-gray-400">{formatDate(student.created_at)}</td>
                  <td className="py-3">
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      Detail
                    </Link>
                   </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
      )}
    </div>
  )
}