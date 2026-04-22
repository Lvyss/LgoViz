'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Topic {
  id: string
  title: string
  description: string
  module_id: string
  module_title: string
  order_index: number
  starter_code: string | null
}

interface Module {
  id: string
  title: string
}

export default function AdminTopicsPage() {
  const supabase = createClient()
  const [topics, setTopics] = useState<Topic[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    module_id: '',
    order_index: 0,
    starter_code: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    
    // Load modules
    const { data: modulesData } = await supabase
      .from('modules')
      .select('id, title')
      .order('order_index')
    
    setModules(modulesData || [])
    
    // Load topics with module info
    const { data: topicsData } = await supabase
      .from('topics')
      .select(`
        *,
        modules (title)
      `)
      .order('module_id', { ascending: true })
      .order('order_index', { ascending: true })
    
    const formattedTopics: Topic[] = (topicsData || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      module_id: t.module_id,
      module_title: t.modules?.title || t.module_id,
      order_index: t.order_index,
      starter_code: t.starter_code
    }))
    
    setTopics(formattedTopics)
    setLoading(false)
  }

  function openCreateModal() {
    setEditingTopic(null)
    setFormData({
      id: '',
      title: '',
      description: '',
      module_id: modules[0]?.id || '',
      order_index: topics.length + 1,
      starter_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}'
    })
    setIsModalOpen(true)
  }

  function openEditModal(topic: Topic) {
    setEditingTopic(topic)
    setFormData({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      module_id: topic.module_id,
      order_index: topic.order_index,
      starter_code: topic.starter_code || ''
    })
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!formData.title || !formData.module_id) {
      alert('Judul topik dan modul harus diisi')
      return
    }
    
    const supabase = createClient()
    
    if (editingTopic) {
      // Update existing topic
      const { error } = await supabase
        .from('topics')
        .update({
          title: formData.title,
          description: formData.description,
          module_id: formData.module_id,
          order_index: formData.order_index,
          starter_code: formData.starter_code
        })
        .eq('id', formData.id)
      
      if (error) {
        alert('Gagal update topik: ' + error.message)
      } else {
        alert('Topik berhasil diupdate!')
        setIsModalOpen(false)
        loadData()
      }
    } else {
      // Create new topic
      const topicId = formData.id || formData.title.toLowerCase().replace(/\s+/g, '-')
      
      const { error } = await supabase
        .from('topics')
        .insert({
          id: topicId,
          title: formData.title,
          description: formData.description,
          module_id: formData.module_id,
          order_index: formData.order_index,
          starter_code: formData.starter_code
        })
      
      if (error) {
        alert('Gagal tambah topik: ' + error.message)
      } else {
        alert('Topik berhasil ditambahkan!')
        setIsModalOpen(false)
        loadData()
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus topik ini? Semua soal dan materi terkait juga akan terhapus.')) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Gagal hapus topik: ' + error.message)
    } else {
      alert('Topik berhasil dihapus!')
      loadData()
    }
  }

  // Group topics by module
  const topicsByModule: Record<string, Topic[]> = {}
  topics.forEach(topic => {
    if (!topicsByModule[topic.module_title]) {
      topicsByModule[topic.module_title] = []
    }
    topicsByModule[topic.module_title].push(topic)
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-2 rounded-full border-orange-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
        <p className="text-[10px] font-mono tracking-[0.3em] text-orange-500 animate-pulse uppercase">Fetching_Modules...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl italic font-black leading-none tracking-tighter text-white uppercase">
            Kelola<span className="text-orange-500">_Topik</span>
          </h1>
          <p className="text-[10px] font-mono text-gray-500 mt-2 tracking-widest uppercase italic">Curriculum_Structure_Management</p>
        </div>
        <button
          onClick={openCreateModal}
          className="relative px-6 py-3 overflow-hidden transition-all bg-orange-600 group rounded-xl hover:bg-orange-500 active:scale-95"
        >
          <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-400/20 to-transparent group-hover:opacity-100" />
          <span className="relative z-10 flex items-center gap-2 text-xs font-black tracking-widest text-white uppercase">
            <span className="text-lg">+</span> Tambah Topik
          </span>
        </button>
      </div>

      {/* TOPICS LIST BY MODULE */}
      <div className="space-y-12">
        {Object.entries(topicsByModule).map(([moduleTitle, moduleTopics]) => (
          <div key={moduleTitle} className="relative">
            {/* Module Title with Molten Line */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-orange-500/80">{moduleTitle}</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-orange-500/20 to-transparent" />
            </div>

            <div className="grid gap-3">
              {moduleTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="group relative flex items-center justify-between p-5 transition-all duration-300 border border-white/5 rounded-2xl bg-[#080808] hover:border-orange-500/30 hover:bg-[#0c0c0c]"
                >
                   {/* Left Ember Indicator (Hover) */}
                   <div className="absolute left-0 w-1 h-0 bg-orange-500 rounded-r-full group-hover:h-8 transition-all duration-300 shadow-[2px_0_10px_rgba(249,115,22,0.5)]" />

                  <div className="flex-1 pl-4">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-gray-600 font-bold tracking-tighter">[{topic.order_index.toString().padStart(2, '0')}]</span>
                      <h3 className="text-sm font-bold tracking-wide text-white uppercase transition-colors group-hover:text-orange-400">{topic.title}</h3>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] text-gray-500 group-hover:border-orange-500/20 group-hover:text-orange-500/50 transition-all">
                        {topic.id}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-500 line-clamp-1 font-medium italic opacity-70 group-hover:opacity-100 transition-opacity">
                      {topic.description || 'System.null_description'}
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/materials?topic=${topic.id}`}
                      className="p-2.5 text-gray-500 hover:text-emerald-400 transition-all hover:bg-emerald-500/10 rounded-xl"
                      title="Edit Materi"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => openEditModal(topic)}
                      className="p-2.5 text-gray-500 hover:text-yellow-500 transition-all hover:bg-yellow-500/10 rounded-xl"
                      title="Edit Topik"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(topic.id)}
                      className="p-2.5 text-gray-500 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-xl"
                      title="Hapus Topik"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL FORM: REDESIGNED */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-8 border-b border-white/5 bg-gradient-to-r from-orange-600/10 to-transparent">
              <div>
                <h2 className="text-xl italic font-black tracking-tighter uppercase">
                  {editingTopic ? 'Edit' : 'New'}<span className="text-orange-500">_Topic</span>
                </h2>
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Configuration_Panel</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">[ Close ]</button>
            </div>
            
            {/* Content Modal */}
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {!editingTopic && (
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">ID_Slug</label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      placeholder="contoh: array-1d"
                      className="w-full px-5 py-3 text-xs text-white border rounded-2xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-orange-500 focus:bg-white/[0.05] transition-all font-mono"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Topic_Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-5 py-3 text-xs font-bold text-white border rounded-2xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-orange-500 transition-all uppercase tracking-wide"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Module_Select *</label>
                  <select
                    value={formData.module_id}
                    onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                    className="w-full px-5 py-3 text-xs font-bold text-white border rounded-2xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-orange-500 transition-all appearance-none"
                  >
                    {modules.map((module) => (
                      <option key={module.id} value={module.id} className="bg-[#0a0a0a]">{module.title.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Order_Index</label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  className="w-24 px-5 py-3 text-xs font-mono text-white border rounded-2xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Summary_Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-5 py-3 text-xs text-gray-400 border rounded-2xl bg-white/[0.02] border-white/10 focus:outline-none focus:border-orange-500 transition-all italic"
                  placeholder="Explain what students will learn..."
                />
              </div>
              
              <div>
                <label className="block mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-orange-500/80">Starter_Code_C++</label>
                <textarea
                  value={formData.starter_code}
                  onChange={(e) => setFormData({ ...formData, starter_code: e.target.value })}
                  rows={6}
                  className="w-full px-5 py-4 font-mono text-[11px] text-orange-200/70 border rounded-2xl bg-black/60 border-white/5 focus:outline-none focus:border-orange-500 transition-all shadow-inner"
                />
              </div>
            </div>
            
            {/* Footer Modal Actions */}
            <div className="p-8 border-t border-white/5 bg-white/[0.01] flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-95 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
              >
                Sync_&_Save_Changes
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}