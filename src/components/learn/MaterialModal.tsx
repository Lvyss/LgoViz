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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* modal */}
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden
              bg-[#040406] border border-white/[0.07]
              shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
          >

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] shrink-0 bg-[#040406]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center border w-9 h-9 rounded-xl bg-orange-500/10 border-orange-500/20 shrink-0">
                  <span className="text-base">📖</span>
                </div>
                <div>
                  <h2 className="text-xs font-black tracking-[0.2em] text-white uppercase">
                    {title}
                  </h2>
                  <p className="text-[9px] text-slate-600 mt-0.5 font-mono">
                    Material_Reference
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                  border border-white/[0.06] bg-white/[0.02]
                  text-slate-600 hover:text-white hover:bg-white/[0.05]
                  transition-all text-sm"
              >
                ✕
              </button>
            </div>

            {/* ── CONTENT ── PAKE STYLE PREVIEW MODE ADMIN ───────────────── */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-8 py-8">
                <div 
                  className="
                    w-full
                    text-gray-300 
                    break-words 
                    [word-break:break-word]
                    
                    /* Headings */
                    [&>h1]:text-xl [&>h1]:md:text-2xl [&>h1]:font-black [&>h1]:italic [&>h1]:tracking-tighter [&>h1]:uppercase [&>h1]:text-white [&>h1]:mb-4 [&>h1]:mt-0
                    [&>h2]:text-lg [&>h2]:md:text-xl [&>h2]:font-black [&>h2]:italic [&>h2]:tracking-tighter [&>h2]:uppercase [&>h2]:text-white [&>h2]:mb-4 [&>h2]:mt-8
                    [&>h3]:text-base [&>h3]:md:text-lg [&>h3]:font-bold [&>h3]:text-orange-500 [&>h3]:mb-3 [&>h3]:mt-6
                    [&>h4]:text-sm [&>h4]:font-semibold [&>h4]:text-gray-400 [&>h4]:mb-2 [&>h4]:mt-4
                    
                    /* Paragraph */
                    [&>p]:text-sm [&>p]:text-gray-400 [&>p]:mb-4 [&>p]:leading-relaxed
                    
                    /* Lists */
                    [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-4 [&>ul]:text-sm [&>ul]:text-gray-400
                    [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-4 [&>ol]:text-sm [&>ol]:text-gray-400
                    [&>li]:mb-1
                    
                    /* Blockquote */
                    [&>blockquote]:border-l-4 [&>blockquote]:border-orange-500 [&>blockquote]:pl-4 [&>blockquote]:py-1 [&>blockquote]:my-4 [&>blockquote]:text-gray-400 [&>blockquote]:text-sm [&>blockquote]:italic [&>blockquote]:bg-white/[0.02] [&>blockquote]:rounded-r-xl
                    
                    /* Inline code */
                    [&>p>code]:text-[11px] [&>p>code]:font-mono [&>p>code]:text-orange-300 [&>p>code]:bg-orange-500/10 [&>p>code]:px-1.5 [&>p>code]:py-0.5 [&>p>code]:rounded-md
                    
                    /* Code blocks */
                    [&>pre]:bg-black/60 [&>pre]:p-4 [&>pre]:md:p-6 [&>pre]:rounded-2xl [&>pre]:border [&>pre]:border-white/5 [&>pre]:my-6 
                    [&>pre]:overflow-x-auto [&>pre]:max-w-full
                    [&>pre>code]:text-[10px] [&>pre>code]:md:text-xs [&>pre>code]:font-mono [&>pre>code]:text-orange-300 [&>pre>code]:whitespace-pre-wrap [&>pre>code]:break-all
                    
                    /* Images */
                    [&>img]:rounded-xl [&>img]:border [&>img]:border-white/10 [&>img]:my-4 [&>img]:max-w-full
                    
                    /* Horizontal rule */
                    [&>hr]:border-white/10 [&>hr]:my-8
                    
                    /* Links */
                    [&>a]:text-orange-500 [&>a]:hover:text-orange-400 [&>a]:underline [&>a]:underline-offset-4 [&>a]:transition-all
                    
                    /* Tables */
                    [&>table]:w-full [&>table]:text-sm [&>table]:border-collapse [&>table]:my-4
                    [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:py-2 [&>table>thead>tr>th]:px-3 [&>table>thead>tr>th]:border-b [&>table>thead>tr>th]:border-white/10 [&>table>thead>tr>th]:font-semibold [&>table>thead>tr>th]:text-gray-300
                    [&>table>tbody>tr>td]:py-2 [&>table>tbody>tr>td]:px-3 [&>table>tbody>tr>td]:border-b [&>table>tbody>tr>td]:border-white/5 [&>table>tbody>tr>td]:text-gray-400
                    
                    /* Strong & Em */
                    [&>strong]:text-white [&>strong]:font-bold
                    [&>em]:text-orange-400 [&>em]:not-italic
                  "
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>

            {/* ── FOOTER ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.05] shrink-0 bg-[#030304]">
              <p className="text-[8px] text-slate-700 font-mono hidden sm:block">
                Tekan{' '}
                <kbd className="px-1.5 py-0.5 rounded-md border border-white/[0.08] bg-white/[0.03] text-slate-600 font-mono text-[8px]">
                  ESC
                </kbd>
                {' '}untuk menutup
              </p>

              <button
                onClick={onClose}
                className="ml-auto flex items-center gap-2 px-6 py-2 rounded-xl
                  bg-orange-600 hover:bg-orange-500 text-white
                  text-[10px] font-black tracking-[0.2em] uppercase
                  border border-orange-500/50 active:scale-95
                  shadow-[0_0_20px_rgba(234,88,12,0.2)]
                  transition-all duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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