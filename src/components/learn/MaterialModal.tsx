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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#121218] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 text-sm font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
              ?
            </span>
            <div>
              <h2 className="text-lg font-medium text-white">{title}</h2>
              <p className="text-xs text-gray-500">Materi Pembelajaran</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors hover:text-white hover:bg-white/10 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 max-h-[calc(85vh-80px)]">
          <div
            className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-code:text-emerald-400 prose-pre:bg-[#0a0a0f] prose-pre:border prose-pre:border-white/10"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}