'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface Challenge {
  id: string
  topic_id: string
  topic_title: string
  module_title: string
  description: string
  starter_code: string
  required_keywords: string[]
  required_variables: string[]
  expected_output: string | null
  is_active: boolean
  created_at: string
}

interface Topic {
  id: string
  title: string
  module_id: string
  modules: { title: string }
}

export default function AdminChallengesPage() {
  const supabase = createClient()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    topic_id: '',
    description: '',
    starter_code: '',
    required_keywords: '',
    required_variables: '',
    expected_output: '',
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    
    // Load topics for dropdown
    const { data: topicsData } = await supabase
      .from('topics')
      .select('id, title, module_id, modules(title)')
      .order('module_id, order_index')
    
    setTopics(topicsData || [])
    
    // Load challenges with topic info
    const { data: challengesData } = await supabase
      .from('challenges')
      .select(`
        *,
        topics (title, module_id, modules(title))
      `)
      .order('created_at', { ascending: false })
    
    const formattedChallenges: Challenge[] = (challengesData || []).map((c: any) => ({
      id: c.id,
      topic_id: c.topic_id,
      topic_title: c.topics?.title || 'Unknown',
      module_title: c.topics?.modules?.title || 'Unknown',
      description: c.description,
      starter_code: c.starter_code,
      required_keywords: c.required_keywords || [],
      required_variables: c.required_variables || [],
      expected_output: c.expected_output || null,
      is_active: c.is_active,
      created_at: c.created_at
    }))
    
    setChallenges(formattedChallenges)
    setLoading(false)
  }

  function openCreateModal() {
    setEditingChallenge(null)
    setFormData({
      topic_id: topics[0]?.id || '',
      description: '',
      starter_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}',
      required_keywords: '',
      required_variables: '',
      expected_output: '',
      is_active: true
    })
    setIsModalOpen(true)
  }

  function openEditModal(challenge: Challenge) {
    setEditingChallenge(challenge)
    setFormData({
      topic_id: challenge.topic_id,
      description: challenge.description,
      starter_code: challenge.starter_code,
      required_keywords: challenge.required_keywords?.join(', ') || '',
      required_variables: challenge.required_variables?.join(', ') || '',
      expected_output: challenge.expected_output || '',
      is_active: challenge.is_active
    })
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!formData.topic_id || !formData.description) {
      alert('Topic dan Description wajib diisi!')
      return
    }
    
    const supabase = createClient()
    
    const payload = {
      topic_id: formData.topic_id,
      description: formData.description,
      starter_code: formData.starter_code,
      required_keywords: formData.required_keywords ? formData.required_keywords.split(',').map(k => k.trim()).filter(k => k) : [],
      required_variables: formData.required_variables ? formData.required_variables.split(',').map(v => v.trim()).filter(v => v) : [],
      expected_output: formData.expected_output || null,
      is_active: formData.is_active
    }
    
    if (editingChallenge) {
      const { error } = await supabase
        .from('challenges')
        .update(payload)
        .eq('id', editingChallenge.id)
      
      if (error) {
        alert('Gagal update challenge: ' + error.message)
      } else {
        alert('Challenge berhasil diupdate!')
        setIsModalOpen(false)
        loadData()
      }
    } else {
      const { error } = await supabase
        .from('challenges')
        .insert(payload)
      
      if (error) {
        alert('Gagal tambah challenge: ' + error.message)
      } else {
        alert('Challenge berhasil ditambahkan!')
        setIsModalOpen(false)
        loadData()
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus challenge ini?')) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Gagal hapus challenge: ' + error.message)
    } else {
      alert('Challenge berhasil dihapus!')
      loadData()
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('challenges')
      .update({ is_active: !currentStatus })
      .eq('id', id)
    
    if (error) {
      alert('Gagal update status: ' + error.message)
    } else {
      loadData()
    }
  }

  // Group challenges by module
  const challengesByModule: Record<string, Challenge[]> = {}
  challenges.forEach(challenge => {
    if (!challengesByModule[challenge.module_title]) {
      challengesByModule[challenge.module_title] = []
    }
    challengesByModule[challenge.module_title].push(challenge)
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-2 rounded-full border-purple-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
        <p className="text-[10px] font-mono tracking-[0.3em] text-purple-500 animate-pulse uppercase">Loading_Challenges...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl italic font-black leading-none tracking-tighter text-white uppercase">
            Kelola<span className="text-purple-500">_Challenges</span>
          </h1>
          <p className="text-[10px] font-mono text-gray-500 mt-2 tracking-widest uppercase italic">Manage Coding Challenges per Topic</p>
        </div>
        <button
          onClick={openCreateModal}
          className="relative px-6 py-3 overflow-hidden transition-all bg-purple-600 group rounded-xl hover:bg-purple-500 active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2 text-xs font-black tracking-widest text-white uppercase">
            <span className="text-lg">+</span> Tambah Challenge
          </span>
        </button>
      </div>

      {/* CHALLENGES LIST BY MODULE */}
      {Object.keys(challengesByModule).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-3xl bg-[#080808]">
          <div className="mb-4 text-5xl">⚡</div>
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">No Challenges Yet</h3>
          <p className="text-[10px] text-gray-500 mt-2">Create your first coding challenge for students</p>
          <button onClick={openCreateModal} className="px-6 py-2 mt-6 text-xs font-bold text-purple-400 transition-all border border-purple-500/30 rounded-xl hover:bg-purple-500/10">
            + Create Challenge
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(challengesByModule).map(([moduleTitle, moduleChallenges]) => (
            <div key={moduleTitle} className="relative">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-purple-500/80">{moduleTitle}</h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />
              </div>

              <div className="grid gap-4">
                {moduleChallenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group relative p-5 transition-all duration-300 border rounded-2xl bg-[#080808] hover:border-purple-500/40 ${
                      challenge.is_active ? 'border-white/5' : 'border-red-500/20 opacity-60'
                    }`}
                  >
                    <div className="absolute left-0 w-1 h-0 bg-purple-500 rounded-r-full group-hover:h-12 transition-all duration-300 shadow-[2px_0_15px_rgba(168,85,247,0.5)]" />

                    <div className="pl-4">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-gray-600 font-bold">[{challenge.topic_title}]</span>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full border ${
                            challenge.is_active 
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' 
                              : 'border-red-500/30 text-red-400 bg-red-500/5'
                          }`}>
                            {challenge.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleActive(challenge.id, challenge.is_active)}
                            className="p-2 text-gray-500 transition-all hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
                            title={challenge.is_active ? 'Deactivate' : 'Activate'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(challenge)}
                            className="p-2 text-gray-500 transition-all hover:text-yellow-500 hover:bg-yellow-500/10 rounded-xl"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(challenge.id)}
                            className="p-2 text-gray-500 transition-all hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-2 text-sm text-gray-300 line-clamp-2">{challenge.description}</p>

                      {/* Expected Output Badge - 🔥 BARU 🔥 */}
                      {challenge.expected_output && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            🎯 Output: "{challenge.expected_output}"
                          </span>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {challenge.required_keywords?.slice(0, 3).map((kw) => (
                          <span key={kw} className="text-[8px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {kw}
                          </span>
                        ))}
                        {challenge.required_keywords && challenge.required_keywords.length > 3 && (
                          <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
                            +{challenge.required_keywords.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-purple-600/10 to-transparent">
                <div>
                  <h2 className="text-xl italic font-black tracking-tighter uppercase">
                    {editingChallenge ? 'Edit' : 'New'}<span className="text-purple-500">_Challenge</span>
                  </h2>
                  <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Coding Challenge Configuration</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors text-[10px] font-black tracking-widest">[ Close ]</button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                {/* Pilih Topik */}
                <div>
                  <label className="block mb-2 text-[10px] font-black text-purple-500 uppercase tracking-widest">Topic *</label>
                  <select
                    value={formData.topic_id}
                    onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
                    className="w-full px-5 py-3 text-sm font-bold text-white border rounded-2xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-purple-500 transition-all"
                  >
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id} className="bg-[#0a0a0a]">
                        {topic.modules?.title} - {topic.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Challenge Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-5 py-3 text-sm text-gray-300 border rounded-2xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="Describe what students need to accomplish..."
                  />
                </div>

                {/* 🔥🔥🔥 EXPECTED OUTPUT - BARU 🔥🔥🔥 */}
                <div>
                  <label className="block mb-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    Expected Output 🎯
                  </label>
                  <input
                    type="text"
                    value={formData.expected_output}
                    onChange={(e) => setFormData({ ...formData, expected_output: e.target.value })}
                    placeholder="Contoh: LULUS atau NEGATIF atau Maret"
                    className="w-full px-5 py-3 text-sm text-white border rounded-2xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                  <p className="text-[8px] text-gray-600 mt-1">
                    Tulis output yang diharapkan dari program (akan dicek otomatis). Kosongkan jika tidak ingin dicek.
                  </p>
                </div>

                {/* Starter Code */}
                <div>
                  <label className="block mb-2 text-[10px] font-black text-purple-500/80 uppercase tracking-widest">Starter Code (C++)</label>
                  <textarea
                    value={formData.starter_code}
                    onChange={(e) => setFormData({ ...formData, starter_code: e.target.value })}
                    rows={6}
                    className="w-full px-5 py-4 font-mono text-xs transition-all border text-orange-200/70 rounded-2xl bg-black/60 border-white/5 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Required Keywords */}
                  <div>
                    <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Required Keywords</label>
                    <input
                      type="text"
                      value={formData.required_keywords}
                      onChange={(e) => setFormData({ ...formData, required_keywords: e.target.value })}
                      placeholder="if, else, for (pisahkan dengan koma)"
                      className="w-full px-5 py-3 text-xs font-mono text-white border rounded-2xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-purple-500 transition-all"
                    />
                    <p className="text-[8px] text-gray-600 mt-1">Contoh: if, else, for, while</p>
                  </div>

                  {/* Required Variables */}
                  <div>
                    <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Required Variables</label>
                    <input
                      type="text"
                      value={formData.required_variables}
                      onChange={(e) => setFormData({ ...formData, required_variables: e.target.value })}
                      placeholder="counter, total, hasil (pisahkan dengan koma)"
                      className="w-full px-5 py-3 text-xs font-mono text-white border rounded-2xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-purple-500 transition-all"
                    />
                    <p className="text-[8px] text-gray-600 mt-1">Contoh: counter, total, index</p>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 bg-transparent rounded border-white/20 checked:bg-purple-500 checked:border-purple-500"
                    />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active (Visible to Students)</span>
                  </label>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-white/5 bg-white/[0.01] flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                >
                  Save_Challenge
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}