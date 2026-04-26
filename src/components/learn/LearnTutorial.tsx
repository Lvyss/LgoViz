// src/components/learn/LearnTutorial.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TUTORIAL_STEPS: Array<{
  anchor: string | string[]
  title: string
  desc: string
  popupSide: 'right' | 'left' | 'top' | 'bottom'
}> = [
  {
    anchor: 'learn-sidebar',
    title: '📚 Daftar Topik',
    desc: 'Ini adalah daftar semua topik dalam modul ini.\n\n🔒 Topik terkunci → hanya bisa dibuka setelah menyelesaikan QUIZ pada topik sebelumnya.\n\n✓ Topik selesai → ditandai dengan centang hijau.\n\nKlik topik yang tersedia untuk berpindah materi.',
    popupSide: 'right' as const,
  },
  {
    anchor: 'learn-editor-area',
    title: '💻 Area Editor Kode',
    desc: 'Di sinilah kamu menulis dan mengedit kode C++.\n\n✨ Syntax highlighting memudahkan membaca kode.\n\nKetik atau ubah kode sesuai keinginanmu, lalu tekan tombol JALANKAN untuk melihat visualisasi.',
    popupSide: 'right' as const,
  },
  {
    anchor: 'btn-materi',
    title: '📖 Tombol Materi',
    desc: 'Klik tombol ini untuk membuka materi pembelajaran.\n\nBerisi penjelasan teori, contoh kode, dan konsep dasar yang perlu kamu pahami sebelum mengerjakan challenge atau quiz.',
    popupSide: 'bottom' as const,
  },
  {
    anchor: 'btn-challenge',
    title: '⚔️ Tombol Challenge',
    desc: 'Uji pemahamanmu dengan Coding Challenge!\n\nKamu akan diberikan tugas pemrograman yang harus diselesaikan.\n\n✅ Challenge harus diselesaikan sebelum bisa mengakses QUIZ.',
    popupSide: 'bottom' as const,
  },
  {
    anchor: 'btn-quiz',
    title: '🧠 Tombol Quiz',
    desc: 'Tes akhir untuk mengukur pemahamanmu terhadap topik ini.\n\n📝 Terdiri dari 5 soal pilihan ganda.\n\n🎯 Minimal skor 70% untuk membuka topik berikutnya!\n\n🔒 Quiz baru bisa diakses setelah menyelesaikan Challenge.',
    popupSide: 'bottom' as const,
  },
  {
    anchor: 'btn-run',
    title: '▶️ Tombol Jalankan',
    desc: 'Tombol utama untuk menjalankan kode!\n\nKode C++ yang kamu tulis akan dieksekusi step-by-step.\n\nSetelah ditekan, kamu bisa melihat visualisasi alur program di panel kanan.',
    popupSide: 'bottom' as const,
  },
  {
    anchor: 'learn-controls',
    title: '🎮 Panel Kontrol Visualisasi',
    desc: 'Kendalikan bagaimana program divisualisasikan:\n\n⏮ Awal | ◀ Sebelumnya | ▶️ PLAY/PAUSE | ▶ Berikutnya | ⏭ Akhir\n\n⚡ Atur kecepatan eksekusi (Lambat → Cepat)\n\nCocok untuk memahami alur program baris per baris!',
    popupSide: 'left' as const,
  },
  {
    anchor: 'learn-variables',
    title: '📊 Panel Variabel (Memory Inspector)',
    desc: 'Setiap kali program berjalan, panel ini menampilkan semua variabel yang aktif beserta nilainya.\n\n🔍 Perhatikan bagaimana nilai berubah saat eksekusi berlangsung!\n\nWarna berbeda untuk tipe data yang berbeda.',
    popupSide: 'left' as const,
  },
  {
    anchor: 'learn-output',
    title: '📤 Output & Penjelasan Step',
    desc: '🟢 OUTPUT: Menampilkan hasil dari perintah cout dalam program.\n\n📝 STEP: Penjelasan detail apa yang terjadi pada setiap langkah eksekusi kode.\n\nBaca penjelasan untuk memahami alur logika program!',
    popupSide: 'left' as const,
  },
]

function getRect(id: string): DOMRect | null {
  const el = document.getElementById(id)
  return el ? el.getBoundingClientRect() : null
}

