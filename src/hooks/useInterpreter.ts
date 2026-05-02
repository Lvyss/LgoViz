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
  
  // 🔥 TAMBAHAN UNTUK CHALLENGE VALIDATION
  validateChallenge: (code: string, challenge: ChallengeConfig) => Promise<ChallengeResult>
}

// 🔥 Tipe data untuk Challenge
export interface ChallengeConfig {
  id: string
  description: string
  starter_code?: string
  solution_code?: string
  required_keywords?: string[]
  required_variables?: string[]
  expected_output?: string
  points?: number
}

export interface ChallengeResult {
  passed: boolean
  errors: string[]
  details?: {
    output?: string
    variables?: Record<string, any>
  }
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

  // 🔥 Fungsi validasi challenge
const validateChallenge = useCallback(async (code: string, challenge: ChallengeConfig): Promise<ChallengeResult> => {
  const result: ChallengeResult = {
    passed: true,
    errors: [],
    details: {}
  }

  // 1. Cek kata kunci wajib
  if (challenge.required_keywords && challenge.required_keywords.length > 0) {
    for (const keyword of challenge.required_keywords) {
      const wordRegex = new RegExp(`\\b${keyword}\\b`, 'i')
      if (!wordRegex.test(code)) {
        result.passed = false
        result.errors.push(`Kata kunci '${keyword}' tidak ditemukan dalam kode`)
      }
    }
  }

  // 2. Cek variabel wajib
  if (challenge.required_variables && challenge.required_variables.length > 0) {
    for (const variable of challenge.required_variables) {
      const varPattern = new RegExp(`(int|float|double|char|bool|string|long|short)\\s+${variable}\\s*[=;]`, 'i')
      if (!varPattern.test(code)) {
        result.passed = false
        result.errors.push(`Variabel '${variable}' tidak dideklarasikan dengan benar`)
      }
    }
  }

  // 🔥🔥🔥 3. Eksekusi kode dan validasi output (DIPERBAIKI) 🔥🔥🔥
  if (challenge.expected_output) {
    try {
      let capturedOutput = ''
      
      // 🔥 Gunakan flag untuk menandai apakah onOutput sudah tersedia
      // Jika evaluator sudah mendukung onOutput, kita bisa langsung pakai
      // Tapi karena belum, kita tetap pakai onStep dengan cara yang lebih akurat
      
      // Eksekusi kode dengan evaluator
      const executionResult = await evaluatePercabangan(code, {
        onStep: (step) => {
          // 🔥 Yang benar: ambil output yang FRESH dari step ini
          // step.output berisi akumulasi, jadi kita harus ambil selisihnya
          // Atau lebih simpel: kita catat output dari array langsung
        },
        onInput: async (varName: string, varType: string): Promise<string> => {
          // Untuk challenge, gunakan nilai default
          if (varType === 'int') return '0'
          if (varType === 'bool') return 'false'
          if (varType === 'char') return 'a'
          if (varType === 'string') return 'test'
          return '0'
        }
      })
      
      // 🔥 Cara alternatif: ekstrak output dari executionResult
      // Karena evaluator menyimpan output di steps, kita bisa ambil dari step terakhir
      if (executionResult.steps.length > 0) {
        const lastStep = executionResult.steps[executionResult.steps.length - 1]
        // output di step adalah array, gabungkan jadi string
        capturedOutput = lastStep.output.join('')
      }
      
      result.details!.output = capturedOutput.trim()
      
      // Normalisasi untuk perbandingan (case insensitive, hapus spasi berlebih)
      const expectedNormalized = challenge.expected_output.toLowerCase().replace(/\s+/g, ' ').trim()
      const outputNormalized = capturedOutput.toLowerCase().replace(/\s+/g, ' ').trim()
      
      console.log('📝 Challenge Validation Detail:')
      console.log('   Expected:', expectedNormalized)
      console.log('   Actual:', outputNormalized)
      
      if (!outputNormalized.includes(expectedNormalized)) {
        result.passed = false
        result.errors.push(`Output tidak sesuai. Diharapkan: "${challenge.expected_output}", Output: "${capturedOutput.trim() || '(kosong)'}"`)
      }
      
      // Capture variables dari step terakhir
      if (executionResult.steps.length > 0) {
        const lastStep = executionResult.steps[executionResult.steps.length - 1]
        const varsObj: Record<string, any> = {}
        lastStep.variables.forEach(v => {
          varsObj[v.name] = v.value
        })
        result.details!.variables = varsObj
      }
      
      if (executionResult.hasError) {
        result.passed = false
        result.errors.push(`Error eksekusi: ${executionResult.errorMessage || 'Unknown error'}`)
      }
    } catch (err: any) {
      result.passed = false
      result.errors.push(`Error: ${err.message}`)
    }
  }

  return result
}, [])

  // Input handler dengan proper cleanup
  const createInputHandler = useCallback(() => {
    return (varName: string, varType: string): Promise<string> => {
      return new Promise<string>((resolve) => {
        // Cleanup previous resolver if exists
        if (inputResolverRef.current) {
          inputResolverRef.current('0')
        }
        inputResolverRef.current = resolve
        setInputVariable(varName)
        setInputType(varType)
        setWaitingForInput(true)
      })
    }
  }, [])

  // Step handler
  const createStepHandler = useCallback(() => {
    return (step: ExecutionStep) => {
      stepsRef.current.push(step)
      setTrace({
        steps: [...stepsRef.current],
        totalSteps: stepsRef.current.length,
        hasError: false,
      })
      setCurrentStep(stepsRef.current.length)
    }
  }, [])

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

    try {
      let result: ExecutionTrace
      
      // Pilih evaluator berdasarkan tipe
      switch (evaluatorType) {
        case 'percabangan':
          result = await evaluatePercabangan(code, { 
            onInput: createInputHandler(), 
            onStep: createStepHandler() 
          })
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
          result = await evaluatePercabangan(code, { 
            onInput: createInputHandler(), 
            onStep: createStepHandler() 
          })
      }

      if (isCancelledRef.current) return

      setTrace(result)
      if (result.hasError) {
        setError(result.errorMessage || 'Execution error')
      }
      
if (result.steps.length > 0) {
  setCurrentStep(1)  // ← set ke step pertama (1, bukan 0)
}
    } catch (err) {
      if (isCancelledRef.current) return
      setError(err instanceof Error ? err.message : 'Unknown error')
      setTrace(null)
      setCurrentStep(0)
    } finally {
      isRunningCodeRef.current = false
      setIsRunning(false)
      // Don't reset waitingForInput here, let it be cleared by submit/cancel
    }
  }, [clearPlayInterval, createInputHandler, createStepHandler])

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
    
    // 🔥 EXPORT VALIDATE CHALLENGE
    validateChallenge,
  }
}