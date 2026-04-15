'use client'

import { useState, useCallback, useRef } from 'react'
import { evaluateCode, ExecutionTrace, ExecutionStep } from '@/lib/interpreter'

interface InterpreterState {
  trace: ExecutionTrace | null
  currentStep: number
  isRunning: boolean
  isPlaying: boolean
  speed: number
  error: string | null
  waitingForInput: boolean
  inputVariable: string | null
  inputType: string | null
}

export function useInterpreter() {
  const [state, setState] = useState<InterpreterState>({
    trace: null,
    currentStep: 0,
    isRunning: false,
    isPlaying: false,
    speed: 500,
    error: null,
    waitingForInput: false,
    inputVariable: null,
    inputType: null,
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const inputResolverRef = useRef<((value: string) => void) | null>(null)

  const runCode = useCallback(async (code: string) => {
    // Stop any ongoing playback
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPlaying: false,
      error: null,
      waitingForInput: false,
      inputVariable: null,
      inputType: null,
    }))
    
    const handleInput = (variableName: string, variableType: string): Promise<string> => {
      return new Promise(resolve => {
        setState(prev => ({
          ...prev,
          waitingForInput: true,
          inputVariable: variableName,
          inputType: variableType,
        }))
        inputResolverRef.current = resolve
      })
    }
    
    const trace = await evaluateCode(code, { onInput: handleInput })
    
    setState(prev => ({
      ...prev,
      trace,
      currentStep: trace.hasError ? 0 : 1,
      isRunning: !trace.hasError,
      isPlaying: false,
      waitingForInput: false,
      inputVariable: null,
      inputType: null,
      error: trace.errorMessage || null,
    }))
    
    return trace
  }, [])

  const submitInput = useCallback((value: string) => {
    if (inputResolverRef.current) {
      inputResolverRef.current(value)
      inputResolverRef.current = null
    }
    setState(prev => ({
      ...prev,
      waitingForInput: false,
      inputVariable: null,
      inputType: null,
    }))
  }, [])

  const cancelInput = useCallback(() => {
    if (inputResolverRef.current) {
      inputResolverRef.current('0')
      inputResolverRef.current = null
    }
    setState(prev => ({
      ...prev,
      waitingForInput: false,
      inputVariable: null,
      inputType: null,
      error: 'Input dibatalkan oleh user',
    }))
  }, [])

  const goToStep = useCallback((stepIndex: number) => {
    setState(prev => {
      if (!prev.trace) return prev
      return {
        ...prev,
        currentStep: Math.max(1, Math.min(stepIndex, prev.trace.totalSteps)),
        isPlaying: false,
      }
    })
    
    // Stop playback when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const nextStep = useCallback(() => {
    setState(prev => {
      if (!prev.trace) return prev
      const next = prev.currentStep + 1
      if (next > prev.trace.totalSteps) return prev
      return {
        ...prev,
        currentStep: next,
        isPlaying: false,
      }
    })
  }, [])

  const prevStep = useCallback(() => {
    setState(prev => {
      if (!prev.trace) return prev
      const prevStep = prev.currentStep - 1
      if (prevStep < 1) return prev
      return {
        ...prev,
        currentStep: prevStep,
        isPlaying: false,
      }
    })
  }, [])

  const firstStep = useCallback(() => {
    setState(prev => {
      if (!prev.trace) return prev
      return {
        ...prev,
        currentStep: 1,
        isPlaying: false,
      }
    })
  }, [])

  const lastStep = useCallback(() => {
    setState(prev => {
      if (!prev.trace) return prev
      return {
        ...prev,
        currentStep: prev.trace.totalSteps,
        isPlaying: false,
      }
    })
  }, [])

  const play = useCallback(() => {
    setState(prev => {
      if (!prev.trace || prev.currentStep >= prev.trace.totalSteps) {
        return prev
      }
      return { ...prev, isPlaying: true }
    })
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    // Start new interval
    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (!prev.isPlaying || !prev.trace) {
          return prev
        }
        
        const next = prev.currentStep + 1
        if (next > prev.trace.totalSteps) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return { ...prev, isPlaying: false }
        }
        
        return { ...prev, currentStep: next }
      })
    }, state.speed)
  }, [state.speed])

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState(prev => ({ ...prev, isPlaying: false }))
  }, [])

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }))
    
    // Restart playback with new speed if playing
    if (state.isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      play()
    }
  }, [state.isPlaying, play])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState({
      trace: null,
      currentStep: 0,
      isRunning: false,
      isPlaying: false,
      speed: state.speed,
      error: null,
      waitingForInput: false,
      inputVariable: null,
      inputType: null,
    })
  }, [state.speed])

  const getCurrentStepData = useCallback((): ExecutionStep | null => {
    if (!state.trace || state.currentStep === 0) return null
    return state.trace.steps[state.currentStep - 1]
  }, [state.trace, state.currentStep])

  const getCurrentVariables = useCallback(() => {
    const step = getCurrentStepData()
    return step?.variables || []
  }, [getCurrentStepData])

  const getCurrentOutput = useCallback(() => {
    const step = getCurrentStepData()
    return step?.output || []
  }, [getCurrentStepData])

  const getCurrentExplanation = useCallback(() => {
    const step = getCurrentStepData()
    return step?.explanation || ''
  }, [getCurrentStepData])

  const getCurrentLine = useCallback(() => {
    const step = getCurrentStepData()
    return step?.lineNumber || 1
  }, [getCurrentStepData])

  return {
    // State
    trace: state.trace,
    currentStep: state.currentStep,
    totalSteps: state.trace?.totalSteps || 0,
    isRunning: state.isRunning,
    isPlaying: state.isPlaying,
    speed: state.speed,
    error: state.error,
    waitingForInput: state.waitingForInput,
    inputVariable: state.inputVariable,
    inputType: state.inputType,
    
    // Actions
    runCode,
    submitInput,
    cancelInput,
    goToStep,
    nextStep,
    prevStep,
    firstStep,
    lastStep,
    play,
    pause,
    setSpeed,
    reset,
    
    // Getters
    getCurrentStepData,
    getCurrentVariables,
    getCurrentOutput,
    getCurrentExplanation,
    getCurrentLine,
  }
}