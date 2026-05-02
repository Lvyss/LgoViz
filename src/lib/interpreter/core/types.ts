export interface ExecutionStep {
  stepIndex: number
  lineNumber: number
  variables: Array<{ name: string; value: any; type: string; changed: boolean }>
  output: string[]
  explanation: string
  scopeDepth: number
  skipped: boolean
}

export interface ExecutionTrace {
  steps: ExecutionStep[]
  totalSteps: number
  hasError: boolean
  errorMessage?: string
}

export interface EvaluateOptions {
  onInput?: (variableName: string, variableType: string) => Promise<string>
  onStep?: (step: ExecutionStep) => void
  maxSteps?: number
  onOutput?: (text: string) => void  // 🔥 TAMBAHKAN INI
}

export type EvaluatorType = 'percabangan' | 'perulangan' | 'struktur-data'