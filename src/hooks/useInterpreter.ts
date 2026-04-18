'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ExecutionTrace, ExecutionStep, EvaluateOptions } from '@/lib/interpreter'
import { evaluatePercabangan } from '@/lib/interpreter/evaluators/percabangan'

export type { ExecutionStep }

export interface UseInterpreterReturn {
  isRunning: boolean
  trace: ExecutionTrace | null
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  speed: number
  error: string | null

  waitingForInput: boolean
  inputVariable: string
  inputType: string

  runCode: (code: string, evaluatorType?: string) => Promise<void>
  reset: () => void
  nextStep: () => void
  prevStep: () => void
  firstStep: () => void
  lastStep: () => void
  play: () => void
  pause: () => void
  setSpeed: (speed: number) => void

  submitInput: (value: string) => void
  cancelInput: () => void

  getCurrentStep: () => ExecutionStep | null
  getCurrentLine: () => number
  getCurrentVariables: () => Record<string, any>
  getCurrentOutput: () => string
  getCurrentExplanation: () => string
}

export function useInterpreter(): UseInterpreterReturn {
  const [isRunning, setIsRunning] = useState(false)
  const [trace, setTrace] = useState<ExecutionTrace | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [error, setError] = useState<string | null>(null)

  const [waitingForInput, setWaitingForInput] = useState(false)
  const [inputVariable, setInputVariable] = useState('')
  const [inputType, setInputType] = useState('')

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const stepsRef = useRef<ExecutionStep[]>([])
  const inputResolverRef = useRef<((value: string) => void) | null>(null)
  const isCancelledRef = useRef(false)
  const isRunningCodeRef = useRef(false)

  const clearPlayInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Auto-play effect when isPlaying changes
  useEffect(() => {
    if (isPlaying && trace && currentStep < trace.steps.length) {
      clearPlayInterval()
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1
          if (nextStep >= (trace?.steps.length ?? 0)) {
            clearPlayInterval()
            setIsPlaying(false)
            return prev
          }
          return nextStep
        })
      }, speed)
    }
    return () => clearPlayInterval()
  }, [isPlaying, trace, currentStep, speed, clearPlayInterval])

  const runCode = useCallback(async (code: string, evaluatorType: string = 'percabangan') => {
    // Prevent concurrent runs
    if (isRunningCodeRef.current) {
      console.log('Already running, skipping...')
      return
    }

    clearPlayInterval()
    setIsPlaying(false)
    isRunningCodeRef.current = true
    setIsRunning(true)
    setError(null)
    setTrace(null)
    setCurrentStep(0)
    setWaitingForInput(false)
    stepsRef.current = []
    isCancelledRef.current = false

    // Input handler
const handleInput = (varName: string, varType: string): Promise<string> => {
  return new Promise<string>((resolve) => {
    inputResolverRef.current = resolve
    setInputVariable(varName)
    setInputType(varType)
    setWaitingForInput(true)
  })
}

    // Step callback
    const handleStep = (step: ExecutionStep) => {
      stepsRef.current.push(step)
      setTrace({
        steps: [...stepsRef.current],
        totalSteps: stepsRef.current.length,
        hasError: false,
      })
      setCurrentStep(stepsRef.current.length)
    }

    try {
      let result: ExecutionTrace
      
      // Pilih evaluator berdasarkan tipe
      switch (evaluatorType) {
        case 'percabangan':
          result = await evaluatePercabangan(code, { onInput: handleInput, onStep: handleStep })
          break
        case 'perulangan':
          result = {
            steps: [],
            totalSteps: 0,
            hasError: true,
            errorMessage: '🚧 Modul Perulangan masih dalam pengembangan. Coming soon! 🚧'
          }
          break
        case 'struktur-data':
          result = {
            steps: [],
            totalSteps: 0,
            hasError: true,
            errorMessage: '🚧 Modul Struktur Data masih dalam pengembangan. Coming soon! 🚧'
          }
          break
        default:
          result = await evaluatePercabangan(code, { onInput: handleInput, onStep: handleStep })
      }

      if (isCancelledRef.current) return

      setTrace(result)
      if (result.hasError) {
        setError(result.errorMessage || 'Execution error')
      }
      
      if (result.steps.length > 0) {
        setCurrentStep(result.steps.length)
      }
    } catch (err) {
      if (isCancelledRef.current) return
      setError(err instanceof Error ? err.message : 'Unknown error')
      setTrace(null)
      setCurrentStep(0)
    } finally {
      isRunningCodeRef.current = false
      setIsRunning(false)
      setWaitingForInput(false)
    }
  }, [clearPlayInterval])

  const reset = useCallback(() => {
    clearPlayInterval()
    setIsPlaying(false)
    isCancelledRef.current = true
    isRunningCodeRef.current = false
    setTrace(null)
    setCurrentStep(0)
    setError(null)
    setWaitingForInput(false)
    if (inputResolverRef.current) {
      inputResolverRef.current('0')
      inputResolverRef.current = null
    }
    stepsRef.current = []
  }, [clearPlayInterval])

  const nextStep = useCallback(() => {
    if (trace && currentStep < trace.steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }, [trace, currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const firstStep = useCallback(() => {
    setCurrentStep(0)
  }, [])

  const lastStep = useCallback(() => {
    if (trace) {
      setCurrentStep(trace.steps.length)
    }
  }, [trace])

  const play = useCallback(() => {
    if (!trace || currentStep >= trace.steps.length) return
    setIsPlaying(true)
  }, [trace, currentStep])

  const pause = useCallback(() => {
    clearPlayInterval()
    setIsPlaying(false)
  }, [clearPlayInterval])

  const submitInput = useCallback((value: string) => {
    if (inputResolverRef.current) {
      inputResolverRef.current(value)
      inputResolverRef.current = null
    }
    setWaitingForInput(false)
  }, [])

  const cancelInput = useCallback(() => {
    if (inputResolverRef.current) {
      inputResolverRef.current('0')
      inputResolverRef.current = null
    }
    setWaitingForInput(false)
  }, [])

  const getCurrentStep = useCallback((): ExecutionStep | null => {
    if (!trace || currentStep === 0) return null
    return trace.steps[currentStep - 1] || null
  }, [trace, currentStep])

  const getCurrentLine = useCallback((): number => {
    const step = getCurrentStep()
    return step?.lineNumber ?? 0
  }, [getCurrentStep])

  const getCurrentVariables = useCallback((): Record<string, any> => {
    const step = getCurrentStep()
    if (!step) return {}
    const varsObj: Record<string, any> = {}
    step.variables.forEach(v => {
      varsObj[v.name] = v.value
    })
    return varsObj
  }, [getCurrentStep])

  const getCurrentOutput = useCallback((): string => {
    const step = getCurrentStep()
    if (!step) return ''
    return step.output.join('')
  }, [getCurrentStep])

  const getCurrentExplanation = useCallback((): string => {
    const step = getCurrentStep()
    return step?.explanation || ''
  }, [getCurrentStep])

  return {
    isRunning,
    trace,
    currentStep,
    totalSteps: trace?.steps.length ?? 0,
    isPlaying,
    speed,
    error,

    waitingForInput,
    inputVariable,
    inputType,

    runCode,
    reset,
    nextStep,
    prevStep,
    firstStep,
    lastStep,
    play,
    pause,
    setSpeed,

    submitInput,
    cancelInput,

    getCurrentStep,
    getCurrentLine,
    getCurrentVariables,
    getCurrentOutput,
    getCurrentExplanation,
  }
}