'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MonacoEditor from '@monaco-editor/react'

interface ChallengeModalProps {
  isOpen: boolean
  challenge: {
    description: string
    starter_code: string
    required_keywords: string[]
    required_variables: string[]
    expected_output?: string  // ← TAMBAHKAN INI (opsional)
  }
  userCode: string
  onCodeChange: (code: string) => void
  onValidate: () => Promise<{ passed: boolean; errors: string[] }>
  onClose: () => void
  isCompleted: boolean
}

export default function ChallengeModal({
  isOpen, challenge, userCode, onCodeChange,
  onValidate, onClose, isCompleted,
}: ChallengeModalProps) {
  const [validating, setValidating] = useState(false)
  const [result, setResult] = useState<{ passed: boolean; errors: string[] } | null>(null)

  useEffect(() => { if (isOpen) setResult(null) }, [isOpen])

  const handleValidate = async () => {
    setValidating(true)
    setResult(null)
    const r = await onValidate()
    setResult(r)
    setValidating(false)
  }

  const handleReset = () => {
    onCodeChange(challenge.starter_code?.replace(/\\n/g, '\n') || '')
    setResult(null)
  }

  if (!challenge) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 12 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.97, opacity: 0, y: 12  }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-5xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden
              bg-[#040406] border border-white/[0.07]
              shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
          >

            {/* ── HEADER ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 border rounded-lg bg-orange-500/10 border-orange-500/20">
                  <span className="text-sm">⚔️</span>
                </div>
                <div>
                  <h2 className="text-xs font-black tracking-[0.2em] text-white uppercase">
                    Coding Challenge
                  </h2>
                  <p className="text-[9px] text-slate-600 mt-0.5">
                    Tulis kode sesuai instruksi untuk menyelesaikan tantangan
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isCompleted && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                    bg-emerald-500/10 border border-emerald-500/25">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="text-[8px] font-black text-emerald-400 tracking-widest uppercase">
                      Selesai
                    </span>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                    border border-white/[0.06] bg-white/[0.02]
                    text-slate-600 hover:text-white hover:bg-white/[0.05]
                    transition-all text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── BODY: 2 kolom ──────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

              {/* ── KIRI: instruksi ── */}
              <div className="w-[38%] shrink-0 flex flex-col border-r border-white/[0.05] bg-[#030304] overflow-y-auto custom-scrollbar">

                {/* deskripsi tugas */}
                <div className="p-4 border-b border-white/[0.04]">
                  <p className="text-[8px] font-black tracking-[0.3em] text-orange-500 uppercase mb-3">
                    Instruksi
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {challenge.description}
                  </p>
                </div>

                {/* 🔥🔥🔥 EXPECTED OUTPUT (BARU) 🔥🔥🔥 */}
                {challenge.expected_output && (
                  <div className="p-4 border-b border-white/[0.04] bg-emerald-500/5">
                    <p className="text-[8px] font-black tracking-[0.3em] text-emerald-400 uppercase mb-2.5">
                      🎯 Output yang Diharapkan
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-1.5 text-[11px] font-mono rounded-md
                        bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                        {challenge.expected_output}
                      </code>
                    </div>
                    <p className="text-[8px] text-emerald-600/70 mt-2">
                      Programmu harus menghasilkan output yang persis dengan di atas
                    </p>
                  </div>
                )}

                {/* required keywords */}
                {challenge.required_keywords?.length > 0 && (
                  <div className="p-4 border-b border-white/[0.04]">
                    <p className="text-[8px] font-black tracking-[0.3em] text-blue-400 uppercase mb-2.5">
                      Keyword yang Harus Ada
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {challenge.required_keywords.map(kw => (
                        <code key={kw}
                          className="px-2 py-1 text-[10px] font-mono rounded-md
                            bg-blue-500/10 border border-blue-500/20 text-blue-300">
                          {kw}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* required variables */}
                {challenge.required_variables?.length > 0 && (
                  <div className="p-4 border-b border-white/[0.04]">
                    <p className="text-[8px] font-black tracking-[0.3em] text-orange-400 uppercase mb-2.5">
                      Variabel yang Harus Ada
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {challenge.required_variables.map(v => (
                        <code key={v}
                          className="px-2 py-1 text-[10px] font-mono rounded-md
                            bg-orange-500/10 border border-orange-500/20 text-orange-300">
                          {v}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* tips */}
                <div className="p-4 mt-auto">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl
                    bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-sm shrink-0">💡</span>
                    <p className="text-[9px] text-slate-600 leading-relaxed">
                      Pastikan semua keyword dan variabel yang diminta muncul di kodemu.
                      <br />
                      <span className="text-emerald-500">Output program harus sesuai yang diharapkan.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* ── KANAN: editor + feedback ── */}
              <div className="flex flex-col flex-1 min-w-0 min-h-0">

                {/* editor label */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.05] shrink-0 bg-[#040406]">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span className="text-[9px] font-black tracking-[0.25em] text-slate-600 uppercase">
                    Solusimu
                  </span>
                </div>

                {/* monaco */}
                <div className="flex-1 min-h-0">
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="cpp"
                    theme="lgoviz-dark"
                    value={userCode}
                    onChange={v => onCodeChange(v || '')}
                    options={{
                      minimap:              { enabled: false },
                      fontSize:             13,
                      lineNumbers:          'on',
                      automaticLayout:      true,
                      fontFamily:           "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
                      fontLigatures:        true,
                      padding:              { top: 16, bottom: 16 },
                      scrollBeyondLastLine: false,
                      lineHeight:           22,
                      letterSpacing:        0.3,
                      scrollbar: {
                        verticalScrollbarSize:   4,
                        horizontalScrollbarSize: 4,
                        useShadows:              false,
                      },
                      overviewRulerLanes:   0,
                      overviewRulerBorder:  false,
                    }}
                  />
                </div>

                {/* ── FEEDBACK RESULT ── */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{   opacity: 0, y: 6 }}
                      transition={{ duration: 0.2 }}
                      className={`mx-3 mb-3 mt-0 p-3 rounded-xl border shrink-0 ${
                        result.passed
                          ? 'bg-emerald-500/8 border-emerald-500/25'
                          : 'bg-red-500/8 border-red-500/20'
                      }`}
                    >
                      {result.passed ? (
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center border rounded-lg w-7 h-7 bg-emerald-500/15 border-emerald-500/25 shrink-0">
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-emerald-400">Challenge Berhasil!</p>
                            <p className="text-[9px] text-emerald-600 mt-0.5">Quiz sekarang sudah terbuka untuk dikerjakan.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center border rounded-lg w-7 h-7 bg-red-500/15 border-red-500/20 shrink-0">
                              <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </div>
                            <p className="text-[11px] font-bold text-red-400">Belum Berhasil</p>
                          </div>
                          {result.errors.length > 0 && (
                            <ul className="pl-2 space-y-1">
                              {result.errors.map((e, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-red-500/60 text-[9px] mt-0.5 shrink-0">•</span>
                                  <span className="text-[9px] text-red-300/80 leading-relaxed">{e}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── FOOTER ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05] shrink-0 bg-[#030304]">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black
                  tracking-widest uppercase text-slate-600
                  border border-white/[0.05] hover:border-white/10 hover:text-slate-400
                  transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Reset Kode
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase
                    text-slate-600 border border-white/[0.05] hover:text-slate-400 hover:border-white/10
                    transition-all"
                >
                  Tutup
                </button>

                {isCompleted ? (
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg
                    bg-emerald-500/10 border border-emerald-500/25">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase">
                      Sudah Selesai
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    className={`flex items-center gap-2 px-5 py-1.5 rounded-lg
                      text-[9px] font-black tracking-widest uppercase transition-all ${
                        validating
                          ? 'bg-white/[0.03] border border-white/[0.06] text-slate-600 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-500 text-white border border-orange-500/50 active:scale-95 shadow-[0_0_16px_rgba(234,88,12,0.2)]'
                      }`}
                  >
                    {validating ? (
                      <>
                        <div className="w-3 h-3 border-2 rounded-full border-white/15 border-t-slate-400 animate-spin" />
                        Memeriksa...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Periksa
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}