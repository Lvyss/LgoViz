'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getModuleById } from '@/data/modules'
import { useInterpreter } from '@/hooks/useInterpreter'
import InputModal from '@/components/visualizer/InputModal'

// Warna modern
const colorStyles = {
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    button: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  blue: {
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    button: 'bg-gradient-to-r from-blue-500 to-blue-600',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  purple: {
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    button: 'bg-gradient-to-r from-purple-500 to-purple-600',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
}

export default function LearnPage() {
  const params = useParams()
  const moduleId = params.moduleId as string
  const module = getModuleById(moduleId)
  
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    module?.topics[0]?.id || ''
  )
  const [currentCode, setCurrentCode] = useState('')

  const selectedTopic = module?.topics.find(t => t.id === selectedTopicId)
  const selectedTopicIndex = module?.topics.findIndex(t => t.id === selectedTopicId) || 0

  // Interpreter hook
  const {
    runCode,
    currentStep,
    totalSteps,
    isRunning,
    isPlaying,
    speed,
    error,
    nextStep,
    prevStep,
    firstStep,
    lastStep,
    play,
    pause,
    setSpeed,
    getCurrentVariables,
    getCurrentOutput,
    getCurrentExplanation,
    getCurrentLine,
    waitingForInput,
    inputVariable,
    inputType,
    submitInput,
    cancelInput,
  } = useInterpreter()

  // Update current code when topic changes
  useEffect(() => {
    if (selectedTopic) {
      setCurrentCode(selectedTopic.starterCode)
    }
  }, [selectedTopic])

  const handleRunCode = (code: string) => {
    runCode(code)
  }

  const currentVariables = getCurrentVariables()
  const currentOutput = getCurrentOutput()
  const currentExplanation = getCurrentExplanation()

  // Tentukan warna berdasarkan moduleId
  const moduleColor = moduleId === 'percabangan' ? 'emerald' 
    : moduleId === 'perulangan' ? 'blue' 
    : 'purple'
  const colors = colorStyles[moduleColor]

  if (!module) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-400 mb-4">404</h1>
            <p className="text-gray-500 mb-6">Module "{moduleId}" not found</p>
            <Link
              href="/dashboard"
              className="inline-flex px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleNextTopic = () => {
    const currentIndex = module.topics.findIndex(t => t.id === selectedTopicId)
    if (currentIndex < module.topics.length - 1) {
      setSelectedTopicId(module.topics[currentIndex + 1].id)
    }
  }

  const handlePrevTopic = () => {
    const currentIndex = module.topics.findIndex(t => t.id === selectedTopicId)
    if (currentIndex > 0) {
      setSelectedTopicId(module.topics[currentIndex - 1].id)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xs px-2 py-1 rounded-full border ${colors.badge}`}>
            {module.title}
          </span>
        </div>
        <h1 className={`text-3xl font-bold tracking-tight ${colors.text}`}>
          {module.title}
        </h1>
        <p className="text-gray-400 mt-1">
          {module.description}
        </p>
      </div>

      {/* Split Layout: Sidebar + Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Topic List */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Topics</h3>
            <div className="space-y-1">
              {module.topics.map((topic, idx) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    selectedTopicId === topic.id
                      ? `${colors.bg} ${colors.border} border`
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${selectedTopicId === topic.id ? colors.text : 'text-gray-500'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-sm ${selectedTopicId === topic.id ? 'text-white' : 'text-gray-400'}`}>
                      {topic.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Material Panel */}
          {selectedTopic && (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <h2 className={`text-xl font-semibold ${colors.text}`}>
                  {selectedTopic.title}
                </h2>
                <span className="text-xs text-gray-500">
                  Topic {selectedTopicIndex + 1} of {module.topics.length}
                </span>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {selectedTopic.description}
                </p>
                <div className="mt-4 text-gray-400 text-sm space-y-2">
                  {selectedTopic.learningObjectives?.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={colors.text}>▸</span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Code Editor Panel */}
          {selectedTopic && (
            <div className="rounded-xl bg-[#1e1e2e] border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-400 ml-2">main.cpp</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentCode(selectedTopic.starterCode)}
                    className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => handleRunCode(currentCode)}
                    className={`text-xs px-3 py-1 rounded ${colors.button} text-white transition-all hover:shadow-lg`}
                  >
                    ▶ Run
                  </button>
                </div>
              </div>
              <textarea
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm text-gray-300 bg-[#1e1e2e] focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <h3 className="text-red-400 font-semibold text-sm mb-1">⚠️ Error</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Visualizer */}
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className={`text-sm font-semibold ${colors.text}`}>
                  🎮 Visualizer
                </h3>
                {totalSteps > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Step {currentStep} / {totalSteps}
                    </span>
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          moduleColor === 'emerald' ? 'bg-emerald-500' 
                          : moduleColor === 'blue' ? 'bg-blue-500' 
                          : 'bg-purple-500'
                        }`}
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4">
              {/* Animation Controls */}
              <div className="flex justify-center gap-2 mb-6">
                <button
                  onClick={firstStep}
                  disabled={!isRunning || currentStep <= 1}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ⏮
                </button>
                <button
                  onClick={prevStep}
                  disabled={!isRunning || currentStep <= 1}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ◀
                </button>
                {isPlaying ? (
                  <button
                    onClick={pause}
                    className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    ⏸
                  </button>
                ) : (
                  <button
                    onClick={play}
                    disabled={!isRunning || currentStep >= totalSteps}
                    className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ▶
                  </button>
                )}
                <button
                  onClick={nextStep}
                  disabled={!isRunning || currentStep >= totalSteps}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ▶▶
                </button>
                <button
                  onClick={lastStep}
                  disabled={!isRunning || currentStep >= totalSteps}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ⏭
                </button>
              </div>

              {/* Speed Control */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-xs text-gray-500">Speed</span>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-48 h-1 rounded-full bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                />
                <span className="text-xs text-gray-400">
                  {speed === 100 ? 'Fast' : speed === 2000 ? 'Slow' : `${Math.round(1000 / speed)}x`}
                </span>
              </div>

              {/* Variables & Output */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Variables Panel */}
                <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                  <p className={`text-xs font-semibold mb-2 ${colors.text}`}>📊 Variables</p>
                  {currentVariables.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">
                      No variables yet
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-auto">
                      {currentVariables.map((v, idx) => (
                        <div 
                          key={idx}
                          className={`text-sm flex justify-between items-center py-1 px-2 rounded ${
                            v.changed ? `${colors.bg} ${colors.border} border` : ''
                          }`}
                        >
                          <span className="text-gray-300">{v.name}</span>
                          <span className={colors.text}>
                            {v.type === 'string' ? `"${v.value}"` : String(v.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Output Panel */}
                <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                  <p className={`text-xs font-semibold mb-2 ${colors.text}`}>💬 Output</p>
                  {currentOutput.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">
                      Run code to see output
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-auto">
                      {currentOutput.map((line, idx) => (
                        <div key={idx} className="text-sm text-gray-300 border-l-2 border-emerald-500/30 pl-2">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Explanation Panel */}
              <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/10">
                <p className={`text-xs font-semibold mb-2 ${colors.text}`}>📖 Explanation</p>
                <p className="text-sm text-gray-400">
                  {currentExplanation || 'Press RUN to start execution'}
                </p>
              </div>
            </div>
          </div>

          {/* Topic Navigation */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrevTopic}
              disabled={selectedTopicIndex === 0}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={handleNextTopic}
              disabled={selectedTopicIndex === module.topics.length - 1}
              className={`px-4 py-2 rounded-lg ${colors.button} text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

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