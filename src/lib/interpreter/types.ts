// Type definitions for interpreter engine

export interface Variable {
  name: string
  value: any
  type: 'int' | 'float' | 'double' | 'bool' | 'char' | 'string'
  changed: boolean
}

export interface ExecutionStep {
  stepIndex: number
  lineNumber: number
  variables: Variable[]
  output: string[]
  explanation: string
  scopeDepth: number
}

export interface ExecutionTrace {
  steps: ExecutionStep[]
  totalSteps: number
  hasError: boolean
  errorMessage?: string
}

export interface Environment {
  variables: Map<string, Variable>
  output: string[]
  stepIndex: number
  currentLine: number
  scopeDepth: number
}

export interface ParserResult {
  success: boolean
  ast?: any
  error?: string
}

export interface EvaluateOptions {
  maxSteps?: number
  onStep?: (step: ExecutionStep) => void
}

export interface InputRequest {
  id: string
  variableName: string
  variableType: string
  message: string
}

export interface ExecutionContext {
  onInput?: (variableName: string, variableType: string) => Promise<any>
}