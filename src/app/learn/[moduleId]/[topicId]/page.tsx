'use client'

import { useState, useEffect, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getTopicsByModule, getMaterialByTopic, getUserProgress } from '@/lib/supabase/queries'
import { useInterpreter } from '@/hooks/useInterpreter'
import CodeEditorPanel from '@/components/learn/CodeEditorPanel'
import MaterialModal from '@/components/learn/MaterialModal'
import InputModal from '@/components/visualizer/InputModal'
import ChallengeModal from '@/components/learn/ChallengeModal'
import QuizModal from '@/components/learn/QuizModal'
import { useQuiz } from '@/hooks/useQuiz'
import { LearnTutorial } from '@/components/learn/LearnTutorial'

// ─── COLOR PALETTE (konsisten dengan dashboard) ────────────────────────────────
const moduleColors: Record<string, {
  accent: string; accentHex: string
  bg: string; border: string; badge: string
  glow: string; ring: string
}> = {
  percabangan: {
    accent: 'text-emerald-400', accentHex: '#34d399',
    bg: 'bg-emerald-500/8', border: 'border-emerald-500/25',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.12)]',
    ring: 'ring-emerald-500/30',
  },
  perulangan: {
    accent: 'text-blue-400', accentHex: '#60a5fa',
    bg: 'bg-blue-500/8', border: 'border-blue-500/25',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    glow: 'shadow-[0_0_24px_rgba(96,165,250,0.12)]',
    ring: 'ring-blue-500/30',
  },
  'struktur-data': {
    accent: 'text-purple-400', accentHex: '#c084fc',
    bg: 'bg-purple-500/8', border: 'border-purple-500/25',
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    glow: 'shadow-[0_0_24px_rgba(192,132,252,0.12)]',
    ring: 'ring-purple-500/30',
  },
}

interface Topic {
  id: string; module_id: string; title: string
  description: string; order_index: number; starter_code: string | null
}
interface ModuleData {
  id: string; title: string; description: string; topics: Topic[]
}
interface TopicWithStatus extends Topic {
  status: 'locked' | 'unlocked' | 'completed'; bestScore: number
}
interface Challenge {
  id: string; topic_id: string; description: string
  starter_code: string; required_keywords: string[]
  required_variables: string[]; is_active: boolean
}

