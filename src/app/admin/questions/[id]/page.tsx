'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Topic {
  id: string
  title: string
  module_id: string
}

export default function EditQuestionPage() {
  const router = useRouter()
  const params = useParams()
  const questionId = params.id as string
  const supabase = createClient()
  
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    id: '',
    topic_id: '',
    question_text: '',
    is_active: true,
    options: [
      { id: '', label: 'A', text: '', is_correct: false },
      { id: '', label: 'B', text: '', is_correct: false },
      { id: '', label: 'C', text: '', is_correct: false },
      { id: '', label: 'D', text: '', is_correct: false },
    ]
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    
    // Load topics
    const { data: topicsData } = await supabase
      .from('topics')
      .select('id, title, module_id')
      .order('module_id, order_index')
    
    setTopics(topicsData || [])
    
    // Load question
    const { data: question } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()
    
    if (question) {
      // Load options
      const { data: options } = await supabase
        .from('question_options')
        .select('*')
        .eq('question_id', questionId)
      
      const optionsMap: Record<string, any> = {}
      options?.forEach(opt => {
        optionsMap[opt.option_label] = opt
      })
      
      setFormData({
        id: question.id,
        topic_id: question.topic_id,
        question_text: question.question_text,
        is_active: question.is_active,
        options: [
          { id: optionsMap['A']?.id || '', label: 'A', text: optionsMap['A']?.option_text || '', is_correct: optionsMap['A']?.is_correct || false },
          { id: optionsMap['B']?.id || '', label: 'B', text: optionsMap['B']?.option_text || '', is_correct: optionsMap['B']?.is_correct || false },
          { id: optionsMap['C']?.id || '', label: 'C', text: optionsMap['C']?.option_text || '', is_correct: optionsMap['C']?.is_correct || false },
          { id: optionsMap['D']?.id || '', label: 'D', text: optionsMap['D']?.option_text || '', is_correct: optionsMap['D']?.is_correct || false },
        ]
      })
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
    
    // Update question
    const { error: questionError } = await supabase
      .from('questions')
      .update({
        topic_id: formData.topic_id,
        question_text: formData.question_text,
        is_active: formData.is_active,
      })
      .eq('id', formData.id)
    
    if (questionError) {
      alert('Gagal update soal: ' + questionError.message)
      setSaving(false)
      return
    }
    
    // Update options
    for (const opt of formData.options) {
      if (opt.id) {
        // Update existing
        await supabase
          .from('question_options')
          .update({
            option_text: opt.text,
            is_correct: opt.is_correct
          })
          .eq('id', opt.id)
      } else {
        // Insert new
        await supabase
          .from('question_options')
          .insert({
            question_id: formData.id,
            option_label: opt.label,
            option_text: opt.text,
            is_correct: opt.is_correct
          })
      }
    }
    
    router.push('/admin/questions')
  }

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
          <h1 className="text-2xl font-bold tracking-tight">Edit Soal</h1>
          <p className="mt-1 text-sm text-gray-400">Ubah teks soal atau pilihan jawaban</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Status */}
        <div className="p-6 border rounded-xl bg-white/5 border-white/10">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 bg-transparent rounded border-white/20 checked:bg-emerald-500"
            />
            <span className="text-sm">Soal Aktif (akan muncul di quiz)</span>
          </label>
        </div>

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
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 text-sm font-medium transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
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