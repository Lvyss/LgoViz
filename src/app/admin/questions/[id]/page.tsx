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

interface Option {
  id: string
  label: string
  text: string
  is_correct: boolean
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
    options: [] as Option[]
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
        .order('option_label')
      
      if (options && options.length > 0) {
        setFormData({
          id: question.id,
          topic_id: question.topic_id,
          question_text: question.question_text,
          is_active: question.is_active,
          options: options.map(opt => ({
            id: opt.id,
            label: opt.option_label,
            text: opt.option_text,
            is_correct: opt.is_correct
          }))
        })
      } else {
        // Fallback ke default 4 opsi
        setFormData({
          id: question.id,
          topic_id: question.topic_id,
          question_text: question.question_text,
          is_active: question.is_active,
          options: [
            { id: '', label: 'A', text: '', is_correct: false },
            { id: '', label: 'B', text: '', is_correct: false },
            { id: '', label: 'C', text: '', is_correct: false },
            { id: '', label: 'D', text: '', is_correct: false },
          ]
        })
      }
    }
    
    setLoading(false)
  }

  // Fungsi refresh label otomatis
  const refreshOptionLabels = (options: Option[]): Option[] => {
    return options.map((opt, idx) => ({
      ...opt,
      label: String.fromCharCode(65 + idx) // A, B, C, D...
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
      { id: '', label: '', text: '', is_correct: false }
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
    
    // Jika yang dihapus adalah jawaban benar, reset ke opsi pertama
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
    
    if (!formData.question_text.trim()) {
      alert('Masukkan teks soal')
      return
    }
    
    // Filter opsi yang tidak kosong
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
    
    // Update question
    const { error: questionError } = await supabase
      .from('questions')
      .update({
        topic_id: formData.topic_id,
        question_text: formData.question_text,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', formData.id)
    
    if (questionError) {
      alert('Gagal update soal: ' + questionError.message)
      setSaving(false)
      return
    }
    
    // Dapatkan semua option IDs yang ada di DB
    const { data: existingOptions } = await supabase
      .from('question_options')
      .select('id, option_label')
      .eq('question_id', formData.id)
    
    const existingIds = new Set(existingOptions?.map(opt => opt.id) || [])
    const keptIds = new Set<string>()
    
    // Update atau insert options
    for (const opt of formData.options) {
      // Skip option yang kosong
      if (!opt.text.trim()) continue
      
      if (opt.id && existingIds.has(opt.id)) {
        // Update existing
        await supabase
          .from('question_options')
          .update({
            option_label: opt.label,
            option_text: opt.text,
            is_correct: opt.is_correct
          })
          .eq('id', opt.id)
        keptIds.add(opt.id)
      } else {
        // Insert new (tanpa id)
        const { error: insertError } = await supabase
          .from('question_options')
          .insert({
            question_id: formData.id,
            option_label: opt.label,
            option_text: opt.text,
            is_correct: opt.is_correct
          })
        
        if (insertError) {
          console.error('Insert error:', insertError)
          alert(`Gagal menyimpan opsi ${opt.label}: ${insertError.message}`)
          setSaving(false)
          return
        }
      }
    }
    
    // Hapus option yang tidak ada di form (sudah dihapus user)
    const toDelete = Array.from(existingIds).filter(id => !keptIds.has(id))
    if (toDelete.length > 0) {
      await supabase
        .from('question_options')
        .delete()
        .in('id', toDelete)
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
        <p className="text-[10px] font-mono tracking-[0.3em] text-orange-500 animate-pulse uppercase">Retrieving_Data_Packet...</p>
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
            Modify<span className="text-orange-500">_Question</span>
          </h1>
          <p className="text-[10px] font-mono text-gray-500 mt-2 tracking-widest uppercase italic">Edit_Mode_Active_ID: {questionId.slice(0, 8)}...</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pb-20 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* LEFT SIDE: CONTROL PANEL */}
          <div className="space-y-6 md:col-span-1">
            <div className="p-6 border rounded-[2rem] bg-[#080808] border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-transparent opacity-30" />
              
              {/* Toggle Status */}
              <div>
                <label className="block mb-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Deployment_Status</label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                    formData.is_active 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {formData.is_active ? '● Active' : '○ Inactive'}
                  </span>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${formData.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </button>
              </div>

              {/* Select Topic */}
              <div>
                <label className="block mb-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Reclassify_Topic</label>
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

              {/* Info jumlah opsi */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] font-mono text-gray-500 uppercase leading-relaxed">
                  Total Options: {formData.options.filter(o => o.text.trim()).length} / {formData.options.length}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: EDITOR */}
          <div className="space-y-6 md:col-span-2">
            {/* Question Textarea */}
            <div className="p-8 border rounded-[2.5rem] bg-[#080808] border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-orange-500/80 uppercase tracking-[0.2em]">Source_Content</label>
                <button
                  type="button"
                  onClick={addOption}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                >
                  + Add Option
                </button>
              </div>
              <textarea
                value={formData.question_text}
                onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                rows={4}
                className="w-full px-6 py-5 text-sm font-medium text-white border rounded-[1.5rem] bg-black/40 border-white/5 focus:outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all leading-relaxed"
                required
              />
            </div>

            {/* Options Management */}
            <div className="p-8 border rounded-[2.5rem] bg-[#080808] border-white/5 shadow-2xl">
              <label className="block mb-6 text-[10px] font-black text-orange-500/80 uppercase tracking-[0.2em]">Response_Variants</label>
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
                      placeholder={`Edit option ${opt.label}...`}
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
            </div>

            {/* FORM ACTIONS */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 group relative py-5 overflow-hidden rounded-[1.5rem] bg-orange-600 transition-all hover:bg-orange-500 active:scale-95 disabled:opacity-50 shadow-[0_10px_30px_rgba(234,88,12,0.2)]"
              >
                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  {saving ? 'Updating_Core...' : 'Commit_Changes_To_System'}
                </span>
              </button>
              <Link
                href="/admin/questions"
                className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-[1.5rem] bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5"
              >
                Discard
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}