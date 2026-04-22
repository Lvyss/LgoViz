'use client'

import { useState, useEffect, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getTopicsByModule, getMaterialByTopic, getUserProgressForTopic, getUserProgress } from '@/lib/supabase/queries'
import { useInterpreter } from '@/hooks/useInterpreter'
import CodeEditorPanel from '@/components/learn/CodeEditorPanel'
import MaterialModal from '@/components/learn/MaterialModal'
import InputModal from '@/components/visualizer/InputModal'

const moduleColors: Record<string, { accent: string; bg: string; border: string; badge: string }> = {
  percabangan: {
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  perulangan: {
    accent: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  'struktur-data': {
    accent: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
}

interface Topic {
  id: string
  module_id: string
  title: string
  description: string
  order_index: number
  starter_code: string | null
}

interface ModuleData {
  id: string
  title: string
  description: string
  topics: Topic[]
}

// Extended topic with status
interface TopicWithStatus extends Topic {
  status: 'locked' | 'unlocked' | 'completed'
  bestScore: number
}

export default function LearnPage({ params }: { params: Promise<{ moduleId: string; topicId: string }> }) {
  const unwrappedParams = use(params)
  const moduleId = unwrappedParams.moduleId
  const currentTopicIdFromUrl = unwrappedParams.topicId
  
  const router = useRouter()
  const [module, setModule] = useState<ModuleData | null>(null)
  const [topics, setTopics] = useState<TopicWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTopicId, setSelectedTopicId] = useState<string>(currentTopicIdFromUrl)
  const [showMaterial, setShowMaterial] = useState(false)
  const [currentCode, setCurrentCode] = useState('')
  const [materialContent, setMaterialContent] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const selectedTopic = topics.find(t => t.id === selectedTopicId)
  const selectedTopicIndex = topics.findIndex(t => t.id === selectedTopicId)

  const {
    isRunning,
    error,
    runCode,
    reset,
    currentStep,
    totalSteps,
    isPlaying,
    speed,
    nextStep,
    prevStep,
    firstStep,
    lastStep,
    play,
    pause,
    setSpeed,
    waitingForInput,
    inputVariable,
    inputType,
    submitInput,
    cancelInput,
    getCurrentLine,
    getCurrentVariables,
    getCurrentOutput,
    getCurrentExplanation,
  } = useInterpreter()

  // Get current user
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
      }
    })
  }, [])

  // Load topics for this module with progress status
