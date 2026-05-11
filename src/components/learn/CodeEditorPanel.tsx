'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#030304]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 rounded-full border-orange-500/15 border-t-orange-500 animate-spin" />
        </div>
        <span className="text-[9px] font-black tracking-[0.4em] text-slate-700 uppercase">
          Memuat Editor...
        </span>
      </div>
    </div>
  ),
})

interface CodeEditorPanelProps {
  starterCode: string
  onCodeChange?: (code: string) => void
  onRun?: (code: string) => void
  isRunning?: boolean
  highlightedLine?: number
  onShowMaterial?: () => void
  onShowChallenge?: () => void
  onShowQuiz?: () => void
  challengeCompleted?: boolean
  quizCompleted?: boolean
  isChallengeMode?: boolean
  hasChallenge?: boolean
  isMobile?: boolean
}

export default function CodeEditorPanel({
  starterCode,
  onCodeChange,
  onRun,
  isRunning = false,
  highlightedLine = 0,
  onShowMaterial,
  onShowChallenge,
  onShowQuiz,
  challengeCompleted = false,
  quizCompleted = false,
  isChallengeMode = false,
  hasChallenge = false,
  isMobile = false,
}: CodeEditorPanelProps) {
  const [code, setCode] = useState(starterCode)
  const editorRef       = useRef<any>(null)
  const decorationRef   = useRef<string[]>([])
  const lastLineRef     = useRef<number>(0)

  useEffect(() => {
    setCode(starterCode)
    lastLineRef.current = 0
  }, [starterCode])

  const clearDecorations = () => {
    if (editorRef.current && decorationRef.current.length > 0) {
      try {
        decorationRef.current = editorRef.current.deltaDecorations(decorationRef.current, [])
      } catch { /* silent */ }
    }
  }

  useEffect(() => {
    if (!editorRef.current) return
    const tid = setTimeout(() => {
      if (lastLineRef.current === highlightedLine) return
      lastLineRef.current = highlightedLine
      clearDecorations()
      if (highlightedLine <= 0) return

      const editor    = editorRef.current
      const model     = editor.getModel()
      if (!model) return
      const lineCount = model.getLineCount()
      const target    = Math.min(Math.max(highlightedLine, 1), lineCount)

      try {
        decorationRef.current = editor.deltaDecorations([], [{
          range: {
            startLineNumber: target, startColumn: 1,
            endLineNumber: target,   endColumn: model.getLineMaxColumn(target),
          },
          options: {
            isWholeLine: true,
            className: 'lgoviz-highlighted-line',
            glyphMarginClassName: 'lgoviz-highlighted-glyph',
          },
        }])
        editor.revealLineInCenterIfOutsideViewport(target)
      } catch { /* silent */ }
    }, 50)
    return () => clearTimeout(tid)
  }, [highlightedLine])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    const styleId = 'lgoviz-editor-styles'
    if (!document.getElementById(styleId)) {
      const s = document.createElement('style')
      s.id = styleId
      s.textContent = `
        .lgoviz-highlighted-line {
          background-color: rgba(249,115,22,0.08) !important;
          border-left: 2px solid rgba(249,115,22,0.7) !important;
        }
        .lgoviz-highlighted-glyph {
          background: #f97316 !important;
          width: 3px !important;
          margin-left: 7px;
          border-radius: 99px;
          box-shadow: 0 0 8px rgba(249,115,22,0.6);
        }
      `
      document.head.appendChild(s)
    }

    monaco.editor.defineTheme('lgoviz-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment',   foreground: '3d4f5c', fontStyle: 'italic' },
        { token: 'keyword',   foreground: '5b9bd5', fontStyle: 'bold'   },
        { token: 'number',    foreground: 'a8c4a0' },
        { token: 'string',    foreground: 'c08c70' },
        { token: 'operator',  foreground: '8899aa' },
        { token: 'type',      foreground: '4ec9b0' },
        { token: 'delimiter', foreground: '566370' },
      ],
      colors: {
        'editor.background':                  '#030304',
        'editor.foreground':                  '#94a3b8',
        'editor.lineHighlightBackground':     '#0a0a0f',
        'editorLineNumber.foreground':        '#222836',
        'editorLineNumber.activeForeground':  '#ea580c',
        'editor.selectionBackground':         '#1e3a5260',
        'editorIndentGuide.background':       '#0d1117',
        'editorIndentGuide.activeBackground': '#1e293b',
        'editorCursor.foreground':            '#ea580c',
        'editorGutter.background':            '#030304',
        'editorWidget.background':            '#0a0a0f',
        'input.background':                   '#0a0a0f',
        'focusBorder':                        '#ea580c40',
        'scrollbar.shadow':                   '#00000000',
        'scrollbarSlider.background':         '#1e293b60',
        'scrollbarSlider.hoverBackground':    '#1e293b',
      },
    })
    monaco.editor.setTheme('lgoviz-dark')
  }

  const handleCodeChange = (value: string | undefined) => {
    const v = value || ''
    setCode(v)
    onCodeChange?.(v)
    lastLineRef.current = 0
    clearDecorations()
  }

  const isQuizLocked = hasChallenge && !challengeCompleted && !quizCompleted

  return (
    <div className="flex flex-col h-full bg-[#030304] overflow-hidden">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.05] shrink-0 bg-[#040406] gap-2">

        {/* Kiri: mode label + active line */}
        <div className="flex items-center min-w-0 gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${isChallengeMode ? 'bg-purple-400' : 'bg-orange-500'}`} />
            <span className="text-[9px] font-black tracking-[0.25em] text-slate-600 uppercase hidden sm:block">
              {isChallengeMode ? 'Challenge' : 'Editor'}
            </span>
          </div>

          {highlightedLine > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/8 border border-orange-500/20">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
              </span>
              <span className="text-[8px] font-mono font-black text-orange-400">
                {isMobile ? `L${highlightedLine}` : `Baris ${highlightedLine}`}
              </span>
            </div>
          )}
        </div>

        {/* Kanan: action buttons */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Materi */}
          <button
            id="btn-materi"
            onClick={onShowMaterial}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-white hover:border-white/15 hover:bg-white/[0.04] transition-all"
          >
            <span className="text-xs">📖</span>
            <span className="hidden sm:inline text-[9px] font-black tracking-widest uppercase">Materi</span>
          </button>

          {/* Challenge */}
          {hasChallenge && (
            <button
              id="btn-challenge"
              onClick={onShowChallenge}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all ${
                challengeCompleted
                  ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-400'
                  : 'border-orange-500/20 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/35'
              }`}
            >
              <span className="text-xs">{challengeCompleted ? '✅' : '⚔️'}</span>
              <span className="hidden sm:inline text-[9px] font-black tracking-widest uppercase">
                {challengeCompleted ? 'Done' : 'Challenge'}
              </span>
            </button>
          )}

          {/* Quiz */}
          <button
            id="btn-quiz"
            onClick={onShowQuiz}
            disabled={isQuizLocked}
            title={isQuizLocked ? 'Selesaikan challenge dulu' : ''}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all ${
              quizCompleted
                ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-400'
                : isQuizLocked
                  ? 'border-white/5 bg-white/[0.01] text-slate-700 cursor-not-allowed'
                  : 'border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/35'
            }`}
          >
            <span className="text-xs">{quizCompleted ? '✅' : isQuizLocked ? '🔒' : '🧠'}</span>
            <span className="hidden sm:inline text-[9px] font-black tracking-widest uppercase">
              {quizCompleted ? 'Done' : 'Quiz'}
            </span>
          </button>

          {/* Divider — hidden di mobile */}
          <div className="hidden sm:block w-px h-5 bg-white/[0.06] mx-0.5" />

          {/* Run — hidden di mobile (pakai tombol di panel bawah tab Control) */}
          <button
            id="btn-run"
            onClick={() => onRun?.(code)}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-[0.15em] uppercase transition-all ${
              isRunning
                ? 'bg-white/[0.03] border border-white/[0.06] text-slate-600 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 active:scale-95 shadow-[0_0_16px_rgba(16,185,129,0.2)]'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border-2 rounded-full border-white/15 border-t-slate-400 animate-spin" />
                <span className="hidden sm:inline">Proses...</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span className="hidden sm:inline">Jalankan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── EDITOR AREA ── */}
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-x-0 top-0 h-4 z-10 pointer-events-none bg-gradient-to-b from-[#030304] to-transparent opacity-60" />
        <div className="absolute inset-x-0 bottom-0 h-4 z-10 pointer-events-none bg-gradient-to-t from-[#030304] to-transparent opacity-60" />

        <MonacoEditor
          height="100%"
          defaultLanguage="cpp"
          theme="lgoviz-dark"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            minimap:                    { enabled: false },
            fontSize:                   isMobile ? 12 : 13,
            lineNumbers:                'on',
            automaticLayout:            true,
            scrollBeyondLastLine:       false,
            fontFamily:                 "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
            fontLigatures:              true,
            renderLineHighlight:        'gutter',
            glyphMargin:                true,
            padding:                    { top: 12, bottom: 12 },
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling:            true,
            lineHeight:                 isMobile ? 20 : 22,
            letterSpacing:              0.3,
            bracketPairColorization:    { enabled: true },
            formatOnPaste:              true,
            wordWrap:                   'on',
            scrollbar: {
              verticalScrollbarSize:    4,
              horizontalScrollbarSize:  4,
              useShadows:               false,
            },
            overviewRulerLanes:         0,
            hideCursorInOverviewRuler:  true,
            overviewRulerBorder:        false,
            renderIndentGuides:         true,
            occurrencesHighlight:       'off',
          }}
        />
      </div>
    </div>
  )
}