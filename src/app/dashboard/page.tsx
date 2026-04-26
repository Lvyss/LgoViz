'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { getAllModules, getTopicsByModule, getUserProgress } from '@/lib/supabase/queries'

// --- TYPES & CONFIG ---
type ModuleColor = 'emerald' | 'blue' | 'purple'
type Module = {
  id: string; title: string; description: string; icon: string;
  color: ModuleColor; progress: number; totalTopics: number; completedTopics: number;
}

const colorStyles: Record<ModuleColor, { text: string; glow: string; border: string; bg: string }> = {
  emerald: { text: 'text-emerald-400', glow: 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  blue:    { text: 'text-blue-400',    glow: 'bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]',    border: 'border-blue-500/40',    bg: 'bg-blue-500/10'    },
  purple:  { text: 'text-purple-400',  glow: 'bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]',  border: 'border-purple-500/40',  bg: 'bg-purple-500/10'  },
}

// Helper: cari topik pertama yang belum selesai
const getFirstUnlockedTopic = async (moduleId: string, userId: string) => {
  const topics = await getTopicsByModule(moduleId)
  const userProgress = await getUserProgress(userId)
  const progressMap = new Map(userProgress.map(p => [p.topic_id, p]))
  
  const firstUnlocked = topics.find(topic => {
    const progress = progressMap.get(topic.id)
    return progress?.status !== 'completed'
  })
  
  return firstUnlocked?.id || topics[0]?.id || 'if'
}

// --- TUTORIAL STEPS CONFIG ---
const TUTORIAL_STEPS: Array<{
  anchor: string | string[]
  title: string
  desc: string
  popupSide: 'right' | 'left' | 'top' | 'bottom'
}> = [
  {
    anchor: 'tutorial-progress',
    title: 'Ringkasan Progress',
    desc: '📊 Lihat capaian belajarmu di sini. Setiap topik yang kamu selesaikan akan meningkatkan persentase progress.',
    popupSide: 'right' as const,
  },
  {
    anchor: ['tutorial-orbital-zone', 'tutorial-nav'],
    title: 'Pemilih Modul',
    desc: '🔄 Gunakan tombol PREV / NEXT untuk memilih modul pembelajaran. Setiap modul memiliki topik-topik berbeda.',
    popupSide: 'bottom' as const,
  },
  {
    anchor: 'tutorial-description',
    title: 'Info & Mulai Belajar',
    desc: '🔗 Setelah memilih modul, klik tombol "Mulai Belajar" untuk masuk ke materi dan mulai perjalanan belajarmu.',
    popupSide: 'left' as const,
  },
]

// ─── Helper: hitung rect elemen relatif ke viewport ───────────────────────────
function getRect(id: string): DOMRect | null {
  const el = document.getElementById(id)
  return el ? el.getBoundingClientRect() : null
}

function getMergedRect(ids: string[]): DOMRect | null {
  const rects = ids.map(getRect).filter(Boolean) as DOMRect[]
  if (rects.length === 0) return null
  const top    = Math.min(...rects.map(r => r.top))
  const left   = Math.min(...rects.map(r => r.left))
  const bottom = Math.max(...rects.map(r => r.bottom))
  const right  = Math.max(...rects.map(r => r.right))
  return { top, left, bottom, right, width: right - left, height: bottom - top, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

// ─── Komponen Overlay Tutorial ─────────────────────────────────────────────────
function TutorialOverlay({
  step,
  totalSteps,
  onNext,
  onPrev,
  onFinish,
}: {
  step: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onFinish: (skipForever: boolean) => void
}) {
  const PAD = 12
  const RADIUS = 16

  const [rect, setRect] = useState<DOMRect | null>(null)
  const [winSize, setWinSize] = useState({ w: 0, h: 0 })
  const rafRef = useRef<number>(0)

  const config = TUTORIAL_STEPS[step]

  const measureLoop = useCallback(() => {
    const r = Array.isArray(config.anchor)
      ? getMergedRect(config.anchor)
      : getRect(config.anchor)
    setRect(r)
    setWinSize({ w: window.innerWidth, h: window.innerHeight })
    rafRef.current = requestAnimationFrame(measureLoop)
  }, [config.anchor])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(measureLoop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [measureLoop])

  if (!rect || winSize.w === 0) return null

  const hx = rect.left - PAD
  const hy = rect.top  - PAD
  const hw = rect.width  + PAD * 2
  const hh = rect.height + PAD * 2

  const POPUP_W = 340
  const POPUP_H = 260
  const GAP = 20

  let popupStyle: React.CSSProperties = {}
  const side = config.popupSide

  if (side === 'right') {
    popupStyle = {
      left: Math.min(hx + hw + GAP, winSize.w - POPUP_W - 16),
      top: hy + hh / 2,
      transform: 'translateY(-50%)',
    }
  } else if (side === 'left') {
    popupStyle = {
      left: Math.max(hx - POPUP_W - GAP, 16),
      top: hy + hh / 2,
      transform: 'translateY(-50%)',
    }
  } else if (side === 'bottom') {
    popupStyle = {
      left: hx + hw / 2 - POPUP_W / 2,
      top: hy + hh + GAP,
    }
  } else {
    popupStyle = {
      left: hx + hw / 2 - POPUP_W / 2,
      top: Math.max(hy - POPUP_H - GAP, 16),
    }
  }

  if (typeof popupStyle.left === 'number') {
    popupStyle.left = Math.max(16, Math.min(popupStyle.left, winSize.w - POPUP_W - 16))
  }

  const W = winSize.w
  const H = winSize.h
  const r = RADIUS

  const hole = `
    M ${hx + r} ${hy}
    L ${hx + hw - r} ${hy}
    Q ${hx + hw} ${hy}   ${hx + hw} ${hy + r}
    L ${hx + hw} ${hy + hh - r}
    Q ${hx + hw} ${hy + hh} ${hx + hw - r} ${hy + hh}
    L ${hx + r} ${hy + hh}
    Q ${hx} ${hy + hh} ${hx} ${hy + hh - r}
    L ${hx} ${hy + r}
    Q ${hx} ${hy} ${hx + r} ${hy}
    Z
  `

  const arrowStyle: React.CSSProperties = { position: 'absolute' }
  if (side === 'right') {
    Object.assign(arrowStyle, { left: -8, top: '50%', transform: 'translateY(-50%) rotate(45deg)', borderLeft: 'none', borderBottom: 'none' })
  } else if (side === 'left') {
    Object.assign(arrowStyle, { right: -8, top: '50%', transform: 'translateY(-50%) rotate(45deg)', borderRight: 'none', borderTop: 'none' })
  } else if (side === 'bottom') {
    Object.assign(arrowStyle, { top: -8, left: '50%', transform: 'translateX(-50%) rotate(45deg)', borderBottom: 'none', borderRight: 'none' })
  } else {
    Object.assign(arrowStyle, { bottom: -8, left: '50%', transform: 'translateX(-50%) rotate(45deg)', borderTop: 'none', borderLeft: 'none' })
  }

  return (
    <>
      <svg
        style={{
          position: 'fixed', inset: 0,
          width: '100%', height: '100%',
          zIndex: 9000,
          pointerEvents: 'none',
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tutorial-mask">
            <rect width={W} height={H} fill="white" />
            <path d={hole} fill="black" />
          </mask>
        </defs>
        <rect
          width={W} height={H}
          fill="rgba(0,0,0,0.72)"
          mask="url(#tutorial-mask)"
        />
        <path
          d={hole}
          fill="none"
          stroke="rgba(234,88,12,0.6)"
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0 0 8px rgba(234,88,12,0.5))' }}
        />
      </svg>

      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          ...popupStyle,
          width: POPUP_W,
          zIndex: 9100,
        }}
      >
        <div
          style={{
            ...arrowStyle,
            width: 14, height: 14,
            background: '#0a0a0a',
            border: '1px solid rgba(234,88,12,0.4)',
            zIndex: 1,
          }}
        />

        <div style={{
          background: '#0a0a0a',
          border: '1px solid rgba(234,88,12,0.35)',
          borderRadius: 20,
          padding: '24px 24px 20px',
          boxShadow: '0 0 60px rgba(234,88,12,0.2), 0 24px 60px rgba(0,0,0,0.8)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -32, left: -32,
            width: 100, height: 100,
            background: 'radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                height: 3, borderRadius: 99,
                width: i === step ? 28 : 8,
                background: i === step ? '#ea580c' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <p style={{
              fontSize: 9, fontWeight: 900, letterSpacing: '0.4em',
              color: '#ea580c', textTransform: 'uppercase', marginBottom: 8,
            }}>
              Panduan — {step + 1}/{totalSteps}
            </p>
            <h4 style={{
              fontSize: 18, fontWeight: 900, fontStyle: 'italic',
              letterSpacing: '-0.03em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)', marginBottom: 10,
            }}>
              {config.title}
            </h4>
            <p style={{
              fontSize: 12, lineHeight: 1.7,
              color: 'rgba(255,255,255,0.55)',
              marginBottom: 20,
            }}>
              {config.desc}
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              {step > 0 && (
                <button
                  onClick={onPrev}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 12,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', fontSize: 10, fontWeight: 900,
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  ← Kembali
                </button>
              )}
              <button
                onClick={step < totalSteps - 1 ? onNext : () => onFinish(true)}
                style={{
                  flex: step > 0 ? 1 : undefined,
                  width: step === 0 ? '100%' : undefined,
                  padding: '11px 0', borderRadius: 12,
                  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                  border: 'none',
                  color: 'black', fontSize: 10, fontWeight: 900,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(234,88,12,0.35)',
                }}
              >
                {step < totalSteps - 1 ? 'Lanjut →' : 'Mulai Belajar'}
              </button>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 14, paddingTop: 12,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ accentColor: '#ea580c', width: 11, height: 11 }}
                  onChange={e => { if (e.target.checked) onFinish(true) }}
                />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                  Jangan tampilkan lagi
                </span>
              </label>
              <button
                onClick={() => onFinish(false)}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
                  fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
                }}
              >
                Lewati
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function NeuralDashboardFixed() {
  const router = useRouter()
  const supabase = createClient()

  const [modules, setModules]         = useState<Module[]>([])
  const [loading, setLoading]         = useState(true)
  const [totalStats, setTotalStats]   = useState({ percent: 0, completed: 0, total: 0 })
  const [activeIndex, setActiveIndex] = useState(0)

  const [showTutorial, setShowTutorial]   = useState(false)
  const [tutorialStep, setTutorialStep]   = useState(0)

  useEffect(() => {
    const checkTutorial = () => {
      const skipped = localStorage.getItem('skip_neural_tutorial')
      if (!skipped) {
        setTutorialStep(0)
        setShowTutorial(true)
      }
    }
    checkTutorial()
    window.addEventListener('focus', checkTutorial)
    return () => window.removeEventListener('focus', checkTutorial)
  }, [])

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const modulesData  = await getAllModules()
      const userProgress = await getUserProgress(user.id)
      const progressMap  = new Map(userProgress.map(p => [p.topic_id, p]))

      let globalComp = 0, globalTot = 0
      const processed = await Promise.all(modulesData.map(async (m) => {
        const topics = await getTopicsByModule(m.id)
        const comp   = topics.filter(t => progressMap.get(t.id)?.status === 'completed').length
        globalComp += comp; globalTot += topics.length
        return {
          id: m.id, title: m.title, description: m.description,
          icon:  m.id === 'percabangan' ? '🔀' : m.id === 'perulangan' ? '🔄' : '📊',
          color: (m.id === 'percabangan' ? 'emerald' : m.id === 'perulangan' ? 'blue' : 'purple') as ModuleColor,
          progress:        topics.length > 0 ? Math.round((comp / topics.length) * 100) : 0,
          totalTopics:     topics.length,
          completedTopics: comp,
        }
      }))

      setModules(processed)
      setTotalStats({ percent: Math.round((globalComp / globalTot) * 100), completed: globalComp, total: globalTot })
      setLoading(false)
    }
    loadDashboard()
  }, [router, supabase.auth])

  const handlePrev = () => setActiveIndex(p => (p > 0 ? p - 1 : modules.length - 1))
  const handleNext = () => setActiveIndex(p => (p < modules.length - 1 ? p + 1 : 0))

  const finishTutorial = (dontShowAgain: boolean) => {
    if (dontShowAgain) localStorage.setItem('skip_neural_tutorial', 'true')
    setShowTutorial(false)
    setTutorialStep(0)
  }

  const currentActiveModule = modules[activeIndex]

  if (loading) return (
    <div className="flex items-center justify-center h-screen font-mono italic tracking-widest text-orange-500 uppercase bg-black">
      Memuat dashboard...
    </div>
  )

  return (
    <div className="-mt-16 h-screen w-full bg-[#010101] text-white overflow-hidden relative font-poppins selection:bg-orange-500/30">

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ y: ['-50%', '0%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-full h-[200%] opacity-[0.15]"
          style={{ background: `repeating-linear-gradient(0deg, transparent 0%, rgba(234, 88, 12, 0.08) 5%, transparent 10%)` }}
        />
        <div className="absolute inset-0 flex justify-around px-10">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.4, 0.1, 0.6, 0],
                height: i % 2 === 0 ? ['15%','45%','25%'] : ['40%','20%','70%'],
              }}
              transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.7, times: [0, 0.1, 0.2, 0.3, 1] }}
              className="w-[1px] bg-gradient-to-b from-transparent via-orange-600/30 to-transparent relative"
              style={{ marginTop: `${(i * 7) % 30}%` }}
            >
              <div className="absolute inset-0 w-full bg-white/10 blur-[1px]" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative h-full mx-auto max-w-[76rem]">

        {/* 1. HEADER */}
        <div className="absolute top-16 left-0 right-0 flex justify-between items-start z-[100]">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h1 className="text-2xl italic font-black leading-none tracking-tighter uppercase text-white/90">
              PROGRESS<span className="text-orange-500">_</span>BELAJAR
            </h1>
            <p className="text-[8px] tracking-[0.5em] text-gray-700 font-bold uppercase mt-2">Pantau Capaian & Pilih Modul</p>
          </motion.div>
        </div>

        {/* 2. PROGRESS CORE */}
        <div
          id="tutorial-progress"
          className="absolute top-[350px] left-0 -translate-y-1/2 z-50"
        >
          <div className="relative transition-all duration-700">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[140%] bg-gradient-to-b from-transparent via-orange-500/10 to-transparent blur-sm -z-10" />
            <div className="w-[420px] h-[420px] rounded-full flex items-center justify-center relative overflow-hidden bg-[#080808] border border-white/[0.04] shadow-[30px_0_100px_rgba(0,0,0,0.9),inset_0_0_80px_rgba(0,0,0,1)]">
              <div className="absolute inset-5 rounded-full border border-orange-950/20 bg-[#040404] shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]" />
              <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[0.88] z-10">
                <circle cx="210" cy="210" r="185" fill="transparent" stroke="rgba(255,255,255,0.01)" strokeWidth="1" />
                <motion.circle
                  cx="210" cy="210" r="185"
                  fill="transparent" stroke="#ea580c" strokeWidth="6"
                  strokeDasharray="1162"
                  initial={{ strokeDashoffset: 1162 }}
                  animate={{ strokeDashoffset: 1162 - (1162 * totalStats.percent) / 100 }}
                  strokeLinecap="round"
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                  className="drop-shadow-[0_0_15px_rgba(234,88,12,0.5)]"
                />
              </svg>
              <div className="relative z-20 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}>
                  <span className="block text-6xl italic font-black leading-none tracking-tighter text-white opacity-90">
                    {totalStats.percent}<span className="text-2xl font-light text-orange-500">%</span>
                  </span>
                  <span className="text-[7px] tracking-[0.5em] text-orange-600 font-black uppercase mt-3 block">Total Capaian</span>
                </motion.div>
                <div className="w-10 h-px mt-6 mb-6 bg-orange-900/30" />
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center">
                    <p className="text-[6px] text-gray-600 font-bold uppercase tracking-[0.4em] mb-1">Topik Selesai</p>
                    <p className="text-xl italic font-black tracking-tighter text-white/80">
                      {totalStats.completed} <span className="text-xs font-normal text-gray-800">/ {totalStats.total}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" />
                    <p className="text-xl italic font-black text-orange-500">Modul {activeIndex + 1}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ORBITAL SELECTOR */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full pointer-events-auto">
            {modules.map((module, index) => {
              let diff = index - activeIndex
              if (diff >  modules.length / 2) diff -= modules.length
              if (diff < -modules.length / 2) diff += modules.length
              const angle  = diff * 42
              const xBase  = 260
              const xCurve = Math.abs(diff) * 70
              return (
                <motion.div
                  key={module.id}
                  animate={{
                    rotate: angle, opacity: 1 - Math.abs(diff) * 0.5,
                    scale: index === activeIndex ? 1.1 : 0.8,
                    filter: `blur(${Math.abs(diff) * 4}px)`,
                    x: xBase + xCurve, zIndex: 50 - Math.abs(diff),
                  }}
                  transition={{ type: 'spring', stiffness: 60, damping: 20 }}
                  style={{ originX: '-250px', originY: '50%' }}
                  className="absolute top-[42%] left-[18%] -translate-y-1/2"
                >
                  <div>
                    <div
                      id={index === activeIndex ? 'tutorial-orbital-zone' : undefined}
                      className={`w-40 h-40 rounded-full bg-[#0a0a0a] border-2 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] cursor-pointer group relative overflow-hidden ${index === activeIndex ? colorStyles[module.color].border : 'border-white/5'}`}
                    >
                      <div className={`absolute inset-0 ${colorStyles[module.color].bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <span className="relative z-10 mb-2 text-3xl">{module.icon}</span>
                      <h4 className="relative z-10 text-[9px] font-black uppercase tracking-[0.15em] leading-tight max-w-[100px]">{module.title}</h4>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* 4. DESCRIPTION POPUP */}
        <div
          id="tutorial-description"
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[360px] z-[50]"
        >
          <AnimatePresence mode="wait">
            {currentActiveModule && (
              <motion.div
                key={currentActiveModule.id}
                initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                className="bg-black/40 border border-white/5 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
              >
                <div className={`absolute -top-12 -right-12 w-32 h-32 blur-[60px] opacity-20 ${colorStyles[currentActiveModule.color].glow}`} />
                <div className="relative z-10">
                  <span className={`text-[9px] font-black tracking-[0.4em] uppercase mb-4 block ${colorStyles[currentActiveModule.color].text}`}>Detail Modul</span>
                  <h3 className="mb-4 text-3xl italic font-black leading-none tracking-tighter uppercase text-white/90">{currentActiveModule.title}</h3>
                  <p className="mb-8 text-xs italic font-medium leading-relaxed text-gray-500">"{currentActiveModule.description}"</p>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Progress</span>
                      <span className="text-xl italic font-black">{currentActiveModule.progress}%</span>
                    </div>
                    <div className="w-full h-1 overflow-hidden border rounded-full bg-white/5 border-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${currentActiveModule.progress}%` }} className={`h-full ${colorStyles[currentActiveModule.color].glow} bg-current transition-all duration-1000`} />
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-500">
                      <span>Topik: {currentActiveModule.completedTopics}/{currentActiveModule.totalTopics}</span>
                      <span className={currentActiveModule.progress === 100 ? 'text-emerald-400' : 'text-gray-500'}>
                        {currentActiveModule.progress === 100 ? '✓ Selesai' : 'Sedang Berjalan'}
                      </span>
                    </div>
                  </div>
                  <Link href={`/learn/${currentActiveModule.id}/first`}>
                    <button className={`mt-10 w-full py-4 rounded-2xl border ${colorStyles[currentActiveModule.color].border} text-[9px] font-black tracking-[0.3em] uppercase hover:bg-white/10 transition-all`}>
                      {currentActiveModule.progress === 0 ? 'Mulai Belajar' : currentActiveModule.progress === 100 ? 'Ulangi Materi' : 'Lanjutkan Belajar'}
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. NAVIGATION CONTROLS */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[120] flex flex-col items-center gap-5">
          <div id="tutorial-nav" className="flex items-center gap-10 p-2 px-8 border rounded-full bg-black/60 border-white/10 backdrop-blur-md">
            <button onClick={handlePrev} className="text-gray-600 hover:text-orange-500 transition-colors font-black text-[10px] tracking-widest">SEBELUMNYA</button>
            <div className="flex gap-2">
              {modules.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? 'bg-orange-500 w-10' : 'bg-white/10 w-2'}`} />
              ))}
            </div>
            <button onClick={handleNext} className="text-gray-600 hover:text-orange-500 transition-colors font-black text-[10px] tracking-widest">SELANJUTNYA</button>
          </div>
          <p className="text-[8px] text-gray-700 tracking-widest uppercase">Gunakan tombol untuk memilih modul</p>
        </div>

      </div>

      <AnimatePresence>
        {showTutorial && (
          <TutorialOverlay
            step={tutorialStep}
            totalSteps={TUTORIAL_STEPS.length}
            onNext={() => setTutorialStep(s => s + 1)}
            onPrev={() => setTutorialStep(s => s - 1)}
            onFinish={finishTutorial}
          />
        )}
      </AnimatePresence>
    </div>
  )
}