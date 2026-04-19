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
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 rounded-full border-emerald-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Topik</h1>
          <p className="mt-1 text-sm text-gray-400">Tambah, edit, atau hapus topik pembelajaran</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-sm font-medium transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500"
        >
          + Tambah Topik
        </button>
      </div>

      {/* Topics List */}
      {Object.entries(topicsByModule).map(([moduleTitle, moduleTopics]) => (
        <div key={moduleTitle} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-300">{moduleTitle}</h2>
          <div className="space-y-2">
            {moduleTopics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between p-4 transition-colors border rounded-xl bg-white/5 border-white/10 hover:bg-white/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-xs text-gray-500">#{topic.order_index}</span>
                    <h3 className="font-medium text-white">{topic.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                      {topic.id}
                    </span>
                  </div>
                  <p className="mt-1 ml-8 text-sm text-gray-400 line-clamp-1">
                    {topic.description || 'Tidak ada deskripsi'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/materials?topic=${topic.id}`}
                    className="p-2 text-gray-400 transition-colors hover:text-emerald-400"
                    title="Edit Materi"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => openEditModal(topic)}
                    className="p-2 text-gray-400 transition-colors hover:text-blue-400"
                    title="Edit Topik"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="p-2 text-gray-400 transition-colors hover:text-red-400"
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#121218] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">
                {editingTopic ? 'Edit Topik' : 'Tambah Topik Baru'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* ID Topik (hanya untuk create) */}
              {!editingTopic && (
                <div>
                  <label className="block mb-2 text-sm font-medium">ID Topik (slug)</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="contoh: if-tunggal"
                    className="w-full px-4 py-2 text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Digunakan untuk URL, gunakan huruf kecil dan tanda hubung</p>
                </div>
              )}
              
              {/* Judul Topik */}
              <div>
                <label className="block mb-2 text-sm font-medium">Judul Topik *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: If Tunggal"
                  className="w-full px-4 py-2 text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              {/* Modul */}
              <div>
                <label className="block mb-2 text-sm font-medium">Modul *</label>
                <select
                  value={formData.module_id}
                  onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                  className="w-full px-4 py-2 text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
                >
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>{module.title}</option>
                  ))}
                </select>
              </div>
              
              {/* Urutan */}
              <div>
                <label className="block mb-2 text-sm font-medium">Urutan</label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  className="w-32 px-4 py-2 text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              {/* Deskripsi */}
              <div>
                <label className="block mb-2 text-sm font-medium">Deskripsi Singkat</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
                  placeholder="Deskripsi singkat tentang topik ini..."
                />
              </div>
              
              {/* Starter Code */}
              <div>
                <label className="block mb-2 text-sm font-medium">Starter Code (C++)</label>
                <textarea
                  value={formData.starter_code}
                  onChange={(e) => setFormData({ ...formData, starter_code: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 font-mono text-sm text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
                  placeholder="#include <iostream>&#10;using namespace std;&#10;&#10;int main() {&#10;    // kode di sini&#10;    return 0;&#10;}"
                />
                <p className="mt-1 text-xs text-gray-500">Kode awal yang akan muncul di editor</p>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-white/10">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500"
              >
                Simpan
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium transition-colors rounded-lg bg-white/10 hover:bg-white/20"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}