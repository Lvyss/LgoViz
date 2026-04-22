'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Question {
  id: string
  question_text: string
  topic_id: string
  topic_title: string
  is_active: boolean
  order_index: number
  options_count: number
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [topics, setTopics] = useState<{ id: string; title: string; module_id: string }[]>([])
  const [filterTopic, setFilterTopic] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [filterTopic])

  async function loadData() {
    setLoading(true)
    
    // Load topics for filter
    const { data: topicsData } = await supabase
      .from('topics')
      .select('id, title, module_id')
      .order('module_id, order_index')
    
    setTopics(topicsData || [])
    
    // Load questions
    let query = supabase
      .from('questions')
      .select(`
        id,
        question_text,
        topic_id,
        is_active,
        order_index,
        topics (title)
      `)
    
    if (filterTopic !== 'all') {
      query = query.eq('topic_id', filterTopic)
    }
    
    const { data: questionsData } = await query.order('created_at', { ascending: false })
    
    // Get options count for each question
    const questionsWithOptions = await Promise.all(
      (questionsData || []).map(async (q: any) => {
        const { count } = await supabase
          .from('question_options')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', q.id)
        
        return {
          id: q.id,
          question_text: q.question_text,
          topic_id: q.topic_id,
          topic_title: q.topics?.title || 'Unknown',
          is_active: q.is_active,
          order_index: q.order_index,
          options_count: count || 0
        }
      })
    )
    
    setQuestions(questionsWithOptions)
    setLoading(false)
  }

  async function deleteQuestion(id: string) {
    if (!confirm('Yakin ingin menghapus soal ini? Semua pilihan jawaban juga akan terhapus.')) return
    
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Gagal menghapus soal: ' + error.message)
    } else {
      loadData()
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('questions')
      .update({ is_active: !currentStatus })
      .eq('id', id)
    
    if (error) {
      alert('Gagal mengupdate status: ' + error.message)
    } else {
      loadData()
    }
  }

  // Group topics by module
  const topicsByModule: Record<string, { id: string; title: string }[]> = {}
  topics.forEach(topic => {
    if (!topicsByModule[topic.module_id]) {
      topicsByModule[topic.module_id] = []
    }
    topicsByModule[topic.module_id].push({ id: topic.id, title: topic.title })
  })

  const moduleNames: Record<string, string> = {
    percabangan: '🔀 Percabangan',
    perulangan: '🔄 Perulangan',
    'struktur-data': '📊 Struktur Data'
  }

 if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-2 rounded-full border-orange-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
        <p className="text-[10px] font-mono tracking-[0.3em] text-orange-500 animate-pulse uppercase">Scanning_Question_Bank...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl italic font-black leading-none tracking-tighter text-white uppercase">
            Quiz<span className="text-orange-500">_Bank</span>
          </h1>
          <p className="text-[10px] font-mono text-gray-500 mt-2 tracking-widest uppercase italic">Evaluation_System_Management</p>
        </div>
        <Link
          href="/admin/questions/new"
          className="relative px-6 py-3 overflow-hidden text-center transition-all bg-orange-600 group rounded-xl hover:bg-orange-500 active:scale-95"
        >
          <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-400/20 to-transparent group-hover:opacity-100" />
          <span className="relative z-10 flex items-center justify-center gap-2 text-xs font-black tracking-widest text-white uppercase">
            <span className="text-lg">+</span> Tambah Soal
          </span>
        </Link>
      </div>

      {/* FILTER CHIPS SECTION */}
      <div className="p-1.5 rounded-[2rem] bg-[#080808] border border-white/5 inline-flex flex-wrap gap-2">
        <button
          onClick={() => setFilterTopic('all')}
          className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
            filterTopic === 'all'
              ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          All_Topics
        </button>
        {Object.entries(topicsByModule).map(([moduleId, moduleTopics]) => (
          <div key={moduleId} className="relative group">
            <button
              className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                moduleTopics.some(t => filterTopic === t.id)
                  ? 'bg-white/10 text-orange-400 border border-orange-500/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {moduleNames[moduleId] || moduleId}
              <span className="text-[8px] opacity-40">▼</span>
            </button>
            
            {/* Dropdown Styled */}
            <div className="absolute top-full left-0 mt-3 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 hidden group-hover:block min-w-[200px] overflow-hidden backdrop-blur-xl">
              {moduleTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setFilterTopic(topic.id)}
                  className={`block w-full px-5 py-3 text-[10px] font-bold text-left uppercase tracking-tighter transition-colors ${
                    filterTopic === topic.id ? 'text-orange-500 bg-orange-500/5' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {topic.title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* QUESTIONS TABLE: MOLTEN STYLE */}
      <div className="rounded-[2.5rem] border border-white/5 bg-[#080808] overflow-hidden shadow-2xl">
        {questions.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-4 text-4xl opacity-20">📂</div>
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">No_Questions_Found_In_This_Sector</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Question_Content</th>
                  <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Classification</th>
                  <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Options</th>
                  <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {questions.map((q) => (
                  <tr key={q.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="max-w-md">
                        <p className="text-xs font-bold leading-relaxed transition-colors text-white/90 group-hover:text-white line-clamp-2">
                          {q.question_text}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-[9px] font-black px-3 py-1 rounded-full border border-orange-500/10 bg-orange-500/5 text-orange-500/70 uppercase tracking-widest">
                        {q.topic_title}
                      </span>
                    </td>
                    <td className="px-6 py-6 font-mono text-[10px] text-gray-500">
                      {q.options_count.toString().padStart(2, '0')} <span className="opacity-30">PTS</span>
                    </td>
                    <td className="px-6 py-6">
                      <button
                        onClick={() => toggleActive(q.id, q.is_active)}
                        className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${
                          q.is_active
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                      >
                        {q.is_active ? '● Active' : '○ Disabled'}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/questions/${q.id}`}
                          className="p-2.5 text-gray-600 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
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