function getMergedRect(ids: string[]): DOMRect | null {
  const rects = ids.map(getRect).filter(Boolean) as DOMRect[]
  if (rects.length === 0) return null
  const top = Math.min(...rects.map(r => r.top))
  const left = Math.min(...rects.map(r => r.left))
  const bottom = Math.max(...rects.map(r => r.bottom))
  const right = Math.max(...rects.map(r => r.right))
  return { top, left, bottom, right, width: right - left, height: bottom - top, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

export function LearnTutorial({
  isOpen,
  onFinish,
}: {
  isOpen: boolean
  onFinish: (skipForever: boolean) => void
}) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [winSize, setWinSize] = useState({ w: 0, h: 0 })
  const rafRef = useRef<number>(0)

  const totalSteps = TUTORIAL_STEPS.length
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
    if (isOpen) {
      rafRef.current = requestAnimationFrame(measureLoop)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [isOpen, measureLoop])

  useEffect(() => {
    if (!isOpen) {
      setStep(0)
    }
  }, [isOpen])

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1)
    } else {
      onFinish(false)
    }
  }

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1)
  }

  if (!isOpen || !rect || winSize.w === 0) return null

  const PAD = 12
  const RADIUS = 16
  const POPUP_W = 380
  const GAP = 20

  const hx = rect.left - PAD
  const hy = rect.top - PAD
  const hw = rect.width + PAD * 2
  const hh = rect.height + PAD * 2

  let popupStyle: React.CSSProperties = {}
  const side = config.popupSide

  if (side === 'right') {
    popupStyle = {
      left: Math.min(hx + hw + GAP, winSize.w - POPUP_W - 16),
      top: hy + hh / 2 - POPUP_W / 2,
      transform: 'translateY(-50%)',
    }
  } else if (side === 'left') {
    popupStyle = {
      left: Math.max(hx - POPUP_W - GAP, 16),
      top: hy + hh / 2 - POPUP_W / 2,
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
      top: Math.max(hy - 320 - GAP, 16),
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
          <mask id="learn-tutorial-mask">
            <rect width={W} height={H} fill="white" />
            <path d={hole} fill="black" />
          </mask>
        </defs>
        <rect
          width={W} height={H}
          fill="rgba(0,0,0,0.85)"
          mask="url(#learn-tutorial-mask)"
        />
        <path
          d={hole}
          fill="none"
          stroke="rgba(234,88,12,0.7)"
          strokeWidth="2.5"
          style={{ filter: 'drop-shadow(0 0 8px rgba(234,88,12,0.5))' }}
        />
      </svg>

      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
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
          background: '#0a0a0f',
          border: '1px solid rgba(234,88,12,0.4)',
          borderRadius: 24,
          padding: '20px',
          boxShadow: '0 0 60px rgba(234,88,12,0.2), 0 24px 60px rgba(0,0,0,0.8)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -32, left: -32,
            width: 100, height: 100,
            background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                height: 3, borderRadius: 99,
                width: i === step ? 28 : 6,
                background: i === step ? '#ea580c' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontSize: 9, fontWeight: 900, letterSpacing: '0.4em',
              color: '#ea580c', textTransform: 'uppercase', marginBottom: 8, textAlign: 'center',
            }}>
              Panduan Belajar — {step + 1}/{totalSteps}
            </p>
            <h4 style={{
              fontSize: 16, fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'rgba(255,255,255,0.95)', marginBottom: 10, textAlign: 'center',
            }}>
              {config.title}
            </h4>
            <p style={{
              fontSize: 11, lineHeight: 1.6,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 20, textAlign: 'left',
              whiteSpace: 'pre-wrap',
            }}>
              {config.desc}
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {step > 0 && (
                <button
                  onClick={handlePrev}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  ← Kembali
                </button>
              )}
              <button
                onClick={handleNext}
                style={{
                  flex: step > 0 ? 1 : undefined,
                  width: step === 0 ? '100%' : undefined,
                  padding: '10px 0',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                  border: 'none',
                  color: 'black',
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(234,88,12,0.4)',
                }}
              >
                {step < totalSteps - 1 ? 'Lanjut →' : 'Selesai & Mulai Belajar'}
              </button>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'center', marginTop: 14, paddingTop: 10,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ accentColor: '#ea580c', width: 10, height: 10 }}
                  onChange={e => { if (e.target.checked) onFinish(true) }}
                />
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Jangan tampilkan lagi
                </span>
              </label>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}