// Load topics for this module with progress status
useEffect(() => {
  async function loadModuleAndTopics() {
    setLoading(true)
    console.log('🔄 Loading module data...')
    
    try {
      const supabase = createClient()
      
      // Ambil user
      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 Current user:', user?.id || 'No user')
      
      // Get module info
      const { data: moduleData } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single()
      
      console.log('📦 Module data:', moduleData)
      
      // Get topics
      const topicsData = await getTopicsByModule(moduleId)
      console.log('📚 Topics data:', topicsData.length)
      
      // Get user progress for all topics
      let userProgressMap = new Map()
      if (user) {
        const allProgress = await getUserProgress(user.id)
        allProgress.forEach(progress => {
          userProgressMap.set(progress.topic_id, progress)
        })
        console.log('📊 User progress:', userProgressMap.size)
      }
      
      // Merge topics with status
      const topicsWithStatus: TopicWithStatus[] = topicsData.map(topic => {
        const progress = userProgressMap.get(topic.id)
        return {
          ...topic,
          status: progress?.status || 'unlocked',
          bestScore: progress?.best_score || 0
        }
      })
      
      console.log('✅ Topics with status:', topicsWithStatus.length)
      
      if (moduleData) {
        setModule({
          id: moduleData.id,
          title: moduleData.title,
          description: moduleData.description,
          topics: topicsWithStatus
        })
      }
      setTopics(topicsWithStatus)
      
      // If no topic selected from URL, use first topic
      if (!currentTopicIdFromUrl && topicsWithStatus.length > 0) {
        const firstTopic = topicsWithStatus[0]
        setSelectedTopicId(firstTopic.id)
        router.replace(`/learn/${moduleId}/${firstTopic.id}`)
      }
    } catch (error) {
      console.error('❌ Error loading module:', error)
    } finally {
      setLoading(false)
    }
  }
  
  loadModuleAndTopics()
}, [moduleId, currentTopicIdFromUrl, router])
  // Load material when topic changes
  useEffect(() => {
    async function loadMaterial() {
      if (selectedTopicId) {
        const material = await getMaterialByTopic(selectedTopicId)
        setMaterialContent(material?.content || '<p>Tidak ada materi untuk topik ini.</p>')
      }
    }
    loadMaterial()
  }, [selectedTopicId])

  // Check unlock status and redirect if locked
  useEffect(() => {
    async function checkUnlockStatus() {
      if (!userId || !selectedTopicId) return
      
      const currentTopic = topics.find(t => t.id === selectedTopicId)
      
      // If topic is locked, redirect to first unlocked topic
      if (currentTopic?.status === 'locked') {
        const firstUnlocked = topics.find(t => t.status !== 'locked')
        if (firstUnlocked) {
          router.push(`/learn/${moduleId}/${firstUnlocked.id}`)
        }
      }
    }
    
    if (topics.length > 0) {
      checkUnlockStatus()
    }
  }, [userId, selectedTopicId, topics, moduleId, router])

  // Load starter code when topic changes
  useEffect(() => {
    if (selectedTopic) {
      // Parse \n menjadi new line beneran
      const code = selectedTopic.starter_code || '// Starter code not available'
      const unescapedCode = code.replace(/\\n/g, '\n')
      setCurrentCode(unescapedCode)
      reset()
    }
  }, [selectedTopic, reset])

  const handleRunCode = async (code: string) => {
    await runCode(code, 'percabangan')
  }

  const colors = moduleColors[moduleId] || moduleColors.percabangan
  const currentVariables = getCurrentVariables()
  const currentOutput = getCurrentOutput()
  const currentLine = getCurrentLine()

  // Function to handle topic click
  const handleTopicClick = (topic: TopicWithStatus) => {
    if (topic.status === 'locked') {
      // Optional: show toast notification
      console.log('Topic is locked. Complete previous topic quiz first.')
      return
    }
    setSelectedTopicId(topic.id)
    router.push(`/learn/${moduleId}/${topic.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-emerald-500/30 border-t-emerald-500 animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-400">404</h1>
          <p className="mb-6 text-gray-500">Module not found</p>
          <Link href="/dashboard" className="px-6 py-3 transition-colors border rounded-lg border-white/10 hover:bg-white/5">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

return (
  <div className="h-screen flex flex-col bg-[#020203] text-slate-300 overflow-hidden font-sans selection:bg-orange-500/30">
    
    {/* 🌐 HEADER: Ultra-Slim */}
    <header className="h-14 flex items-center justify-between px-6 bg-[#020203] border-b border-white/[0.05] shrink-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2 transition-colors group text-slate-500 hover:text-white">
          <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-red-500/20 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] uppercase">Exit_Terminal</span>
        </Link>
        <div className="h-6 w-[1px] bg-white/10" />
        <div className="flex flex-col">
          <span className={`text-[9px] font-bold tracking-widest ${colors.accent} uppercase`}>{module.title}</span>
          <h1 className="text-xs font-black tracking-tight text-white uppercase">{selectedTopic?.title || 'System Loading...'}</h1>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="flex items-center gap-4 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
        <div className="flex gap-1.5">
          {topics.map((t: any, idx: number) => (
            <div 
              key={t.id} 
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === selectedTopicIndex ? 'bg-orange-500 w-6' : t.status === 'completed' ? 'bg-emerald-500 w-1.5' : 'bg-white/10 w-1.5'}`} 
            />
          ))}
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-500">{selectedTopicIndex + 1} / {topics.length}</span>
      </div>
    </header>

    {/* 🛠 MAIN WORKSPACE: 3-Column Layout */}
    <div className="flex flex-1 gap-3 p-3 overflow-hidden">
      
      {/* 1. LEFT: Module Navigator */}
      <aside className="flex flex-col overflow-hidden w-60 shrink-0">
        <div className="flex-1 bg-[#08080A] border border-white/[0.05] rounded-2xl overflow-hidden flex flex-col shadow-xl">
          <div className="p-4 border-b border-white/[0.05] bg-white/[0.01] shrink-0">
            <span className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase">Index_Modules</span>
          </div>
          <div className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
            {topics.map((topic: any, idx: number) => {
              const isActive = selectedTopicId === topic.id;
              const isLocked = topic.status === 'locked';
              return (
                <button
                  key={topic.id}
                  disabled={isLocked}
                  onClick={() => handleTopicClick(topic)}
                  className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive ? 'bg-orange-500/10 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.05)]' : 'border border-transparent hover:bg-white/[0.02]'
                  } ${isLocked ? 'opacity-20 grayscale cursor-not-allowed' : 'opacity-100'}`}
                >
                  <div className={`text-[10px] font-bold w-6 h-6 rounded flex items-center justify-center border transition-all ${
                    isActive ? 'bg-orange-500 border-orange-500 text-white' : 'border-white/10 text-slate-600'
                  }`}>
                    {topic.status === 'completed' ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[11px] font-bold text-left truncate ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {topic.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* 2. CENTER: Main Editor (The Heart) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#08080A] border border-white/[0.05] rounded-2xl overflow-hidden relative shadow-2xl">
        <CodeEditorPanel
          starterCode={currentCode || selectedTopic?.starter_code || ''}
          solutionCode=""
          onCodeChange={setCurrentCode}
          onRun={handleRunCode}
          isRunning={isRunning}
          highlightedLine={currentLine}
          onShowMaterial={() => setShowMaterial(true)}
        />
      </main>

      {/* 3. RIGHT: Inspector (No-Tabs, Full Visibility) */}
      <aside className="flex flex-col gap-3 overflow-hidden w-80 shrink-0">
        
        {/* Logic Player: Controls & Speed */}
        <div className="bg-[#08080A] border border-white/[0.05] rounded-2xl p-4 shrink-0 flex flex-col gap-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black tracking-widest text-orange-500 uppercase italic">Logic_Engine</span>
            <span className="text-[10px] font-mono text-slate-500">Step {currentStep}/{totalSteps}</span>
          </div>
          
          {/* Main Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-1">
              <button onClick={firstStep} className="p-2.5 hover:text-white text-slate-600 transition-colors" title="Awal">⏮</button>
              <button onClick={prevStep} className="p-2.5 hover:text-white text-slate-600 transition-colors" title="Mundur">◀</button>
              
              <button 
                onClick={isPlaying ? pause : play} 
                className={`mx-2 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isPlaying ? 'bg-white text-black' : 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]'
                }`}
              >
                {isPlaying ? <span className="text-xl italic font-black">||</span> : <span className="ml-1 text-xl italic font-black">▶</span>}
              </button>

              <button onClick={nextStep} className="p-2.5 hover:text-white text-slate-600 transition-colors" title="Maju">▶</button>
              <button onClick={lastStep} className="p-2.5 hover:text-white text-slate-600 transition-colors" title="Akhir">⏭</button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-1">
                <span>Slow</span>
                <span>Frequency_Control</span>
                <span>Fast</span>
              </div>
              <input 
                type="range" min="100" max="2000" step="100" 
                value={speed} onChange={(e) => setSpeed(Number(e.target.value))} 
                className="w-full h-1 rounded-full appearance-none cursor-pointer bg-white/10 accent-orange-600"
              />
            </div>
          </div>
        </div>

        {/* Real-time Memory (Variables) */}
        <div className="flex-1 bg-[#08080A] border border-white/[0.05] rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-lg">
          <div className="p-3 border-b border-white/[0.05] bg-white/[0.01] shrink-0">
            <span className="text-[9px] font-black tracking-widest text-blue-400 uppercase">Memory_Inspector</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar bg-black/10">
            {Object.entries(currentVariables).map(([name, value]) => (
              <div key={name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] group hover:border-orange-500/30 transition-all">
                <span className="font-mono text-[10px] text-slate-500 tracking-tighter">{name}</span>
                <span className="font-mono text-[11px] text-orange-400 font-bold">{JSON.stringify(value)}</span>
              </div>
            ))}
            {Object.keys(currentVariables).length === 0 && (
              <p className="text-[10px] text-slate-700 italic text-center mt-6 tracking-widest uppercase">No Live Data</p>
            )}
          </div>
        </div>

        {/* Standard Out & Log */}
        <div className="flex flex-col h-56 gap-3 overflow-hidden shrink-0">
          <div className="flex-1 bg-black border border-white/[0.05] rounded-2xl flex flex-col overflow-hidden shadow-lg">
            <div className="p-3 border-b border-white/[0.05] bg-[#0A0A0F] shrink-0">
               <span className="text-[9px] font-black tracking-widest text-emerald-500 uppercase">Standard_Output</span>
            </div>
            <div className="flex-1 p-3 font-mono text-[11px] overflow-y-auto custom-scrollbar">
              <pre className="leading-tight whitespace-pre-wrap text-emerald-400/90">
                {currentOutput || '> Waiting for process initiation...'}
              </pre>
            </div>
          </div>

          <div className="p-3.5 bg-orange-600/[0.05] border border-orange-500/20 rounded-xl shrink-0">
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              <span className="mr-2 font-mono not-italic font-bold text-orange-500">[LOG]</span>
              {getCurrentExplanation() || 'System is idle.'}
            </p>
          </div>
        </div>
      </aside>
    </div>

    {/* 📝 FLOATING QUIZ BUTTON */}
    {selectedTopic && totalSteps > 0 && selectedTopic.status !== 'completed' && (
      <div className="fixed bottom-10 right-14 z-[60] pointer-events-none">
        <button
          onClick={() => router.push(`/learn/${moduleId}/${selectedTopicId}/quiz`)}
          className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 group"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Launch_Quiz</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    )}

    {/* Error Display */}
    {error && (
      <div className="fixed max-w-md p-4 border bottom-4 right-4 bg-red-500/10 border-red-500/20 rounded-xl">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )}

    {/* Completed Badge */}
    {selectedTopic?.status === 'completed' && (
      <div className="fixed flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-emerald-600/50 rounded-xl bottom-6 right-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Completed</span>
      </div>
    )}

    {/* Material Modal */}
    <MaterialModal
      isOpen={showMaterial}
      onClose={() => setShowMaterial(false)}
      title={selectedTopic?.title || 'Materi'}
      content={materialContent}
    />

    {/* Input Modal */}
    {waitingForInput && inputVariable && (
      <InputModal
        isOpen={waitingForInput}
        variableName={inputVariable}
        variableType={inputType || 'int'}
        onSubmit={submitInput}
        onCancel={cancelInput}
      />
    )}
  </div>
)
}