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

interface Option {
  label: string
  text: string
  is_correct: boolean
}

export default function NewQuestionPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Generate default options (start with 4 options)
  const generateDefaultOptions = (): Option[] => {
    return [
      { label: 'A', text: '', is_correct: false },
      { label: 'B', text: '', is_correct: false },
      { label: 'C', text: '', is_correct: false },
      { label: 'D', text: '', is_correct: false },
    ]
  }

  const [formData, setFormData] = useState({
    topic_id: '',
    question_text: '',
    options: generateDefaultOptions()
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

  // Fungsi untuk refresh label opsi berdasarkan index
  const refreshOptionLabels = (options: Option[]): Option[] => {
    return options.map((opt, idx) => ({
      ...opt,
      label: String.fromCharCode(65 + idx) // A, B, C, D, E...
    }))
  }

  // Tambah opsi baru
  const addOption = () => {
    if (formData.options.length >= 10) {
      alert('Maksimal 10 pilihan jawaban')
      return
    }
    const newOptions = refreshOptionLabels([
      ...formData.options,
      { label: '', text: '', is_correct: false }
    ])
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  // Hapus opsi
  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      alert('Minimal 2 pilihan jawaban')
      return
    }
    
    const isRemovingCorrect = formData.options[index].is_correct
    let newOptions = formData.options.filter((_, i) => i !== index)
    
    // Jika yang dihapus adalah jawaban benar, reset jawaban benar ke opsi pertama
    if (isRemovingCorrect && newOptions.length > 0) {
      newOptions = newOptions.map((opt, i) => ({
        ...opt,
        is_correct: i === 0
      }))
    }
    
    newOptions = refreshOptionLabels(newOptions)
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  function updateOption(index: number, text: string) {
    const newOptions = [...formData.options]
    newOptions[index].text = text
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  function setCorrectOption(index: number) {
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index
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
    
    // Filter opsi yang tidak kosong untuk validasi
    const filledOptions = formData.options.filter(opt => opt.text.trim() !== '')
    
    if (filledOptions.length < 2) {
      alert('Minimal 2 pilihan jawaban yang diisi')
      return
    }
    
    const hasCorrect = filledOptions.some(opt => opt.is_correct)
    if (!hasCorrect) {
      alert('Pilih satu jawaban yang benar')
      return
    }
    
    setSaving(true)
    
    // Get current user
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
    
    // Insert hanya opsi yang teksnya tidak kosong
    const optionsToInsert = formData.options
      .filter(opt => opt.text.trim() !== '')
      .map(opt => ({
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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-2 rounded-full border-orange-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
        <p className="text-[10px] font-mono tracking-[0.3em] text-orange-500 animate-pulse uppercase">Initializing_Editor...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-6">
        <Link
          href="/admin/questions"
          className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 text-gray-500 hover:text-orange-500 hover:border-orange-500/50 transition-all shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl italic font-black leading-none tracking-tighter text-white uppercase">
            Create<span className="text-orange-500">_Question</span>
          </h1>
          <p className="text-[10px] font-mono text-gray-500 mt-2 tracking-widest uppercase italic">Evaluation_Intelligence_Unit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pb-20 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* LEFT SIDE: CONFIGURATION */}
          <div className="space-y-6 md:col-span-1">
            <div className="p-6 border rounded-[2rem] bg-[#080808] border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-transparent opacity-30" />
              
              <div>
                <label className="block mb-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Select_Topic</label>
                <select
                  value={formData.topic_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic_id: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-bold text-white border rounded-xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
                  required
                >
                  {Object.entries(topicsByModule).map(([moduleId, moduleTopics]) => (
                    <optgroup key={moduleId} label={moduleNames[moduleId]?.toUpperCase() || moduleId.toUpperCase()} className="bg-[#0a0a0a] text-gray-500 font-mono text-[10px]">
                      {moduleTopics.map(topic => (
                        <option key={topic.id} value={topic.id} className="text-xs text-white">{topic.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] font-mono text-gray-600 uppercase leading-relaxed">
                  Tip: Pastikan setiap soal memiliki satu jawaban yang benar. Kamu bisa tambah/kurang jumlah pilihan dengan tombol + / - di bawah.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: MAIN CONTENT */}
          <div className="space-y-6 md:col-span-2">
            {/* Question Area */}
            <div className="p-8 border rounded-[2.5rem] bg-[#080808] border-white/5 shadow-2xl">
              <label className="block mb-4 text-[10px] font-black text-orange-500/80 uppercase tracking-[0.2em]">Question_Statement</label>
              <textarea
                value={formData.question_text}
                onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                rows={5}
                className="w-full px-6 py-5 text-sm font-medium text-white border rounded-[1.5rem] bg-black/40 border-white/5 focus:outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all leading-relaxed placeholder:text-gray-700"
                placeholder="Write your question here... use code snippets if necessary."
                required
              />
            </div>

            {/* Options Area */}
            <div className="p-8 border rounded-[2.5rem] bg-[#080808] border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <label className="text-[10px] font-black text-orange-500/80 uppercase tracking-[0.2em]">Response_Options</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className={`
                      w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xs transition-all duration-300 shrink-0
                      ${opt.is_correct 
                        ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]' 
                        : 'bg-white/[0.03] text-gray-600 border border-white/5'
                      }
                    `}>
                      {opt.label}
                    </div>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className="flex-1 px-6 py-3.5 text-xs font-bold text-white border rounded-2xl bg-white/[0.02] border-white/5 focus:outline-none focus:border-orange-500/30 transition-all"
                      placeholder={`Input for option ${opt.label}...`}
                    />
                    <button
                      type="button"
                      onClick={() => setCorrectOption(idx)}
                      className={`h-12 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${
                        opt.is_correct
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-white/[0.03] text-gray-500 hover:text-white border border-white/5 hover:border-white/20'
                      }`}
                    >
                      {opt.is_correct ? '✓ Correct' : '○ Mark'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="flex items-center justify-center w-12 h-12 text-red-500 transition-all border rounded-2xl bg-red-500/10 border-red-500/20 hover:bg-red-500/20 shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Info jumlah opsi */}
              <div className="mt-4 text-right">
                <p className="text-[9px] font-mono text-gray-500">
                  {formData.options.filter(o => o.text.trim()).length} / {formData.options.length} options filled
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 group relative py-5 overflow-hidden rounded-[1.5rem] bg-orange-600 transition-all hover:bg-orange-500 active:scale-95 disabled:opacity-50 shadow-[0_10px_30px_rgba(234,88,12,0.2)]"
              >
                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  {saving ? 'Syncing_Data...' : 'Deploy_Question_To_Database'}
                </span>
              </button>
              <Link
                href="/admin/questions"
                className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-[1.5rem] bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}