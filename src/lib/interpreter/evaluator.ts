import { RuntimeEnvironment } from './environment'
import { parseCode } from './parser'
import { ExecutionStep, ExecutionTrace, ExecutionContext } from './types'

const MAX_STEPS = 1000

export async function evaluateCode(
  code: string,
  context?: ExecutionContext
): Promise<ExecutionTrace> {
  const env = new RuntimeEnvironment()
// Di dalam evaluateCode, setelah parseCode:
const statements = parseCode(code)
console.log('📊 PARSED STATEMENTS:', statements.map(s => ({ type: s.type, content: s.content.substring(0, 50) })))
  const steps: ExecutionStep[] = []
  
  let i = 0
  let skipMode = false  // Untuk skip blok if/else
  let skipLevel = 0     // Level brace saat skip
  
  try {
    while (i < statements.length && env.getStepCount() < MAX_STEPS) {
      const stmt = statements[i]
      env.setCurrentLine(stmt.line)
      env.incrementStep()
      
      let explanation = ''
      let shouldRecord = true
      
      // Skip mode untuk if/else
      if (skipMode && stmt.type !== 'brace_close') {
        // Masih dalam skip mode, lanjut ke statement berikutnya
        i++
        continue
      }
      
      switch (stmt.type) {
        case 'main_start':
          explanation = 'Memulai program'
          break
          
        case 'declaration': {
          const match = stmt.content.match(/^(int|float|double|char|bool|string)\s+(\w+)(?:\s*=\s*(.+))?/)
          if (match) {
            const varType = match[1]
            const varName = match[2]
            let value: any = 0
            
            if (match[3]) {
              const initValue = match[3].trim().replace(/;$/, '')
              if (!isNaN(Number(initValue))) {
                value = Number(initValue)
              } else if (initValue === 'true') value = true
              else if (initValue === 'false') value = false
              else if (initValue.startsWith('"')) value = initValue.slice(1, -1)
              else {
                // Reference ke variabel lain
                const otherVar = env.getVariable(initValue)
                if (otherVar) value = otherVar.value
              }
            }
            
            env.setVariable(varName, value, varType as any)
            explanation = `Deklarasi ${varType} ${varName} = ${value}`
          }
          break
        }
        
        case 'assignment': {
          const match = stmt.content.match(/^(\w+)\s*=\s*(.+?);?$/)
          if (match) {
            const varName = match[1]
            let value: any = match[2].trim().replace(/;$/, '')
            
            if (!isNaN(Number(value))) {
              value = Number(value)
            } else if (value === 'true') value = true
            else if (value === 'false') value = false
            else if (value.startsWith('"')) value = value.slice(1, -1)
            else {
              const otherVar = env.getVariable(value)
              if (otherVar) value = otherVar.value
            }
            
            env.setVariable(varName, value)
            explanation = `Assign ${varName} = ${value}`
          }
          break
        }
        
        case 'cout': {
          // Extract content between cout << and ;
          let content = stmt.content
          content = content.replace(/cout\s*<<\s*/, '')
          content = content.replace(/;$/, '')
          
          // Split by <<
          const parts = content.split(/\s*<<\s*/)
          let outputValue = ''
          
          for (let part of parts) {
            part = part.trim()
            
            if (part === 'endl') {
              outputValue += '\n'
            } else if (part.startsWith('"') && part.endsWith('"')) {
              outputValue += part.slice(1, -1)
            } else if (part.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
              const var_ = env.getVariable(part)
              outputValue += var_?.value !== undefined ? String(var_.value) : ''
            } else {
              outputValue += part
            }
          }
          
          env.addOutput(outputValue)
          explanation = `Output: "${outputValue.replace(/\n/g, '\\n')}"`
          break
        }
        
        case 'cin': {
          const match = stmt.content.match(/cin\s*>>\s*(\w+)/)
          if (match && context?.onInput) {
            const varName = match[1]
            const var_ = env.getVariable(varName)
            const varType = var_?.type || 'int'
            
            explanation = `Meminta input untuk ${varName}`
            
            // Record step before input
            steps.push({
              stepIndex: steps.length,
              lineNumber: stmt.line,
              variables: env.getAllVariables(),
              output: env.getOutput(),
              explanation,
              scopeDepth: env.getCurrentScopeDepth(),
            })
            
            const inputValue = await context.onInput(varName, varType)
            
            let parsedValue: any = inputValue
            if (varType === 'int') parsedValue = parseInt(inputValue)
            else if (varType === 'float') parsedValue = parseFloat(inputValue)
            else if (varType === 'bool') parsedValue = inputValue === 'true' || inputValue === '1'
            else parsedValue = inputValue
            
            env.setVariable(varName, parsedValue, varType as any)
            
            steps.push({
              stepIndex: steps.length,
              lineNumber: stmt.line,
              variables: env.getAllVariables(),
              output: env.getOutput(),
              explanation: `Input diterima: ${varName} = ${parsedValue}`,
              scopeDepth: env.getCurrentScopeDepth(),
            })
            
            shouldRecord = false // Already recorded
          }
          break
        }
        
        case 'if': {
          // Extract condition
          const ifMatch = stmt.content.match(/if\s*\((.+)\)/)
          if (ifMatch) {
            const conditionStr = ifMatch[1].trim()
            const conditionResult = evaluateSimpleCondition(conditionStr, env)
            
            if (conditionResult) {
              explanation = `Kondisi (${conditionStr}) = TRUE, masuk ke blok if`
              skipMode = false
            } else {
              explanation = `Kondisi (${conditionStr}) = FALSE, skip blok if`
              skipMode = true
              skipLevel = 0
            }
          }
          break
        }
        
        case 'else': {
          // Else will be executed if previous if was false
          // skipMode sudah di-set oleh if, kita balik aja logikanya
          explanation = `Blok else dieksekusi`
          skipMode = false
          break
        }
        
        case 'brace_open':
          explanation = `Masuk ke dalam blok`
          if (skipMode) {
            skipLevel++
          }
          break
          
        case 'brace_close':
          explanation = `Keluar dari blok`
          if (skipMode && skipLevel > 0) {
            skipLevel--
            if (skipLevel === 0) {
              skipMode = false
            }
          }
          break
          
        case 'return':
          explanation = `Mengembalikan nilai, program selesai`
          // Record step then break out of loop
          steps.push({
            stepIndex: steps.length,
            lineNumber: stmt.line,
            variables: env.getAllVariables(),
            output: env.getOutput(),
            explanation,
            scopeDepth: env.getCurrentScopeDepth(),
          })
          return {
            steps,
            totalSteps: steps.length,
            hasError: false,
          }
          
        default:
          explanation = `Statement: ${stmt.content.substring(0, 50)}`
      }
      
      if (shouldRecord && stmt.type !== 'cin') {
        steps.push({
          stepIndex: steps.length,
          lineNumber: stmt.line,
          variables: env.getAllVariables(),
          output: env.getOutput(),
          explanation,
          scopeDepth: env.getCurrentScopeDepth(),
        })
      }
      
      i++
    }
  } catch (error) {
    return {
      steps,
      totalSteps: steps.length,
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }
  }
  
  return {
    steps,
    totalSteps: steps.length,
    hasError: false,
  }
}

// Simple condition evaluator
function evaluateSimpleCondition(condition: string, env: RuntimeEnvironment): boolean {
  condition = condition.trim()
  
  // Handle operators
  const operators = ['>=', '<=', '==', '!=', '>', '<']
  
  for (const op of operators) {
    if (condition.includes(op)) {
      const [leftStr, rightStr] = condition.split(op).map(s => s.trim())
      
      let left: any = leftStr
      let right: any = rightStr
      
      // Get variable values
      if (leftStr.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        const var_ = env.getVariable(leftStr)
        left = var_?.value ?? 0
      } else if (!isNaN(Number(leftStr))) {
        left = Number(leftStr)
      }
      
      if (rightStr.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        const var_ = env.getVariable(rightStr)
        right = var_?.value ?? 0
      } else if (!isNaN(Number(rightStr))) {
        right = Number(rightStr)
      }
      
      switch (op) {
        case '>=': return left >= right
        case '<=': return left <= right
        case '==': return left == right
        case '!=': return left != right
        case '>': return left > right
        case '<': return left < right
      }
    }
  }
  
  // Single variable or value
  if (condition.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
    const var_ = env.getVariable(condition)
    return Boolean(var_?.value)
  }
  
  return Boolean(condition)
}