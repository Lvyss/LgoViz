'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import PixelCard from '../ui/PixelCard'
import PixelButton from '../ui/PixelButton'

// Dynamic import Monaco Editor (SSR disabled)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="bg-pixel-dark border-2 border-neon-green/50 p-4 min-h-[300px] flex items-center justify-center">
      <div className="font-mono text-text-muted text-sm">Loading editor...</div>
    </div>
  ),
})

interface CodeEditorPanelProps {
  starterCode: string
  solutionCode: string
  onCodeChange?: (code: string) => void
  onRun?: (code: string) => void
  isRunning?: boolean
}

export default function CodeEditorPanel({
  starterCode,
  solutionCode,
  onCodeChange,
  onRun,
  isRunning = false,
}: CodeEditorPanelProps) {
  const [code, setCode] = useState(starterCode)
  const [showSolution, setShowSolution] = useState(false)

  useEffect(() => {
    setCode(starterCode)
    setShowSolution(false)
  }, [starterCode])

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const handleShowSolution = () => {
    if (showSolution) {
      setCode(starterCode)
    } else {
      setCode(solutionCode)
    }
    setShowSolution(!showSolution)
  }

  const handleRun = () => {
    onRun?.(code)
  }

  return (
    <PixelCard glow>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="font-pixel text-neon-blue text-sm">
          ✏️ CODE EDITOR
        </h2>
        <div className="flex gap-2">
          <PixelButton 
            variant="secondary" 
            onClick={handleShowSolution}
            className="text-[8px] py-1 px-3"
          >
            {showSolution ? '↺ RESET' : '💡 SHOW SOLUTION'}
          </PixelButton>
          <PixelButton 
            variant="primary" 
            onClick={handleRun}
            className="text-[8px] py-1 px-3"
            disabled={isRunning}
          >
            {isRunning ? '⚡ RUNNING...' : '▶ RUN'}
          </PixelButton>
        </div>
      </div>
      
      <div className="border-2 border-neon-green/50 overflow-hidden">
        <MonacoEditor
          height="300px"
          defaultLanguage="cpp"
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontFamily: 'Courier New, monospace',
          }}
        />
      </div>
      
      <div className="mt-3 flex justify-between items-center text-text-muted font-mono text-xs">
        <span>💡 Tip: Klik "SHOW SOLUTION" untuk melihat kode contoh</span>
        <span>C++</span>
      </div>
    </PixelCard>
  )
}