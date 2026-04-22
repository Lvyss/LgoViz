'use client'

import { useEffect } from 'react'

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
}

export default function MaterialModal({ isOpen, onClose, title, content }: MaterialModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

return (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
    {/* 🌫 Ultra-Glass Backdrop */}
    <div
      className="absolute inset-0 bg-[#050508]/60 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
    />

    {/* 🏗 Modal Container */}
    <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0a0a0f] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col transition-all duration-500 scale-100">
      
      {/* 🎇 Header: Glow & Glass */}
      <div className="relative flex items-center justify-between px-8 py-5 border-b border-white/[0.05] bg-white/[0.01]">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-10 w-32 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 border shadow-inner text-emerald-400 bg-emerald-500/10 border-emerald-500/20 rounded-xl">
            <span className="text-lg font-bold">?</span>
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest text-white uppercase">{title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Documentation_Module / v1.0</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 transition-all border group text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border-white/5"
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 📖 Content Area: Enhanced Readability */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gradient-to-b from-transparent to-white/[0.01]">
        <div
          className="prose prose-invert prose-sm max-w-none 
            prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
            prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-[14px]
            prose-li:text-slate-400 prose-strong:text-emerald-400
            prose-code:text-emerald-300 prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-[#050508] prose-pre:border prose-pre:border-white/[0.05] prose-pre:rounded-xl prose-pre:p-5 shadow-sm"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* 🏁 Footer: Clean Action */}
      <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-white/[0.05] bg-[#050508]/50 backdrop-blur-sm">
        <p className="hidden sm:block text-[10px] font-medium text-slate-600 mr-auto tracking-tight italic">
          Press <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-400 not-italic">ESC</kbd> to close terminal
        </p>
        
        <button
          onClick={onClose}
          className="px-8 py-2.5 text-[11px] font-black tracking-[0.2em] text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 uppercase"
        >
          Selesai_Membaca
        </button>
      </div>
    </div>
  </div>
)}