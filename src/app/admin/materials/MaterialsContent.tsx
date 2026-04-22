'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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

export default function MaterialsContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const topicParam = searchParams.get('topic')
  
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
    
    const { data: topicsData } = await supabase
      .from('topics')
      .select('*')
      .order('module_id, order_index')
    
    setTopics(topicsData || [])
    
    const { data: materialsData } = await supabase
      .from('materials')
      .select('*')
    
    const materialsMap = new Map()
    materialsData?.forEach(m => {
      materialsMap.set(m.topic_id, m)
    })
    setMaterials(materialsMap)
    
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
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="w-12 h-12 border-2 rounded-full border-orange-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
        <p className="text-[10px] font-mono tracking-[0.3em] text-orange-500 animate-pulse uppercase">Syncing_Content_Nodes...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      
      {/* LEFT SIDEBAR: TOPIC EXPLORER */}
      <div className="w-full space-y-4 lg:w-72 shrink-0">
        <div className="p-6 border rounded-[2rem] bg-[#080808] border-white/5 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-transparent opacity-20" />
          <h2 className="mb-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">Topic_Explorer</h2>
          
          <div className="space-y-6">
            {Object.entries(topicsByModule).map(([moduleId, moduleTopics]) => (
              <div key={moduleId} className="space-y-2">
                <div className="px-4 py-1 text-[9px] font-mono text-orange-500/50 uppercase tracking-widest border-l border-orange-500/20">
                  {moduleNames[moduleId] || moduleId}
                </div>
                <div className="space-y-1">
                  {moduleTopics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic)}
                      className={`
                        w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all group relative overflow-hidden
                        ${selectedTopic?.id === topic.id
                          ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.2)]'
                          : 'text-gray-500 hover:bg-white/[0.03] hover:text-gray-300'
                        }
                      `}
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="pr-2 truncate">{topic.title}</span>
                        {materials.has(topic.id) && (
                          <span className={`text-[10px] transition-colors ${selectedTopic?.id === topic.id ? 'text-white' : 'text-emerald-500'}`}>
                            {selectedTopic?.id === topic.id ? '●' : '✓'}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: CORE EDITOR */}
      <div className="flex-1 w-full space-y-6">
        {selectedTopic ? (
          <>
            {/* EDITOR HEADER */}
            <div className="p-6 border rounded-[2rem] bg-[#080808] border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-[9px] font-mono text-orange-500 uppercase tracking-[0.2em]">Editing_Module: {selectedTopic.module_id}</span>
                <h2 className="mt-1 text-xl italic font-black leading-none tracking-tighter text-white uppercase">{selectedTopic.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    showPreview 
                    ? 'bg-white text-black border-white' 
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {showPreview ? 'Write_Mode' : 'Preview_Mode'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-orange-600 text-white hover:bg-orange-500 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
                >
                  {saving ? 'Saving...' : 'Push_To_Cloud'}
                </button>
              </div>
            </div>

{showPreview ? (
  /* PREVIEW MODE - ANTI-OVERFLOW VERSION */
  <div className="min-w-0 flex-1 p-6 md:p-10 border rounded-[2.5rem] bg-[#080808] border-white/5 shadow-2xl relative overflow-hidden">
    {/* Penahan agar konten tidak keluar jalur */}
    <div className="absolute top-0 right-0 p-6 text-[8px] font-mono text-gray-700 uppercase tracking-widest hidden md:block">
      Render_Engine_v2.1
    </div>
    
    <div className="relative z-10 w-full overflow-x-hidden">
      <div 
        className="
          w-full
          text-gray-300 
          break-words 
          [word-break:break-word]
          [&>h2]:text-xl [&>h2]:md:text-2xl [&>h2]:font-black [&>h2]:italic [&>h2]:tracking-tighter [&>h2]:uppercase [&>h2]:text-white [&>h2]:mb-4 [&>h2]:mt-8
          [&>h3]:text-base [&>h3]:md:text-lg [&>h3]:font-bold [&>h3]:text-orange-500 [&>h3]:mb-3 [&>h3]:mt-6
          [&>p]:text-sm [&>p]:text-gray-400 [&>p]:mb-4 [&>p]:leading-relaxed
          [&>pre]:bg-black/60 [&>pre]:p-4 [&>pre]:md:p-6 [&>pre]:rounded-2xl [&>pre]:border [&>pre]:border-white/5 [&>pre]:my-6 
          [&>pre]:overflow-x-auto [&>pre]:max-w-full
          [&>pre>code]:text-[10px] [&>pre>code]:md:text-xs [&>pre>code]:font-mono [&>pre>code]:text-orange-300 [&>pre>code]:whitespace-pre-wrap [&>pre>code]:break-all
          [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-4 [&>ul]:text-sm [&>ul]:text-gray-400
        "
        dangerouslySetInnerHTML={{ __html: editContent }}
      />

      {/* Solution Section */}
      {editSolutionCode && (
        <div className="mt-12 pt-8 border-t border-white/10 border-dashed w-full overflow-hidden">
          <h3 className="mb-4 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] text-center md:text-left">
            Reference_Solution
          </h3>
          <pre className="p-4 md:p-6 overflow-x-auto rounded-[1.5rem] bg-black/80 border border-emerald-500/20 w-full">
            <code className="text-[10px] md:text-xs font-mono text-emerald-400/90 leading-relaxed whitespace-pre-wrap break-all">
              {editSolutionCode}
            </code>
          </pre>
        </div>
      )}
    </div>
  </div>
) : (
              /* EDIT MODE */
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute -top-3 left-8 px-3 py-1 bg-[#080808] border border-white/10 rounded-full z-10">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">HTML_Structure</span>
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={18}
                    className="w-full px-8 py-10 font-mono text-xs leading-loose text-gray-300 border rounded-[2.5rem] bg-[#080808] border-white/5 focus:outline-none focus:border-orange-500/30 focus:bg-black/40 transition-all shadow-inner"
                    placeholder="Enter lesson content here..."
                  />
                </div>

                <div className="relative group">
                  <div className="absolute -top-3 left-8 px-3 py-1 bg-[#080808] border border-white/10 rounded-full z-10">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Solution_Code</span>
                  </div>
                  <textarea
                    value={editSolutionCode}
                    onChange={(e) => setEditSolutionCode(e.target.value)}
                    rows={8}
                    className="w-full px-8 py-10 font-mono text-xs text-emerald-500/80 border rounded-[2.5rem] bg-[#080808] border-white/5 focus:outline-none focus:border-emerald-500/20 focus:bg-black/40 transition-all"
                    placeholder="// Paste the correct C++ solution here..."
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE */
          <div className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-6 border border-white/5">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em] animate-pulse">Select_Topic_To_Begin_Editing</p>
          </div>
        )}
      </div>
    </div>
  )
}