// ─── STATUS ICON ───────────────────────────────────────────────────────────────
function StatusIcon({ status, isActive }: { status: string; isActive: boolean }) {
  if (status === 'completed') return (
    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
  if (status === 'locked') return (
    <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
  return <span className="text-[10px] font-black text-white">{isActive ? '▶' : '○'}</span>
}

// ─── STEP INDICATOR (progress visual atas) ────────────────────────────────────
function StepTrail({ topics, activeId }: { topics: TopicWithStatus[]; activeId: string | null }) {
  return (
    <div className="flex items-center gap-1">
      {topics.map((t, i) => {
        const isActive = t.id === activeId
        const isDone   = t.status === 'completed'
        return (
          <div key={t.id} className="flex items-center gap-1">
            <div className={`rounded-full transition-all duration-500 ${
              isActive  ? 'w-5 h-1.5 bg-orange-500' :
              isDone    ? 'w-1.5 h-1.5 bg-emerald-500' :
                          'w-1.5 h-1.5 bg-white/10'
            }`} />
            {i < topics.length - 1 && (
              <div className={`w-3 h-px transition-colors ${isDone ? 'bg-emerald-500/30' : 'bg-white/5'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── PLAYBACK CONTROL ─────────────────────────────────────────────────────────
function PlaybackControl({
  isPlaying, isRunning,
  currentStep, totalSteps,
  speed, onPlay, onPause, onPrev, onNext, onFirst, onLast, onSpeedChange
}: {
  isPlaying: boolean; isRunning: boolean
  currentStep: number; totalSteps: number; speed: number
  onPlay: () => void; onPause: () => void
  onPrev: () => void; onNext: () => void
  onFirst: () => void; onLast: () => void
  onSpeedChange: (v: number) => void
}) {
  const pct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className="space-y-3">
      {/* progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black tracking-[0.25em] text-slate-600 uppercase">Eksekusi</span>
          <span className="text-[10px] font-mono text-slate-500">
            {currentStep}<span className="text-slate-700">/{totalSteps}</span>
          </span>
        </div>
        <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* controls */}
      <div className="flex items-center justify-center gap-1">
        {[
          { action: onFirst,  icon: '⏮', title: 'Awal' },
          { action: onPrev,   icon: '◀',  title: 'Sebelumnya' },
        ].map(btn => (
          <button key={btn.title} onClick={btn.action} title={btn.title}
            className="flex items-center justify-center text-sm transition-all w-9 h-9 rounded-xl text-slate-600 hover:text-white hover:bg-white/5">
            {btn.icon}
          </button>
        ))}

        <button
          onClick={isPlaying ? onPause : onPlay}
          className={`w-11 h-11 rounded-full flex items-center justify-center mx-1 transition-all duration-200 font-black text-base ${
            isPlaying
              ? 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
              : 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.35)] hover:bg-orange-500'
          }`}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {[
          { action: onNext,  icon: '▶',  title: 'Berikutnya' },
          { action: onLast,  icon: '⏭', title: 'Akhir' },
        ].map(btn => (
          <button key={btn.title} onClick={btn.action} title={btn.title}
            className="flex items-center justify-center text-sm transition-all w-9 h-9 rounded-xl text-slate-600 hover:text-white hover:bg-white/5">
            {btn.icon}
          </button>
        ))}
      </div>

      {/* speed */}
      <div className="space-y-1">
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-700">
          <span>Lambat</span><span>Kecepatan</span><span>Cepat</span>
        </div>
        <input
          type="range" min="100" max="2000" step="100" value={speed}
          onChange={e => onSpeedChange(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer bg-white/8 accent-orange-500"
        />
      </div>
    </div>
  )
}

// ─── VARIABLE ROW ─────────────────────────────────────────────────────────────
function VarRow({ name, value }: { name: string; value: unknown }) {
  const display = JSON.stringify(value)
  const isStr   = typeof value === 'string'
  const isBool  = typeof value === 'boolean'
  const isNum   = typeof value === 'number'

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-orange-500/20 transition-all group">
      <span className="font-mono text-[10px] text-slate-500 tracking-tight">{name}</span>
      <span className={`font-mono text-[11px] font-bold ${
        isStr  ? 'text-sky-400' :
        isBool ? 'text-purple-400' :
        isNum  ? 'text-orange-400' : 'text-slate-300'
      }`}>{display}</span>
    </div>
  )
}

// ─── ACTION BUTTON (materi / challenge / quiz) — dipakai di toolbar editor ─────
function ActionBtn({
  icon, label, sublabel, onClick, done, locked, accentClass
}: {
  icon: string; label: string; sublabel: string
  onClick: () => void; done?: boolean; locked?: boolean; accentClass?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      title={locked ? 'Selesaikan challenge dulu' : label}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all group
        ${done    ? 'border-emerald-500/25 bg-emerald-500/8 hover:bg-emerald-500/12' :
          locked  ? 'border-white/5 bg-white/[0.01] opacity-40 cursor-not-allowed' :
                    'border-white/8 bg-white/[0.02] hover:border-orange-500/30 hover:bg-orange-500/5'
        }`}
    >
      <span className="text-sm">{done ? '✅' : icon}</span>
      <div className="min-w-0">
        <p className={`text-[10px] font-bold leading-none ${done ? 'text-emerald-400' : locked ? 'text-slate-600' : 'text-slate-300'}`}>
          {label}
        </p>
        <p className="text-[8px] text-slate-600 mt-0.5 leading-none">{done ? 'Selesai' : sublabel}</p>
      </div>
    </button>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function LearnPage({ params }: { params: Promise<{ moduleId: string; topicId: string }> }) {
  const unwrappedParams    = use(params)
  const moduleId           = unwrappedParams.moduleId
  const currentTopicIdFromUrl = unwrappedParams.topicId

  const router   = useRouter()
  const supabase = createClient()

  const [module,           setModule]           = useState<ModuleData | null>(null)
  const [topics,           setTopics]           = useState<TopicWithStatus[]>([])
  const [loading,          setLoading]          = useState(true)
  const [selectedTopicId,  setSelectedTopicId]  = useState<string | null>(null)
  const [showMaterial,     setShowMaterial]     = useState(false)
  const [showChallenge,    setShowChallenge]    = useState(false)
  const [currentCode,      setCurrentCode]      = useState('')
  const [materialContent,  setMaterialContent]  = useState('')
  const [userId,           setUserId]           = useState<string | null>(null)
  const [challenge,        setChallenge]        = useState<Challenge | null>(null)
  const [challengeCompleted, setChallengeCompleted] = useState(false)
  const [challengeCode,    setChallengeCode]    = useState('')
  const [showQuiz,         setShowQuiz]         = useState(false)
  const [sidebarOpen,      setSidebarOpen]      = useState(true)
const [showTutorial, setShowTutorial] = useState(false)
  const quizHook = useQuiz()

  const selectedTopic      = topics.find(t => t.id === selectedTopicId)
  const selectedTopicIndex = topics.findIndex(t => t.id === selectedTopicId)

  const {
    isRunning, error, runCode, reset,
    currentStep, totalSteps, isPlaying, speed,
    nextStep, prevStep, firstStep, lastStep, play, pause, setSpeed,
    waitingForInput, inputVariable, inputType, submitInput, cancelInput,
    getCurrentLine, getCurrentVariables, getCurrentOutput, getCurrentExplanation,
    validateChallenge,
  } = useInterpreter()

  // auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      data.user ? setUserId(data.user.id) : router.push('/auth/login')
    })
  }, [router, supabase])

  const findFirstUnlockedTopic = (list: TopicWithStatus[]) => {
    return list.find(t => t.status === 'unlocked')?.id
        || list.find(t => t.status !== 'completed')?.id
        || list[0]?.id || null
  }

  // load module + topics
  useEffect(() => {
    if (!userId) return
    async function load() {
      setLoading(true)
      try {
        const { data: md } = await supabase.from('modules').select('*').eq('id', moduleId).single()
        const topicsData   = await getTopicsByModule(moduleId)
        const allProgress  = await getUserProgress(userId!)
        const progressMap  = new Map(allProgress.map(p => [p.topic_id, p]))

        const withStatus: TopicWithStatus[] = topicsData.map(t => {
          const p      = progressMap.get(t.id)
          const status = t.order_index === 1 && !p ? 'unlocked' : (p?.status || 'locked')
          return { ...t, status, bestScore: p?.best_score || 0 }
        })

        setModule(md ? { id: md.id, title: md.title, description: md.description, topics: withStatus } : null)
        setTopics(withStatus)

        let target: string | null = null
        if (currentTopicIdFromUrl && currentTopicIdFromUrl !== 'first') {
          const t = withStatus.find(t => t.id === currentTopicIdFromUrl)
          if (t && t.status !== 'locked') target = currentTopicIdFromUrl
        }
        if (!target) target = findFirstUnlockedTopic(withStatus)
        if (target) {
          setSelectedTopicId(target)
          if (currentTopicIdFromUrl !== target && currentTopicIdFromUrl !== 'first')
            router.replace(`/learn/${moduleId}/${target}`)
        }
      } finally { setLoading(false) }
    }
    load()
  }, [moduleId, currentTopicIdFromUrl, userId, router, supabase])

  // load material
  useEffect(() => {
    if (!selectedTopicId) return
    getMaterialByTopic(selectedTopicId).then(m =>
      setMaterialContent(m?.content || '<p>Tidak ada materi untuk topik ini.</p>')
    )
  }, [selectedTopicId])

  // load challenge
  useEffect(() => {
    if (!selectedTopicId || !userId) return
    async function load() {
      const { data: c } = await supabase.from('challenges').select('*')
        .eq('topic_id', selectedTopicId!).eq('is_active', true).maybeSingle()
      setChallenge(c)
      setChallengeCode(c?.starter_code
        ? c.starter_code.replace(/\\n/g, '\n')
        : '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}')
      if (c) {
        const { data: att } = await supabase.from('user_challenge_attempts').select('passed')
          .eq('user_id', userId!).eq('topic_id', selectedTopicId!).maybeSingle()
        setChallengeCompleted(att?.passed || false)
      } else { setChallengeCompleted(false) }
    }
    load()
  }, [selectedTopicId, userId, supabase])

  // load starter code
  useEffect(() => {
    if (!selectedTopic) return
    setCurrentCode((selectedTopic.starter_code || '').replace(/\\n/g, '\n'))
    reset()
  }, [selectedTopic, reset])

  // quiz trigger
  useEffect(() => {
    if (showQuiz && selectedTopicId && userId)
      quizHook.startQuiz(selectedTopicId, moduleId, userId)
  }, [showQuiz, selectedTopicId, userId, moduleId])

  useEffect(() => {
  const tutorialShown = localStorage.getItem('learn_tutorial_shown')
  if (!tutorialShown) {
    // Beri delay sedikit agar DOM siap
    setTimeout(() => setShowTutorial(true), 500)
  }
}, [])

// Fungsi finish tutorial
const finishTutorial = (skipForever: boolean) => {
  if (skipForever) {
    localStorage.setItem('learn_tutorial_shown', 'true')
  }
  setShowTutorial(false)
}
  const handleRunCode = async (code: string) => runCode(code, 'percabangan')

  const handleChallengeValidate = async () => {
    if (!challenge) return { passed: false, errors: ['Challenge tidak ditemukan'] }
    const result = await validateChallenge(challengeCode, challenge)
    if (result.passed) {
      await supabase.from('user_challenge_attempts').upsert({
        user_id: userId, topic_id: selectedTopicId,
        code: challengeCode, passed: true, verified_at: new Date().toISOString()
      })
      setChallengeCompleted(true)
      setShowChallenge(false)
    }
    return result
  }

  const colors = moduleColors[moduleId] || moduleColors.percabangan
  const completedCount = topics.filter(t => t.status === 'completed').length
  const totalCount = topics.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleTopicClick = (t: TopicWithStatus) => {
    if (t.status === 'locked') return
    setSelectedTopicId(t.id)
    router.push(`/learn/${moduleId}/${t.id}`)
  }

  // ─── LOADING ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#030304] font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 rounded-full border-orange-500/20 border-t-orange-500 animate-spin" />
        </div>
        <p className="text-[10px] tracking-[0.4em] text-slate-600 uppercase">Memuat Modul...</p>
      </div>
    </div>
  )

  if (!module) return (
    <div className="flex items-center justify-center h-screen bg-[#030304] text-white">
      <div className="space-y-4 text-center">
        <p className="text-4xl font-black text-slate-700">404</p>
        <p className="text-sm text-slate-500">Modul tidak ditemukan</p>
        <Link href="/dashboard" className="inline-block px-5 py-2.5 rounded-xl border border-white/10 text-xs text-slate-400 hover:bg-white/5 transition">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )

  const currentVariables  = getCurrentVariables()
  const currentOutput     = getCurrentOutput()
  const currentLine       = getCurrentLine()
  const currentExplanation = getCurrentExplanation()
  const isQuizLocked      = challenge && !challengeCompleted

  return (
    <div className="h-screen flex flex-col bg-[#030304] text-slate-300 overflow-hidden font-poppins selection:bg-orange-500/20">

      {/* ══════════════════════════════════════════════════════
          HEADER — slim, informatif, tidak berisik
      ══════════════════════════════════════════════════════ */}
      <header className="h-12 flex items-center justify-between px-4 bg-[#030304] border-b border-white/[0.05] shrink-0 z-50">
        {/* kiri: back + breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard"
            className="flex items-center gap-1.5 text-slate-600 hover:text-white transition-colors group">
            <div className="flex items-center justify-center w-6 h-6 transition-colors rounded-md bg-white/5 group-hover:bg-red-500/15">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </div>
            <span className="text-[9px] font-black tracking-[0.2em] uppercase hidden sm:block">Dashboard</span>
          </Link>

          <span className="text-white/10">/</span>

          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold tracking-widest uppercase ${colors.accent}`}>
              {module.title}
            </span>
            {selectedTopic && (
              <>
                <span className="text-white/10">›</span>
                <span className="text-[10px] font-semibold text-white/70 truncate max-w-[160px]">
                  {selectedTopic.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* tengah: step trail */}
        <div className="items-center hidden gap-3 md:flex">
          <StepTrail topics={topics} activeId={selectedTopicId} />
          <span className="text-[9px] font-mono text-slate-600">
            {completedCount}/{totalCount} topik
          </span>
        </div>

        {/* kanan: progress pill + sidebar toggle */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${colors.border} ${colors.badge}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {progressPct}%
          </div>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/8 bg-white/[0.02] text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            title="Toggle sidebar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          WORKSPACE
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─────────────────────────────────────────────────
            LEFT SIDEBAR — daftar topik
        ───────────────────────────────────────────────── */}
        <aside id="learn-sidebar" className={`
          flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarOpen ? 'w-56' : 'w-0'}
        `}>
          <div className="w-56 h-full flex flex-col border-r border-white/[0.05] bg-[#040406]">

            {/* module header */}
            <div className="px-4 py-3 border-b border-white/[0.04]">
              <p className={`text-[8px] font-black tracking-[0.35em] uppercase mb-1 ${colors.accent}`}>
                Modul
              </p>
              <p className="text-xs font-bold leading-tight text-white/80">{module.title}</p>
              {/* mini progress bar */}
              <div className="mt-2 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700`}
                  style={{ width: `${progressPct}%`, background: colors.accentHex }}
                />
              </div>
            </div>

            {/* topic list */}
            <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2 custom-scrollbar">
              {topics.map((t, i) => {
                const isActive    = t.id === selectedTopicId
                const isLocked    = t.status === 'locked'
                const isCompleted = t.status === 'completed'

                return (
                  <button
                    key={t.id}
                    disabled={isLocked}
                    onClick={() => handleTopicClick(t)}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left
                      transition-all duration-150 group
                      ${isActive
                        ? `${colors.bg} border border-current ${colors.border} shadow-sm`
                        : isLocked
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-white/[0.03] border border-transparent hover:border-white/5'
                      }
                    `}
                  >
                    {/* number/status badge */}
                    <div className={`
                      w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all
                      ${isActive    ? 'bg-orange-500 border-0'
                      : isCompleted ? 'bg-emerald-500/15 border border-emerald-500/30'
                      : isLocked    ? 'bg-white/5 border border-white/5'
                                    : 'bg-white/5 border border-white/10'}
                    `}>
                      <StatusIcon status={t.status} isActive={isActive} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-semibold leading-tight truncate ${
                        isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : isLocked ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {t.title}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* ─────────────────────────────────────────────────
            CENTER — code editor (utama, paling lebar)
        ───────────────────────────────────────────────── */}
        <main id="learn-editor-area" className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* topic title bar — konteks selalu jelas */}
          {selectedTopic && (
            <div  className={`
              flex items-center justify-between px-4 py-2 border-b border-white/[0.04]
              bg-[#040406] shrink-0
            `}>
              <div className="flex items-center gap-3">
                <div className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase border ${colors.badge}`}>
                  Topik {selectedTopicIndex + 1}
                </div>
                <h2 className="text-sm font-bold text-white/85">{selectedTopic.title}</h2>
                {selectedTopic.status === 'completed' && (
                  <span className="flex items-center gap-1 text-[8px] font-black text-emerald-400 tracking-widest uppercase">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    Selesai
                  </span>
                )}
              </div>
              {selectedTopic.description && (
                <p className="text-[9px] text-slate-600 italic truncate max-w-xs hidden lg:block">
                  {selectedTopic.description}
                </p>
              )}
            </div>
          )}



          <div className="flex-1 overflow-hidden bg-[#030304]">
            <CodeEditorPanel
              starterCode={currentCode || selectedTopic?.starter_code || ''}
              onCodeChange={setCurrentCode}
              onRun={handleRunCode}
              isRunning={isRunning}
              highlightedLine={currentLine}
              onShowMaterial={() => setShowMaterial(true)}
              onShowChallenge={() => challenge && setShowChallenge(true)}
              onShowQuiz={() => setShowQuiz(true)}
              challengeCompleted={challengeCompleted}
              quizCompleted={selectedTopic?.status === 'completed'}
              hasChallenge={!!challenge}
            />
          </div>
        </main>

        {/* ─────────────────────────────────────────────────
            RIGHT PANEL — kontrol + inspeksi
        ───────────────────────────────────────────────── */}
        <aside className="w-72 shrink-0 flex flex-col border-l border-white/[0.05] bg-[#040406] overflow-hidden">

          {/* ══ ZONA 1: Playback Control ══════════════════════════════════════ */}
          <div id="learn-controls" className="shrink-0 p-4 border-b border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <p className="text-[8px] font-black tracking-[0.3em] text-orange-500 uppercase">
                Visualizer Control
              </p>
            </div>
            <PlaybackControl
              isPlaying={isPlaying} isRunning={isRunning}
              currentStep={currentStep} totalSteps={totalSteps} speed={speed}
              onPlay={play} onPause={pause}
              onPrev={prevStep} onNext={nextStep}
              onFirst={firstStep} onLast={lastStep}
              onSpeedChange={setSpeed}
            />
          </div>

          {/* ══ ZONA 2: Variable Inspector ════════════════════════════════════ */}
          <div id="learn-variables" className="flex flex-col flex-1 min-h-0 border-b border-white/[0.04]">
            <div className="px-4 py-2.5 shrink-0 flex items-center justify-between border-b border-white/[0.03]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <p className="text-[8px] font-black tracking-[0.3em] text-blue-400 uppercase">
                  Variabel
                </p>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[8px] text-blue-400 font-mono">
                {Object.keys(currentVariables).length} aktif
              </span>
            </div>
            <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
              {Object.entries(currentVariables).length > 0 ? (
                Object.entries(currentVariables).map(([k, v]) => (
                  <VarRow key={k} name={k} value={v} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-8 text-center">
                  <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <div>
                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">Memori kosong</p>
                    <p className="text-[8px] text-slate-800 mt-1">Jalankan kode untuk melihat variabel</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ══ ZONA 3: Output ════════════════════════════════════════════════ */}
          <div id="learn-output" className="flex flex-col h-36 shrink-0 border-b border-white/[0.04]">
            <div className="px-4 py-2.5 shrink-0 flex items-center gap-2 border-b border-white/[0.03]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[8px] font-black tracking-[0.3em] text-emerald-400 uppercase">
                Output Program
              </p>
            </div>
            <div className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar bg-black/20">
              {currentOutput ? (
                <pre className="font-mono text-[11px] text-emerald-400/90 leading-relaxed whitespace-pre-wrap">
                  {currentOutput}
                </pre>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-slate-800 font-mono text-[10px]">$</span>
                  <span className="text-[9px] text-slate-800 italic">Menunggu eksekusi program...</span>
                </div>
              )}
            </div>
          </div>

          {/* ══ ZONA 4: Log / Step Explanation ═══════════════════════════════ */}
          <div className="p-3 shrink-0">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-600/[0.05] border border-orange-500/15 min-h-[52px]">
              <span className="text-[8px] font-black text-orange-500/70 font-mono shrink-0 mt-0.5 tracking-wider">STEP</span>
              <p className="text-[9px] text-slate-400 leading-relaxed italic flex-1">
                {currentExplanation
                  ? currentExplanation
                  : <span className="text-slate-700">Idle — tekan ▶ untuk mulai eksekusi step-by-step</span>
                }
              </p>
            </div>
          </div>

        </aside>
      </div>

      {/* ══════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════ */}
      <MaterialModal
        isOpen={showMaterial}
        onClose={() => setShowMaterial(false)}
        title={selectedTopic?.title || 'Materi'}
        content={materialContent}
      />

      {challenge && (
        <ChallengeModal
          isOpen={showChallenge}
          challenge={challenge}
          userCode={challengeCode}
          onCodeChange={setChallengeCode}
          onValidate={handleChallengeValidate}
          onClose={() => setShowChallenge(false)}
          isCompleted={challengeCompleted}
        />
      )}

      <QuizModal
        isOpen={showQuiz}
        questions={quizHook.questions}
        currentQuestionIndex={quizHook.currentQuestionIndex}
        answers={quizHook.answers}
        totalProgress={quizHook.getProgress()}
        result={quizHook.result}
        isComplete={quizHook.isComplete}
        isLoading={quizHook.isLoading}
        onAnswer={quizHook.answerQuestion}
        onNext={quizHook.nextQuestion}
        onPrev={quizHook.prevQuestion}
        onSubmit={quizHook.submitQuiz}
        onRetry={quizHook.retryQuiz}
        onClose={() => setShowQuiz(false)}
        onNextTopic={() => {
          setShowQuiz(false)
          const next = topics.find(t => t.status === 'unlocked')
          router.push(next ? `/learn/${moduleId}/${next.id}` : `/learn/${moduleId}`)
        }}
        nextTopicTitle={topics.find(t => t.status === 'unlocked')?.title || null}
      />

      {waitingForInput && inputVariable && (
        <InputModal
          isOpen={waitingForInput}
          variableName={inputVariable}
          variableType={inputType || 'int'}
          onSubmit={submitInput}
          onCancel={cancelInput}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 max-w-sm p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 shadow-xl z-50">
          <div className="flex items-start gap-2">
            <span className="text-sm text-red-400 shrink-0">⚠</span>
            <p className="text-xs leading-relaxed text-red-400">{error}</p>
          </div>
        </div>
      )}
      {/* TUTORIAL OVERLAY */}
<LearnTutorial
  isOpen={showTutorial}
  onFinish={finishTutorial}
/>
    </div>
  )
}