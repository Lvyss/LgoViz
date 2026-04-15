import { Environment, Variable } from './types'

export class RuntimeEnvironment {
  private variables: Map<string, Variable> = new Map()
  private outputStack: string[] = []
  private stepCount: number = 0
  private currentLine: number = 1
  private scopeStack: number[] = [0]

  constructor() {}

  setVariable(name: string, value: any, type: Variable['type'] = 'int'): void {
    const existing = this.variables.get(name)
    this.variables.set(name, {
      name,
      value,
      type,
      changed: existing ? existing.value !== value : true,
    })
  }

  getVariable(name: string): Variable | undefined {
    return this.variables.get(name)
  }

  getAllVariables(): Variable[] {
    return Array.from(this.variables.values())
  }

  addOutput(text: string): void {
    this.outputStack.push(text)
  }

  getOutput(): string[] {
    return [...this.outputStack]
  }

  clearOutput(): void {
    this.outputStack = []
  }

  incrementStep(): number {
    this.stepCount++
    return this.stepCount
  }

  getStepCount(): number {
    return this.stepCount
  }

  setCurrentLine(line: number): void {
    this.currentLine = line
  }

  getCurrentLine(): number {
    return this.currentLine
  }

  pushScope(): void {
    this.scopeStack.push(this.scopeStack.length)
  }

  popScope(): void {
    this.scopeStack.pop()
  }

  getCurrentScopeDepth(): number {
    return this.scopeStack.length - 1
  }

  reset(): void {
    this.variables.clear()
    this.outputStack = []
    this.stepCount = 0
    this.currentLine = 1
    this.scopeStack = [0]
  }

  snapshot(): {
    variables: Variable[]
    output: string[]
    stepCount: number
    currentLine: number
  } {
    return {
      variables: this.getAllVariables(),
      output: this.getOutput(),
      stepCount: this.stepCount,
      currentLine: this.currentLine,
    }
  }
}