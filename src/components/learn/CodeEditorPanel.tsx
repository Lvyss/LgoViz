'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import PixelCard from '../ui/PixelCard'
import PixelButton from '../ui/PixelButton'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="bg-[#1e1e2e] border-2 border-neon-green/50 p-4 min-h-[300px] flex items-center justify-center">
      <div className="font-mono text-sm text-gray-500">Loading editor...</div>
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
}

export default function CodeEditorPanel({
  starterCode,
  solutionCode,
  onCodeChange,
  onRun,
  isRunning = false,
  highlightedLine = 0,
}: CodeEditorPanelProps) {
  const [code, setCode] = useState(starterCode)
  const [showSolution, setShowSolution] = useState(false)
  const editorRef = useRef<any>(null)
  const decorationRef = useRef<string[]>([])
  const lastHighlightedLineRef = useRef<number>(0)

  useEffect(() => {
    setCode(starterCode)
    setShowSolution(false)
    // Reset highlight when code changes
    lastHighlightedLineRef.current = 0
  }, [starterCode])

  // Clear all decorations
  const clearDecorations = useRef(() => {
    if (editorRef.current && decorationRef.current.length > 0) {
      try {
        decorationRef.current = editorRef.current.deltaDecorations(decorationRef.current, [])
      } catch (e) {
        console.warn('Failed to clear decorations:', e)
      }
    }
  }).current

  // Update Monaco editor decorations when highlightedLine changes
// Di CodeEditorPanel.tsx, update useEffect untuk highlight:
useEffect(() => {
  if (!editorRef.current) return

  const timeoutId = setTimeout(() => {
    if (lastHighlightedLineRef.current === highlightedLine) return
    lastHighlightedLineRef.current = highlightedLine

    clearDecorations()

    // Don't highlight line 0
    if (highlightedLine <= 0) return

    const editor = editorRef.current
    const model = editor.getModel()
    if (!model) return

    const lineCount = model.getLineCount()
    // Ensure line number is within bounds
    const targetLine = Math.min(Math.max(highlightedLine, 1), lineCount)

    const newDecorations = [
      {
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
      },
    ]

    try {
      decorationRef.current = editor.deltaDecorations([], newDecorations)
      editor.revealLineInCenterIfOutsideViewport(targetLine)
    } catch (e) {
      console.warn('Failed to add decorations:', e)
    }
  }, 50)

  return () => clearTimeout(timeoutId)
}, [highlightedLine, clearDecorations])
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Add CSS for highlighted line via Monaco's theme
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
          border-radius: 0px !important;
        }
        .highlighted-line-border {
          background-color: #10b981 !important;
          width: 4px !important;
          margin-left: 0px;
        }
        .monaco-editor .view-overlays .current-line {
          border: none !important;
        }
      `
      document.head.appendChild(style)
    }

    // Set editor theme with custom colors
    monaco.editor.defineTheme('custom-dark', {
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
    monaco.editor.setTheme('custom-dark')

    // Scroll to first line
    editor.revealLine(1)
  }

  // Clear decorations on unmount
  useEffect(() => {
    return () => {
      clearDecorations()
    }
  }, [clearDecorations])

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onCodeChange?.(newCode)
    // Reset highlight when user edits code
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
    // Reset highlight
    lastHighlightedLineRef.current = 0
    clearDecorations()
  }

  const handleRun = () => {
    onRun?.(code)
  }

  return (
    <PixelCard glow>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-sm font-pixel text-neon-blue">✏️ CODE EDITOR</h2>
        <div className="flex gap-2">
          <PixelButton variant="secondary" onClick={handleShowSolution} className="text-[8px] py-1 px-3">
            {showSolution ? '↺ RESET' : '💡 SHOW SOLUTION'}
          </PixelButton>
          <PixelButton variant="primary" onClick={handleRun} className="text-[8px] py-1 px-3" disabled={isRunning}>
            {isRunning ? '⚡ RUNNING...' : '▶ RUN'}
          </PixelButton>
        </div>
      </div>

      <div className="overflow-hidden border-2 border-neon-green/50">
        <MonacoEditor
          height="300px"
          defaultLanguage="cpp"
          theme="custom-dark"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontFamily: 'JetBrains Mono, Courier New, monospace',
            renderLineHighlight: 'none',
            glyphMargin: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-3 font-mono text-xs text-gray-500">
        <span className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${highlightedLine > 0 ? 'bg-neon-green animate-pulse' : 'bg-gray-600'}`}></span>
          <span>{highlightedLine > 0 ? `🎯 Line ${highlightedLine} active` : '⚡ Run code to see execution'}</span>
        </span>
        <span>C++ Interpreter</span>
      </div>
    </PixelCard>
  )
}