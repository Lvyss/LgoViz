// lib/interpreter/index.ts

export type { ExecutionStep, ExecutionTrace, EvaluateOptions } from './core/types'

// Export evaluator percabangan sebagai default untuk sementara
export { evaluatePercabangan } from './evaluators/percabangan'

// Untuk tipe evaluator
export type EvaluatorType = 'percabangan' | 'perulangan' | 'struktur-data'