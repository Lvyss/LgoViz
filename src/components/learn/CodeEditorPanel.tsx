'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-[#0a0a0f] border border-white/10 rounded-lg">
      <span className="text-sm text-gray-500">Loading editor...</span>
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
      } catch (e) {
        // silent
      }
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
      } catch (e) {
        // silent
      }
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [highlightedLine])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    const styleId = 'monaco-highlight-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .highlighted-line {
          background-color: rgba(16, 185, 129, 0.2) !important;
          border-left: 4px solid #10b981 !important;
        }
        .highlighted-line-glyph {
          background-color: #10b981 !important;
          width: 6px !important;
          margin-left: 3px;
        }
      `
      document.head.appendChild(style)
    }

    monaco.editor.defineTheme('lgoviz-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c586c0' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'string', foreground: 'ce9178' },
      ],
      colors: {
        'editor.background': '#0a0a0f',
        'editor.lineHighlightBackground': '#1a1a2e',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#10b981',
      },
    })
    monaco.editor.setTheme('lgoviz-dark')
  }

  useEffect(() => {
    return () => clearDecorations()
  }, [])

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onCodeChange?.(newCode)
    lastHighlightedLineRef.current = 0
    clearDecorations()
  }

  const handleShowSolution = () => {
    if (showSolution) {
      setCode(starterCode)
      onCodeChange?.(starterCode)
    } else {
      setCode(solutionCode)
      onCodeChange?.(solutionCode)
    }
    setShowSolution(!showSolution)
    lastHighlightedLineRef.current = 0
    clearDecorations()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-400">Code Editor</span>
          {highlightedLine > 0 && (
            <span className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Line {highlightedLine}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onShowMaterial && (
            <button
              onClick={onShowMaterial}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors border border-white/10 rounded-lg hover:bg-white/5 hover:text-gray-300"
              title="Lihat materi pembelajaran"
            >
              <span>?</span>
              <span>Materi</span>
            </button>
          )}
          <button
            onClick={handleShowSolution}
            className="px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors border border-white/10 rounded-lg hover:bg-white/5 hover:text-gray-300"
          >
            {showSolution ? 'Reset' : 'Solusi'}
          </button>
          <button
            onClick={() => onRun?.(code)}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white transition-all bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <span className="animate-spin">⟳</span>
                <span>Running...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
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
            renderLineHighlight: 'none',
            glyphMargin: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  )
}