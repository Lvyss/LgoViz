// Main entry point for interpreter engine

export { evaluateCode } from './evaluator'
export { RuntimeEnvironment } from './environment'
export { parseCode, parseExpression } from './parser'
export type { 
  ExecutionStep, 
  ExecutionTrace, 
  Variable,
  Environment 
} from './types'