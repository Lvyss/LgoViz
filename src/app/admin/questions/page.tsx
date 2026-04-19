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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Soal Quiz</h1>
          <p className="mt-1 text-sm text-gray-400">Tambah, edit, atau hapus soal untuk setiap topik</p>
        </div>
        <Link
          href="/admin/questions/new"
          className="px-4 py-2 text-sm font-medium transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500"
        >
          + Tambah Soal
        </Link>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterTopic('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            filterTopic === 'all'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Semua Topik
        </button>
        {Object.entries(topicsByModule).map(([moduleId, moduleTopics]) => (
          <div key={moduleId} className="relative group">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                moduleTopics.some(t => filterTopic === t.id)
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {moduleNames[moduleId] || moduleId}
            </button>
            <div className="absolute top-full left-0 mt-1 bg-[#121218] border border-white/10 rounded-lg shadow-xl z-10 hidden group-hover:block">
              {moduleTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setFilterTopic(topic.id)}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/10"
                >
                  {topic.title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Questions Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="py-12 text-center border bg-white/5 rounded-xl border-white/10">
          <p className="text-gray-400">Belum ada soal.</p>
          <Link href="/admin/questions/new" className="inline-block mt-2 text-sm text-emerald-400 hover:underline">
            Tambah soal pertama →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-xs text-left text-gray-500">
                <th className="pb-3 font-medium">Soal</th>
                <th className="pb-3 font-medium">Topik</th>
                <th className="pb-3 font-medium">Pilihan</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3">
                    <div className="max-w-md">
                      <p className="text-sm text-white line-clamp-2">{q.question_text}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 text-xs text-gray-300 rounded-full bg-white/10">
                      {q.topic_title}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-400">{q.options_count} option</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleActive(q.id, q.is_active)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        q.is_active
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {q.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/questions/${q.id}`}
                        className="p-1.5 text-gray-400 hover:text-emerald-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
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
  )
}