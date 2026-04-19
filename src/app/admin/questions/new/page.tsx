'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Topic {
  id: string
  title: string
  module_id: string
}

export default function NewQuestionPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    topic_id: '',
    question_text: '',
    options: [
      { label: 'A', text: '', is_correct: false },
      { label: 'B', text: '', is_correct: false },
      { label: 'C', text: '', is_correct: false },
      { label: 'D', text: '', is_correct: false },
    ]
  })

  useEffect(() => {
    loadTopics()
  }, [])

  async function loadTopics() {
    setLoading(true)
    const { data } = await supabase
      .from('topics')
      .select('id, title, module_id')
      .order('module_id, order_index')
    
    setTopics(data || [])
    if (data && data.length > 0) {
      setFormData(prev => ({ ...prev, topic_id: data[0].id }))
    }
    setLoading(false)
  }

  function updateOption(index: number, text: string) {
    const newOptions = [...formData.options]
    newOptions[index].text = text
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  function setCorrectOption(label: string) {
    const newOptions = formData.options.map(opt => ({
      ...opt,
      is_correct: opt.label === label
    }))
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.topic_id) {
      alert('Pilih topik terlebih dahulu')
      return
    }
    
    if (!formData.question_text.trim()) {
      alert('Masukkan teks soal')
      return
    }
    
    const hasEmptyOption = formData.options.some(opt => !opt.text.trim())
    if (hasEmptyOption) {
      alert('Isi semua pilihan jawaban')
      return
    }
    
    const hasCorrect = formData.options.some(opt => opt.is_correct)
    if (!hasCorrect) {
      alert('Pilih satu jawaban yang benar')
      return
    }
    
    setSaving(true)
    
    // Get current user for created_by
    const { data: { user } } = await supabase.auth.getUser()
    
    // Insert question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        topic_id: formData.topic_id,
        question_text: formData.question_text,
        is_active: true,
        created_by: user?.id
      })
      .select()
      .single()
    
    if (questionError) {
      alert('Gagal menyimpan soal: ' + questionError.message)
      setSaving(false)
      return
    }
    
    // Insert options
    const optionsToInsert = formData.options.map(opt => ({
      question_id: question.id,
      option_label: opt.label,
      option_text: opt.text,
      is_correct: opt.is_correct
    }))
    
    const { error: optionsError } = await supabase
      .from('question_options')
      .insert(optionsToInsert)
    
    if (optionsError) {
      alert('Gagal menyimpan pilihan jawaban: ' + optionsError.message)
      setSaving(false)
      return
    }
    
    router.push('/admin/questions')
  }

  // Group topics by module
  const topicsByModule: Record<string, Topic[]> = {}
  topics.forEach(topic => {
    if (!topicsByModule[topic.module_id]) {
      topicsByModule[topic.module_id] = []
    }
    topicsByModule[topic.module_id].push(topic)
  })

  const moduleNames: Record<string, string> = {
    percabangan: '🔀 Percabangan',
    perulangan: '🔄 Perulangan',
    'struktur-data': '📊 Struktur Data'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/questions"
          className="p-2 text-gray-400 transition-colors hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Soal Baru</h1>
          <p className="mt-1 text-sm text-gray-400">Buat soal pilihan ganda untuk quiz</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Pilih Topik */}
        <div className="p-6 border rounded-xl bg-white/5 border-white/10">
          <label className="block mb-2 text-sm font-medium">Pilih Topik</label>
          <select
            value={formData.topic_id}
            onChange={(e) => setFormData(prev => ({ ...prev, topic_id: e.target.value }))}
            className="w-full px-4 py-2 text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
            required
          >
            {Object.entries(topicsByModule).map(([moduleId, moduleTopics]) => (
              <optgroup key={moduleId} label={moduleNames[moduleId] || moduleId}>
                {moduleTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Teks Soal */}
        <div className="p-6 border rounded-xl bg-white/5 border-white/10">
          <label className="block mb-2 text-sm font-medium">Teks Soal</label>
          <textarea
            value={formData.question_text}
            onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
            placeholder="Contoh: Apa output dari kode berikut?&#10;int x = 5;&#10;if(x > 3) { cout << 'Yes'; }"
            required
          />
        </div>

        {/* Pilihan Jawaban */}
        <div className="p-6 border rounded-xl bg-white/5 border-white/10">
          <label className="block mb-4 text-sm font-medium">Pilihan Jawaban</label>
          <div className="space-y-3">
            {formData.options.map((opt, idx) => (
              <div key={opt.label} className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm
                  ${opt.is_correct 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-white/10 text-gray-400'
                  }
                `}>
                  {opt.label}
                </div>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  className="flex-1 px-4 py-2 text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
                  placeholder={`Pilihan ${opt.label}`}
                />
                <button
                  type="button"
                  onClick={() => setCorrectOption(opt.label)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    opt.is_correct
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {opt.is_correct ? '✓ Benar' : 'Jadikan Benar'}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Pilih satu jawaban yang benar dengan mengklik tombol "Jadikan Benar"
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 text-sm font-medium transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Soal'}
          </button>
          <Link
            href="/admin/questions"
            className="px-6 py-2 text-sm font-medium transition-colors rounded-lg bg-white/10 hover:bg-white/20"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}