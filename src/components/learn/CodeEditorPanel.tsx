'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#08080c]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 rounded-full border-orange-500/20 border-t-orange-500 animate-spin" />
        <span className="text-[10px] font-black tracking-[0.3em] text-slate-600 uppercase">Loading_Editor...</span>
      </div>
    </div>
  ),
})

interface CodeEditorPanelProps {
  starterCode: string
  solutionCode: string
  onCodeChange?: (code: string) => void
  onRun?: (code: string) => void
  isRunning?: boolean
  highlightedLine?: number
  onShowMaterial?: () => void
}

export default function CodeEditorPanel({
  starterCode,
  solutionCode,
  onCodeChange,
  onRun,
  isRunning = false,
  highlightedLine = 0,
  onShowMaterial,
}: CodeEditorPanelProps) {
  const [code, setCode] = useState(starterCode)
  const [showSolution, setShowSolution] = useState(false)
  const editorRef = useRef<any>(null)
  const decorationRef = useRef<string[]>([])
  const lastHighlightedLineRef = useRef<number>(0)

  useEffect(() => {
    setCode(starterCode)
    setShowSolution(false)
    lastHighlightedLineRef.current = 0
  }, [starterCode])

  const clearDecorations = () => {
    if (editorRef.current && decorationRef.current.length > 0) {
      try {
        decorationRef.current = editorRef.current.deltaDecorations(decorationRef.current, [])
      } catch (e) { /* silent */ }
    }
  }

  useEffect(() => {
    if (!editorRef.current) return

    const timeoutId = setTimeout(() => {
      if (lastHighlightedLineRef.current === highlightedLine) return
      lastHighlightedLineRef.current = highlightedLine

      clearDecorations()
      if (highlightedLine <= 0) return

      const editor = editorRef.current
      const model = editor.getModel()
      if (!model) return

      const lineCount = model.getLineCount()
      const targetLine = Math.min(Math.max(highlightedLine, 1), lineCount)

      try {
        decorationRef.current = editor.deltaDecorations([], [{
          range: {
            startLineNumber: targetLine,
            startColumn: 1,
            endLineNumber: targetLine,
            endColumn: model.getLineMaxColumn(targetLine),
          },
          options: {
            isWholeLine: true,
            className: 'highlighted-line',
            glyphMarginClassName: 'highlighted-line-glyph',
          },
        }])
        editor.revealLineInCenterIfOutsideViewport(targetLine)
      } catch (e) { /* silent */ }
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [highlightedLine])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Inject Custom CSS for Highlighting (Connection to Visualizer)
    const styleId = 'monaco-highlight-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .highlighted-line {
          background-color: rgba(249, 115, 22, 0.1) !important;
          border-left: 4px solid #f97316 !important;
          box-shadow: inset 20px 0 30px -15px rgba(249, 115, 22, 0.15);
        }
        .highlighted-line-glyph {
          background: #f97316 !important;
          width: 5px !important;
          margin-left: 5px;
          border-radius: 99px;
          box-shadow: 0 0 10px #f97316;
        }
      `
      document.head.appendChild(style)
    }

    // Deep Theme for LgoViz
    monaco.editor.defineTheme('lgoviz-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5d6d7e', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'operator', foreground: 'd4d4d4' },
      ],
      colors: {
        'editor.background': '#08080c',
        'editor.lineHighlightBackground': '#11111a',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#f97316',
        'editorIndentGuide.activeBackground': '#1e293b',
        'editor.selectionBackground': '#264f7866',
        'editorCursor.foreground': '#f97316',
      },
    })
    monaco.editor.setTheme('lgoviz-dark')
  }

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onCodeChange?.(newCode)
    lastHighlightedLineRef.current = 0
    clearDecorations()
  }

  const handleShowSolution = () => {
    const targetCode = showSolution ? starterCode : solutionCode
    setCode(targetCode)
    onCodeChange?.(targetCode)
    setShowSolution(!showSolution)
    lastHighlightedLineRef.current = 0
    clearDecorations()
  }

  return (
    <div className="flex flex-col h-full bg-[#08080c] overflow-hidden">
      
      {/* 🚀 Editor Header: Compact & Functional */}
<div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.03] bg-white/[0.01] backdrop-blur-md shrink-0">
  <div className="flex items-center gap-5">
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
      <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Editor_Main</span>
    </div>

    {/* Running Indicator Label */}
    {highlightedLine > 0 && (
      <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 animate-in fade-in slide-in-from-left-2 duration-300">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
        </span>
        <span className="text-[9px] font-mono font-black text-orange-400 tracking-tighter uppercase">
          Active_Line: {highlightedLine}
        </span>
      </div>
    )}
  </div>

  {/* Action Buttons */}
  <div className="flex items-center gap-2">
    
    {/* ✅ TOMBOL MATERI - TAMBAHKAN INI */}
    <button
      onClick={onShowMaterial}
      className="px-3 py-1.5 text-[9px] font-black tracking-widest rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
    >
      📖 MATERI
    </button>

    <button
      onClick={handleShowSolution}
      className={`px-3 py-1.5 text-[9px] font-black tracking-widest rounded-lg border transition-all ${
        showSolution 
        ? 'bg-orange-500/10 border-orange-500/40 text-orange-500' 
        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {showSolution ? 'RESET_CHALLENGE' : 'VIEW_SOLUTION'}
    </button>

    <div className="h-4 w-[1px] bg-white/10 mx-1" />

    <button
      onClick={() => onRun?.(code)}
      disabled={isRunning}
      className={`group relative flex items-center gap-2 px-6 py-1.5 text-[10px] font-black tracking-[0.2em] text-white transition-all rounded-lg overflow-hidden ${
        isRunning 
        ? 'bg-slate-800 cursor-not-allowed' 
        : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_5px_15px_rgba(16,185,129,0.2)] active:scale-95'
      }`}
    >
      {isRunning ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 rounded-full border-white/20 border-t-white animate-spin" />
          <span className="italic uppercase opacity-70">Processing...</span>
        </div>
      ) : (
        <>
          <span className="transition-transform group-hover:scale-110">▶</span>
          <span>RUN_CODE</span>
        </>
      )}
    </button>
  </div>
</div>

      {/* 📝 Editor Area */}
      <div className="relative flex-1 min-h-0">
        {/* Deep Gradient for Professional Look */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#08080c] to-transparent z-10 pointer-events-none opacity-50" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#08080c] to-transparent z-10 pointer-events-none opacity-50" />

        <MonacoEditor
          height="100%"
          defaultLanguage="cpp"
          theme="lgoviz-dark"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            renderLineHighlight: 'all',
            glyphMargin: true,
            padding: { top: 20, bottom: 20 },
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            lineHeight: 24,
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  )
}