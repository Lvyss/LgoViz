// Helper functions for interpreter

import { ExecutionStep, Variable } from "./types"

export function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: any): boolean {
  return typeof value === 'boolean'
}

export function isString(value: any): boolean {
  return typeof value === 'string'
}

export function evaluateExpression(expr: any, variables: Map<string, Variable>): any {
  // Simplified expression evaluator
  // Will be expanded in evaluator.ts
  
  if (expr.type === 'number') {
    return expr.value
  }
  
  if (expr.type === 'identifier') {
    const var_ = variables.get(expr.name)
    return var_?.value
  }
  
  if (expr.type === 'binary_expression') {
    const left = evaluateExpression(expr.left, variables)
    const right = evaluateExpression(expr.right, variables)
    
    switch (expr.operator) {
      case '+': return left + right
      case '-': return left - right
      case '*': return left * right
      case '/': return left / right
      case '%': return left % right
      case '==': return left == right
      case '!=': return left != right
      case '<': return left < right
      case '>': return left > right
      case '<=': return left <= right
      case '>=': return left >= right
      case '&&': return left && right
      case '||': return left || right
      default: return null
    }
  }
  
  return null
}

export function getLineNumber(node: any): number {
  if (node && node.startPosition) {
    return node.startPosition.row + 1
  }
  return 1
}

export function createStep(
  stepIndex: number,
  lineNumber: number,
  variables: Variable[],
  output: string[],
  explanation: string,
  scopeDepth: number
): ExecutionStep {
  return {
    stepIndex,
    lineNumber,
    variables: variables.map(v => ({ ...v, changed: false })),
    output: [...output],
    explanation,
    scopeDepth,
  }
}

export function markChangedVariables(
  variables: Variable[],
  previousVariables: Map<string, any>
): Variable[] {
  return variables.map(v => ({
    ...v,
    changed: previousVariables.get(v.name) !== v.value,
  }))
}