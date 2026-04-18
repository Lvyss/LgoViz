'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getModuleById } from '@/data/modules'
import { useInterpreter } from '@/hooks/useInterpreter'
import CodeEditorPanel from '@/components/learn/CodeEditorPanel'
import InputModal from '@/components/visualizer/InputModal'

const colorStyles = {
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    button: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    progress: 'bg-emerald-500',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  },
  blue: {
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    button: 'bg-gradient-to-r from-blue-500 to-blue-600',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    progress: 'bg-blue-500',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  },
  purple: {
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    button: 'bg-gradient-to-r from-purple-500 to-purple-600',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    progress: 'bg-purple-500',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
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
    trace,
  } = useInterpreter()

  useEffect(() => {
    if (selectedTopic) {
      setCurrentCode(selectedTopic.starterCode)
      reset()
    }
  }, [selectedTopic, reset])

// Di page.tsx, update handleRunCode:
const handleRunCode = async (code: string) => {
  const evaluatorType = moduleId === 'percabangan' ? 'percabangan' 
    : moduleId === 'perulangan' ? 'perulangan' 
    : 'struktur-data'
  await runCode(code, evaluatorType)
}

  const currentVariables = getCurrentVariables()
  const currentOutput = getCurrentOutput()
  const currentExplanation = getCurrentExplanation()
  const currentLine = getCurrentLine()

  const moduleColor = moduleId === 'percabangan' ? 'emerald'
    : moduleId === 'perulangan' ? 'blue'
    : 'purple'
  const colors = colorStyles[moduleColor]

  if (!module) {
    return (
      <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-400">404</h1>
            <p className="mb-6 text-gray-500">Module &quot;{moduleId}&quot; not found</p>
            <Link
              href="/dashboard"
              className="inline-flex px-6 py-3 transition-colors border rounded-lg bg-white/5 border-white/10 hover:bg-white/10"
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
    <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
        <p className="mt-1 text-gray-400">
          {module.description}
        </p>
      </div>

      {/* Split Layout */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <h3 className="mb-3 text-sm font-medium text-gray-400">Topics</h3>
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
        <div className="space-y-6 lg:col-span-3">
          {/* Material Panel */}
          {selectedTopic && (
            <div className="p-6 border rounded-xl bg-white/5 border-white/10">
              <div className="flex items-start justify-between mb-4">
                <h2 className={`text-xl font-semibold ${colors.text}`}>
                  {selectedTopic.title}
                </h2>
                <span className="text-xs text-gray-500">
                  Topic {selectedTopicIndex + 1} of {module.topics.length}
                </span>
              </div>
              <div
                className="leading-relaxed prose text-gray-300 prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedTopic.explanation }}
              />
            </div>
          )}

          {/* Code Editor with Highlighting */}
          {selectedTopic && (
            <CodeEditorPanel
              starterCode={selectedTopic.starterCode}
              solutionCode={selectedTopic.solutionCode}
              onCodeChange={setCurrentCode}
              onRun={handleRunCode}
              isRunning={isRunning}
              highlightedLine={currentLine}
            />
          )}

          {/* Error */}
          {error && (
            <div className="p-4 border rounded-xl bg-red-500/10 border-red-500/20">
              <h3 className="mb-1 text-sm font-semibold text-red-400">⚠️ Error</h3>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Visualizer Panel */}
          <div className="overflow-hidden border rounded-xl bg-white/5 border-white/10">
            <div className="px-4 py-3 border-b bg-white/5 border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
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
                        className={`h-full rounded-full ${colors.progress} transition-all duration-200`}
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4">
              {/* Animation Controls */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <button
                  onClick={firstStep}
                  disabled={totalSteps === 0 || currentStep <= 0}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                  title="First step"
                >
                  ⏮
                </button>
                <button
                  onClick={prevStep}
                  disabled={totalSteps === 0 || currentStep <= 0}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                  title="Previous step"
                >
                  ◀
                </button>
                {isPlaying ? (
                  <button
                    onClick={pause}
                    className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors text-lg"
                    title="Pause"
                  >
                    ⏸
                  </button>
                ) : (
                  <button
                    onClick={play}
                    disabled={totalSteps === 0 || currentStep >= totalSteps}
                    className={`px-4 py-1.5 rounded ${colors.button} ${colors.glow} text-white transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Play"
                  >
                    ▶
                  </button>
                )}
                <button
                  onClick={nextStep}
                  disabled={totalSteps === 0 || currentStep >= totalSteps}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                  title="Next step"
                >
                  ▶▶
                </button>
                <button
                  onClick={lastStep}
                  disabled={totalSteps === 0 || currentStep >= totalSteps}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                  title="Last step"
                >
                  ⏭
                </button>
                <button
                  onClick={reset}
                  disabled={totalSteps === 0}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
                  title="Reset"
                >
                  ↺
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
                  {speed <= 200 ? 'Fast' : speed >= 1500 ? 'Slow' : `${Math.round(1000 / speed)}x`}
                </span>
              </div>

              {/* Variables & Output */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Variables Panel */}
                <div className="p-3 border rounded-lg bg-black/30 border-white/10">
                  <p className={`text-xs font-semibold mb-2 ${colors.text}`}>📊 Variables</p>
                  {Object.keys(currentVariables).length === 0 ? (
                    <p className="py-4 text-xs text-center text-gray-500">
                      {totalSteps === 0 ? 'Run code to see variables' : 'No variables'}
                    </p>
                  ) : (
                    <div className="space-y-1 overflow-auto max-h-48">
                      {Object.entries(currentVariables).map(([name, value], idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-2 py-1 text-sm rounded bg-white/5"
                        >
                          <span className="font-mono text-gray-300">{name}</span>
                          <span className={`${colors.text} font-mono`}>
                            {typeof value === 'string' ? `"${value}"` : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Output Panel */}
                <div className="p-3 border rounded-lg bg-black/30 border-white/10">
                  <p className={`text-xs font-semibold mb-2 ${colors.text}`}>💬 Output</p>
                  {!currentOutput ? (
                    <p className="py-4 text-xs text-center text-gray-500">
                      {totalSteps === 0 ? 'Run code to see output' : 'No output yet'}
                    </p>
                  ) : (
                    <div className="overflow-auto max-h-48">
                      <pre className="font-mono text-sm whitespace-pre-wrap text-emerald-400">
                        {currentOutput}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Explanation Panel */}
              <div className="p-3 mt-4 border rounded-lg bg-black/30 border-white/10">
                <p className={`text-xs font-semibold mb-2 ${colors.text}`}>📖 Explanation</p>
                <p className="text-sm text-gray-300">
                  {currentExplanation || 'Press ▶ PLAY or step through to see explanation'}
                </p>
              </div>

              {/* All Steps Trace (Debug - hide in production) */}
              {trace && trace.steps.length > 0 && (
                <div className="p-3 mt-4 border rounded-lg bg-black/30 border-white/10">
                  <p className={`text-xs font-semibold mb-2 ${colors.text}`}>📋 Trace ({trace.steps.length} steps)</p>
                  <div className="space-y-1 overflow-auto max-h-40">
                    {trace.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`text-xs font-mono px-2 py-1 rounded ${
                          idx + 1 === currentStep
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-gray-500'
                        }`}
                      >
                        <span className="text-gray-600">#{idx + 1}</span>{' '}
                        <span className="text-gray-400">L{step.lineNumber}</span>{' '}
                        {step.explanation}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Topic Navigation */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrevTopic}
              disabled={selectedTopicIndex === 0}
              className="px-4 py-2 transition-colors border rounded-lg bg-white/5 border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
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