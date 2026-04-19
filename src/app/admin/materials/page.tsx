'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'  // ← Tambah ini
import { createClient } from '@/lib/supabase/client'

interface Topic {
  id: string
  title: string
  module_id: string
  order_index: number
}

interface Material {
  id: string
  topic_id: string
  content: string
  solution_code: string | null
  updated_at: string
}

export default function AdminMaterialsPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()  // ← Ambil parameter dari URL
  const topicParam = searchParams.get('topic')  // ← Ambil value 'topic' dari URL
  
  const [topics, setTopics] = useState<Topic[]>([])
  const [materials, setMaterials] = useState<Map<string, Material>>(new Map())
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editSolutionCode, setEditSolutionCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  // 🔥 INI YANG DITAMBAH: Auto-select topic dari URL parameter
  useEffect(() => {
    if (topicParam && topics.length > 0) {
      const targetTopic = topics.find(t => t.id === topicParam)
      if (targetTopic) {
        handleTopicSelect(targetTopic)
      }
    }
  }, [topicParam, topics])

  async function loadData() {
    setLoading(true)
    
    // Load all topics
    const { data: topicsData } = await supabase
      .from('topics')
      .select('*')
      .order('module_id, order_index')
    
    setTopics(topicsData || [])
    
    // Load all materials
    const { data: materialsData } = await supabase
      .from('materials')
      .select('*')
    
    const materialsMap = new Map()
    materialsData?.forEach(m => {
      materialsMap.set(m.topic_id, m)
    })
    setMaterials(materialsMap)
    
    // Select first topic by default (kalo ga ada topicParam)
    if (topicsData && topicsData.length > 0 && !topicParam) {
      const firstTopic = topicsData[0]
      setSelectedTopic(firstTopic)
      const material = materialsMap.get(firstTopic.id)
      setEditContent(material?.content || generateDefaultContent(firstTopic.title))
      setEditSolutionCode(material?.solution_code || '')
    }
    
    setLoading(false)
  }

  function generateDefaultContent(topicTitle: string): string {
    return `<h2>${topicTitle}</h2>
<p>Penjelasan tentang ${topicTitle} dalam pemrograman C++.</p>
<h3>Contoh Kode:</h3>
<pre><code>// Contoh kode untuk ${topicTitle}
#include &lt;iostream&gt;
using namespace std;

int main() {
    // Tulis kode contoh di sini
    return 0;
}
</code></pre>
<h3>Penjelasan:</h3>
<p>Jelaskan bagaimana kode tersebut bekerja.</p>`
  }

  async function handleTopicSelect(topic: Topic) {
    setSelectedTopic(topic)
    const material = materials.get(topic.id)
    setEditContent(material?.content || generateDefaultContent(topic.title))
    setEditSolutionCode(material?.solution_code || '')
    setShowPreview(false)
  }

  async function handleSave() {
    if (!selectedTopic) return
    
    setSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    const existingMaterial = materials.get(selectedTopic.id)
    
    if (existingMaterial) {
      // Update existing
      const { error } = await supabase
        .from('materials')
        .update({
          content: editContent,
          solution_code: editSolutionCode || null,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', existingMaterial.id)
      
      if (error) {
        alert('Gagal menyimpan: ' + error.message)
      } else {
        alert('Materi berhasil disimpan!')
        loadData()
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('materials')
        .insert({
          topic_id: selectedTopic.id,
          content: editContent,
          solution_code: editSolutionCode || null,
          updated_by: user?.id
        })
      
      if (error) {
        alert('Gagal menyimpan: ' + error.message)
      } else {
        alert('Materi berhasil disimpan!')
        loadData()
      }
    }
    
    setSaving(false)
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Kelola Materi</h1>
        <p className="mt-1 text-sm text-gray-400">Edit konten pembelajaran untuk setiap topik</p>
        {topicParam && (
          <p className="mt-2 text-xs text-emerald-400">
            Sedang mengedit materi untuk topik yang dipilih dari halaman Topik
          </p>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Topics */}
        <div className="w-64 shrink-0">
          <div className="sticky top-8">
            <h2 className="mb-3 text-sm font-medium text-gray-400">Daftar Topik</h2>
            <div className="space-y-1">
              {Object.entries(topicsByModule).map(([moduleId, moduleTopics]) => (
                <div key={moduleId} className="mb-3">
                  <div className="px-3 py-2 text-xs text-gray-500">
                    {moduleNames[moduleId] || moduleId}
                  </div>
                  {moduleTopics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                        ${selectedTopic?.id === topic.id
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>{topic.title}</span>
                        {materials.has(topic.id) && (
                          <span className="text-xs text-emerald-400">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 space-y-6">
          {selectedTopic && (
            <>
              {/* Topic Header */}
              <div className="p-4 border rounded-xl bg-white/5 border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedTopic.title}</h2>
                    <p className="text-sm text-gray-500">
                      Module: {moduleNames[selectedTopic.module_id] || selectedTopic.module_id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {showPreview ? 'Edit' : 'Preview'}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </div>
              </div>

              {showPreview ? (
                // Preview Mode
                <div className="p-6 border rounded-xl bg-white/5 border-white/10">
                  <h3 className="mb-3 text-sm font-medium text-gray-400">Preview Materi</h3>
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: editContent }}
                  />
                  {editSolutionCode && (
                    <div className="mt-6">
                      <h3 className="mb-3 text-sm font-medium text-gray-400">Kode Solusi</h3>
                      <pre className="p-4 overflow-x-auto rounded-lg bg-black/50">
                        <code className="text-sm text-emerald-400">{editSolutionCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode
                <>
                  {/* Content Editor */}
                  <div className="p-6 border rounded-xl bg-white/5 border-white/10">
                    <label className="block mb-3 text-sm font-medium">
                      Konten Materi (HTML)
                    </label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={15}
                      className="w-full px-4 py-3 font-mono text-sm text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
                      placeholder="Tulis materi dalam format HTML..."
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Gunakan tag HTML: &lt;h2&gt;, &lt;p&gt;, &lt;pre&gt;&lt;code&gt;, dll.
                    </p>
                  </div>

                  {/* Solution Code Editor */}
                  <div className="p-6 border rounded-xl bg-white/5 border-white/10">
                    <label className="block mb-3 text-sm font-medium">
                      Kode Solusi (opsional)
                    </label>
                    <textarea
                      value={editSolutionCode}
                      onChange={(e) => setEditSolutionCode(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 font-mono text-sm text-white border rounded-lg bg-black/50 border-white/10 focus:outline-none focus:border-emerald-500"
                      placeholder="#include <iostream>&#10;using namespace std;&#10;&#10;int main() {&#10;    // Kode solusi&#10;    return 0;&#10;}"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Kode contoh yang akan ditampilkan di modal materi.
                    </p>
                  </div>

                  {/* HTML Help */}
                  <div className="p-4 border rounded-xl bg-white/5 border-white/10">
                    <details className="text-sm">
                      <summary className="text-gray-400 cursor-pointer hover:text-white">
                        📖 Panduan Format HTML
                      </summary>
                      <div className="mt-3 space-y-2 text-gray-400">
                        <p><code className="text-emerald-400">&lt;h2&gt;Judul&lt;/h2&gt;</code> - Untuk subbab</p>
                        <p><code className="text-emerald-400">&lt;p&gt;Teks paragraf&lt;/p&gt;</code> - Untuk paragraf</p>
                        <p><code className="text-emerald-400">&lt;pre&gt;&lt;code&gt;kode&lt;/code&gt;&lt;/pre&gt;</code> - Untuk menampilkan kode</p>
                        <p><code className="text-emerald-400">&lt;ul&gt;&lt;li&gt;item&lt;/li&gt;&lt;/ul&gt;</code> - Untuk daftar bullet</p>
                        <p><code className="text-emerald-400">&lt;strong&gt;teks tebal&lt;/strong&gt;</code> - Untuk teks tebal</p>
                      </div>
                    </details>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}