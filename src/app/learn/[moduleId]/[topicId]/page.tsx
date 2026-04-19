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
  useEffect(() => {
    async function loadModuleAndTopics() {
      setLoading(true)
      try {
        const supabase = createClient()
        
        // Get module info
        const { data: moduleData } = await supabase
          .from('modules')
          .select('*')
          .eq('id', moduleId)
          .single()
        
        // Get topics
        const topicsData = await getTopicsByModule(moduleId)
        
        // Get user progress for all topics
        let userProgressMap = new Map()
        if (userId) {
          const allProgress = await getUserProgress(userId)
          allProgress.forEach(progress => {
            userProgressMap.set(progress.topic_id, progress)
          })
        }
        
        // Merge topics with status
        const topicsWithStatus: TopicWithStatus[] = topicsData.map(topic => {
          const progress = userProgressMap.get(topic.id)
          return {
            ...topic,
            status: progress?.status || 'locked',
            bestScore: progress?.best_score || 0
          }
        })
        
        if (moduleData) {
          setModule({
            id: moduleData.id,
            title: moduleData.title,
            description: moduleData.description,
            topics: topicsWithStatus
          })
        }
        setTopics(topicsWithStatus)
        
        // If no topic selected from URL, use first unlocked topic
        if (!currentTopicIdFromUrl && topicsWithStatus.length > 0) {
          const firstUnlocked = topicsWithStatus.find(t => t.status !== 'locked')
          if (firstUnlocked) {
            setSelectedTopicId(firstUnlocked.id)
            router.replace(`/learn/${moduleId}/${firstUnlocked.id}`)
          }
        }
      } catch (error) {
        console.error('Error loading module:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      loadModuleAndTopics()
    }
  }, [moduleId, currentTopicIdFromUrl, router, userId])

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
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 text-gray-400 transition-colors hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full border ${colors.badge}`}>
                {module.title}
              </span>
              <h1 className={`text-xl font-medium ${colors.accent}`}>
                {selectedTopic?.title || 'Select a topic'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Find previous unlocked/completed topic */}
            {(() => {
              const prevUnlockedIndex = topics.findIndex((t, idx) => 
                idx < selectedTopicIndex && t.status !== 'locked'
              )
              const prevTopic = prevUnlockedIndex !== -1 ? topics[prevUnlockedIndex] : null
              return prevTopic && (
                <button
                  onClick={() => {
                    setSelectedTopicId(prevTopic.id)
                    router.push(`/learn/${moduleId}/${prevTopic.id}`)
                  }}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  ← Prev
                </button>
              )
            })()}
            <span className="text-xs text-gray-500">
              {selectedTopicIndex + 1} / {topics.length}
            </span>
            {/* Find next unlocked topic */}
            {(() => {
              const nextUnlocked = topics.find((t, idx) => 
                idx > selectedTopicIndex && t.status !== 'locked'
              )
              return nextUnlocked && (
                <button
                  onClick={() => {
                    setSelectedTopicId(nextUnlocked.id)
                    router.push(`/learn/${moduleId}/${nextUnlocked.id}`)
                  }}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Next →
                </button>
              )
            })()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Topic Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-[#0a0a0f] overflow-y-auto">
          <div className="p-4">
            <h2 className="mb-3 text-xs font-medium tracking-wider text-gray-500 uppercase">Topics</h2>
            <div className="space-y-1">
              {topics.map((topic, idx) => {
                const isLocked = topic.status === 'locked'
                const isCompleted = topic.status === 'completed'
                const isActive = selectedTopicId === topic.id
                
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic)}
                    disabled={isLocked}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm
                      ${isLocked 
                        ? 'opacity-50 cursor-not-allowed text-gray-500' 
                        : isActive
                          ? `${colors.bg} ${colors.border} border text-white cursor-pointer`
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-300 cursor-pointer'
                      }
                    `}
                    title={isLocked ? 'Selesaikan quiz topik sebelumnya terlebih dahulu' : topic.title}
                  >
                    <div className="flex items-center gap-3">
                      {/* Number badge with status indicator */}
                      <div className={`
                        w-6 h-6 flex items-center justify-center text-xs rounded
                        ${isActive 
                          ? colors.bg 
                          : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isLocked
                              ? 'bg-white/5 text-gray-500'
                              : 'bg-white/5'
                        }
                      `}>
                        {isCompleted ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      
                      <span className={`flex-1 ${isLocked ? 'line-through decoration-gray-500' : ''}`}>
                        {topic.title}
                      </span>
                      
                      {/* Lock icon for locked topics */}
                      {isLocked && (
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      
                      {/* Check icon for completed topics */}
                      {isCompleted && !isActive && (
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Panel - same as before */}
        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 border-b border-white/10">
            <CodeEditorPanel
              starterCode={currentCode || selectedTopic?.starter_code || ''}
              solutionCode=""
              onCodeChange={setCurrentCode}
              onRun={handleRunCode}
              isRunning={isRunning}
              highlightedLine={currentLine}
              onShowMaterial={() => setShowMaterial(true)}
            />
          </div>

          {/* Visualizer Panel */}
          <div className="h-[400px] flex flex-col overflow-hidden bg-[#0a0a0f]">
            {/* Visualizer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-4">
                <h3 className={`text-sm font-medium ${colors.accent}`}>Visualizer</h3>
                {totalSteps > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Step {currentStep} of {totalSteps}
                    </span>
                    <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-200 bg-emerald-500"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button onClick={firstStep} disabled={totalSteps === 0} className="p-1.5 text-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">⏮</button>
                <button onClick={prevStep} disabled={totalSteps === 0} className="p-1.5 text-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">◀</button>
                {isPlaying ? (
                  <button onClick={pause} className="p-2 text-lg text-white rounded-lg bg-white/10">⏸</button>
                ) : (
                  <button onClick={play} disabled={totalSteps === 0 || currentStep >= totalSteps} className="p-2 text-lg text-white rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">▶</button>
                )}
                <button onClick={nextStep} disabled={totalSteps === 0 || currentStep >= totalSteps} className="p-1.5 text-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">▶</button>
                <button onClick={lastStep} disabled={totalSteps === 0} className="p-1.5 text-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">⏭</button>
                <button onClick={reset} disabled={totalSteps === 0} className="p-1.5 text-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">↺</button>
              </div>
            </div>

            {/* Speed Slider */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10">
              <span className="text-xs text-gray-500">Speed</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-40 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
              />
              <span className="text-xs text-gray-400">{speed <= 200 ? 'Fast' : speed >= 1500 ? 'Slow' : `${Math.round(1000 / speed)}x`}</span>
            </div>

            {/* Variables & Output Grid */}
            <div className="grid flex-1 grid-cols-2 overflow-hidden divide-x divide-white/10">
              {/* Variables */}
              <div className="p-4 overflow-y-auto">
                <p className={`text-xs font-medium ${colors.accent} mb-3`}>Variables</p>
                {Object.keys(currentVariables).length === 0 ? (
                  <p className="py-4 text-xs text-center text-gray-500">
                    {totalSteps === 0 ? 'Run code to see variables' : 'No variables yet'}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(currentVariables).map(([name, value]) => (
                      <div key={name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                        <span className="font-mono text-sm text-gray-400">{name}</span>
                        <span className={`font-mono text-sm ${colors.accent}`}>
                          {typeof value === 'string' ? `"${value}"` : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Output */}
              <div className="p-4 overflow-y-auto">
                <p className={`text-xs font-medium ${colors.accent} mb-3`}>Output</p>
                {!currentOutput ? (
                  <p className="py-4 text-xs text-center text-gray-500">
                    {totalSteps === 0 ? 'Run code to see output' : 'No output yet'}
                  </p>
                ) : (
                  <pre className="font-mono text-sm whitespace-pre-wrap text-emerald-400">{currentOutput}</pre>
                )}
              </div>
            </div>

            {/* Explanation */}
            {totalSteps > 0 && (
              <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                <p className="mb-1 text-xs text-gray-500">Explanation</p>
                <p className="text-sm text-gray-300">
                  {getCurrentExplanation() || 'Step through to see explanation'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed max-w-md p-4 border bottom-4 right-4 bg-red-500/10 border-red-500/20 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Quiz Button - Fixed bottom right */}
      {selectedTopic && totalSteps > 0 && selectedTopic.status !== 'completed' && (
        <button
          onClick={() => router.push(`/learn/${moduleId}/${selectedTopicId}/quiz`)}
          className="fixed flex items-center gap-2 px-5 py-3 text-sm font-medium text-white transition-all shadow-lg bottom-6 right-6 bg-emerald-600 rounded-xl hover:bg-emerald-500 shadow-emerald-500/20"
        >
          <span>📝</span>
          <span>Mulai Quiz</span>
        </button>
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