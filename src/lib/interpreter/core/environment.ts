// lib/interpreter/environment.ts

export interface Variable {
  name: string
  value: any
  type: string
  scopeDepth: number
  changed?: boolean  // Untuk tracking perubahan di step
}

export class RuntimeEnvironment {
  private variables: Map<string, Variable> = new Map()
  private output: string[] = []
  private currentLine: number = 0
  private stepCount: number = 0
  private currentScopeDepth: number = 0

  constructor() {
    this.variables.clear()
    this.output = []
    this.stepCount = 0
    this.currentScopeDepth = 0
  }

  // ============ SCOPE MANAGEMENT ============
  
  getCurrentScopeDepth(): number {
    return this.currentScopeDepth
  }

  incrementScope(): number {
    this.currentScopeDepth++
    return this.currentScopeDepth
  }

  decrementScope(): number {
    if (this.currentScopeDepth > 0) {
      this.currentScopeDepth--
    }
    return this.currentScopeDepth
  }

  // ============ LINE TRACKING ============
  
  setCurrentLine(line: number): void {
    this.currentLine = line
  }

  getCurrentLine(): number {
    return this.currentLine
  }

  // ============ STEP COUNTER ============
  
  incrementStepCount(): number {
    this.stepCount++
    return this.stepCount
  }

  getStepCount(): number {
    return this.stepCount
  }

  resetStepCount(): void {
    this.stepCount = 0
  }

  // ============ VARIABLE MANAGEMENT ============
  
  // Declare a new variable
  declareVariable(name: string, value: any, type: string = 'int'): void {
    if (!this.variables.has(name)) {
      this.variables.set(name, {
        name,
        value,
        type,
        scopeDepth: this.currentScopeDepth,
        changed: true
      })
    } else {
      // If exists, update value but keep type
      const existing = this.variables.get(name)!
      existing.value = value
      existing.type = type
      existing.changed = true
      this.variables.set(name, existing)
    }
  }

  // Set variable value
  setVariable(name: string, value: any, type?: string): void {
    const existing = this.variables.get(name)
    if (existing) {
      existing.value = value
      existing.changed = true
      if (type) existing.type = type
      this.variables.set(name, existing)
    } else {
      // Auto-declare if not exists (with default type)
      this.variables.set(name, {
        name,
        value,
        type: type || 'int',
        scopeDepth: this.currentScopeDepth,
        changed: true
      })
    }
  }

  // Get single variable
  getVariable(name: string): Variable | undefined {
    return this.variables.get(name)
  }

  // Get variable value only
  getVariableValue(name: string): any {
    const varInfo = this.variables.get(name)
    return varInfo ? varInfo.value : undefined
  }

  // GET ALL VARIABLES - ini yang kamu butuhin
  getAllVariables(): Variable[] {
    return Array.from(this.variables.values())
  }

  // Get all variables as object (name -> value)
  getAllVariablesAsObject(): Record<string, any> {
    const obj: Record<string, any> = {}
    for (const [name, varInfo] of this.variables) {
      obj[name] = varInfo.value
    }
    return obj
  }

  // Get all variables as object with metadata
  getAllVariablesWithMetadata(): Record<string, { value: any; type: string; changed: boolean }> {
    const obj: Record<string, { value: any; type: string; changed: boolean }> = {}
    for (const [name, varInfo] of this.variables) {
      obj[name] = {
        value: varInfo.value,
        type: varInfo.type,
        changed: varInfo.changed || false
      }
    }
    return obj
  }

  // Check if variable exists
  hasVariable(name: string): boolean {
    return this.variables.has(name)
  }

  // Get variable count
  getVariableCount(): number {
    return this.variables.size
  }

  // Reset changed flags (call after recording step)
  resetChangedFlags(): void {
    for (const [name, varInfo] of this.variables) {
      varInfo.changed = false
      this.variables.set(name, varInfo)
    }
  }

  // ============ OUTPUT MANAGEMENT ============
  
  // Add output
  addOutput(text: string): void {
    this.output.push(text)
  }

  // Get all output as array
  getOutput(): string[] {
    return [...this.output]
  }

  // Get output as joined string
  getOutputString(): string {
    return this.output.join('')
  }

  // Clear output
  clearOutput(): void {
    this.output = []
  }

  // ============ RESET ============
  
  // Reset entire environment
  reset(): void {
    this.variables.clear()
    this.output = []
    this.stepCount = 0
    this.currentLine = 0
    this.currentScopeDepth = 0
  }

  // ============ UTILITY ============
  
  // Clone environment (for debugging)
  clone(): RuntimeEnvironment {
    const cloned = new RuntimeEnvironment()
    for (const [name, varInfo] of this.variables) {
      cloned.variables.set(name, { ...varInfo })
    }
    cloned.output = [...this.output]
    cloned.currentLine = this.currentLine
    cloned.stepCount = this.stepCount
    cloned.currentScopeDepth = this.currentScopeDepth
    return cloned
  }
}