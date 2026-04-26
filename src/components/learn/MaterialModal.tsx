'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
}

export default function MaterialModal({ isOpen, onClose, title, content }: MaterialModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">

          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* modal */}
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 12 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.97, opacity: 0, y: 12  }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden
              bg-[#040406] border border-white/[0.07]
              shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
          >

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 border rounded-lg bg-blue-500/10 border-blue-500/20 shrink-0">
                  <span className="text-sm">📖</span>
                </div>
                <div>
                  <h2 className="text-xs font-black tracking-[0.2em] text-white uppercase">
                    {title}
                  </h2>
                  <p className="text-[9px] text-slate-600 mt-0.5">
                    Baca dan pahami materi sebelum mengerjakan challenge
                  </p>
                </div>
              </div>

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

            {/* ── CONTENT ─────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div
                className="
                  px-6 py-5
                  prose prose-invert prose-sm max-w-none

                  prose-headings:font-black
                  prose-headings:tracking-tight
                  prose-headings:text-white/90
                  prose-headings:mb-2

                  prose-h1:text-lg prose-h1:mt-0
                  prose-h2:text-base prose-h2:mt-6
                  prose-h3:text-sm prose-h3:mt-4 prose-h3:text-slate-300

                  prose-p:text-[13px]
                  prose-p:text-slate-400
                  prose-p:leading-[1.8]
                  prose-p:my-3

                  prose-li:text-[13px]
                  prose-li:text-slate-400
                  prose-li:leading-relaxed
                  prose-li:my-1

                  prose-ul:my-3 prose-ul:pl-4
                  prose-ol:my-3 prose-ol:pl-4

                  prose-strong:text-slate-200
                  prose-strong:font-bold

                  prose-em:text-slate-400
                  prose-em:not-italic
                  prose-em:text-orange-400/80

                  prose-code:text-[11px]
                  prose-code:font-mono
                  prose-code:text-orange-300
                  prose-code:bg-orange-500/8
                  prose-code:border prose-code:border-orange-500/15
                  prose-code:px-1.5 prose-code:py-0.5
                  prose-code:rounded-md
                  prose-code:before:content-none
                  prose-code:after:content-none

                  prose-pre:bg-[#030304]
                  prose-pre:border prose-pre:border-white/[0.06]
                  prose-pre:rounded-xl
                  prose-pre:p-4
                  prose-pre:my-4
                  prose-pre:text-[12px]
                  prose-pre:leading-relaxed

                  prose-blockquote:border-l-2
                  prose-blockquote:border-orange-500/40
                  prose-blockquote:pl-4
                  prose-blockquote:italic
                  prose-blockquote:text-slate-500
                  prose-blockquote:my-4

                  prose-hr:border-white/[0.06]
                  prose-hr:my-6

                  prose-table:text-[12px]
                  prose-th:text-slate-300 prose-th:font-bold prose-th:py-2 prose-th:px-3
                  prose-td:text-slate-400 prose-td:py-2 prose-td:px-3
                  prose-thead:border-b prose-thead:border-white/[0.08]
                  prose-tr:border-b prose-tr:border-white/[0.04]
                "
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>

            {/* ── FOOTER ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05] shrink-0 bg-[#030304]">
              <p className="text-[8px] text-slate-700 hidden sm:block">
                Tekan{' '}
                <kbd className="px-1.5 py-0.5 rounded-md border border-white/[0.08] bg-white/[0.03]
                  text-slate-600 font-mono text-[8px]">
                  ESC
                </kbd>
                {' '}untuk menutup
              </p>

              <button
                onClick={onClose}
                className="ml-auto flex items-center gap-2 px-5 py-1.5 rounded-lg
                  bg-orange-600 hover:bg-orange-500 text-white
                  text-[9px] font-black tracking-widest uppercase
                  border border-orange-500/50 active:scale-95
                  shadow-[0_0_16px_rgba(234,88,12,0.2)]
                  transition-all duration-150"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                Selesai Baca
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}