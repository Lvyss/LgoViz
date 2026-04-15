import { ParserResult } from './types'

interface ParsedStatement {
  type: string
  line: number
  content: string
}

export function parseCode(code: string): ParsedStatement[] {
  // First, normalize the code: remove includes and using namespace
  let normalizedCode = code
    .split('\n')
    .filter(line => {
      const trimmed = line.trim()
      return !trimmed.startsWith('#include') && !trimmed.startsWith('using namespace')
    })
    .join('\n')
  
  const statements: ParsedStatement[] = []
  let currentLine = 1
  let i = 0
  const lines = normalizedCode.split('\n')
  
  while (i < lines.length) {
    let line = lines[i].trim()
    const originalLineNum = i + 1
    
    // Skip empty lines
    if (line === '') {
      i++
      continue
    }
    
    // Skip comments
    if (line.startsWith('//')) {
      i++
      continue
    }
    
    // Check for multi-line statements (like if with brace on same line)
    let statement = line
    let j = i + 1
    
    // If line doesn't end with semicolon or brace, it might continue
    if (!line.endsWith(';') && !line.endsWith('}') && line !== '{' && !line.startsWith('if') && !line.startsWith('else')) {
      while (j < lines.length) {
        const nextLine = lines[j].trim()
        if (nextLine === '') {
          j++
          continue
        }
        statement += ' ' + nextLine
        if (nextLine.endsWith(';') || nextLine === '}') {
          j++
          break
        }
        j++
      }
    }
    
    // Determine statement type
    let type = determineType(statement)
    
    statements.push({
      type,
      line: originalLineNum,
      content: statement,
    })
    
    i = j || i + 1
  }
  
  return statements
}

function determineType(statement: string): string {
  const s = statement.trim()
  
  // Main function
  if (s === 'int main()' || s === 'int main(' || s.startsWith('int main()')) {
    return 'main_start'
  }
  
  // Braces
  if (s === '{') return 'brace_open'
  if (s === '}') return 'brace_close'
  
  // Return
  if (s.startsWith('return')) return 'return'
  
  // Cout
  if (s.includes('cout <<')) return 'cout'
  
  // Cin
  if (s.includes('cin >>')) return 'cin'
  
  // If statement (including those with { on same line)
  if (s.startsWith('if')) {
    return 'if'
  }
  
  // Else if
  if (s.startsWith('else if')) {
    return 'else_if'
  }
  
  // Else
  if (s === 'else' || s.startsWith('else {')) {
    return 'else'
  }
  
  // For loop
  if (s.startsWith('for')) return 'for'
  
  // While loop
  if (s.startsWith('while')) return 'while'
  
  // Do-while
  if (s.startsWith('do')) return 'do'
  
  // Break/Continue
  if (s === 'break;') return 'break'
  if (s === 'continue;') return 'continue'
  
  // Declaration
  if (s.match(/^(int|float|double|char|bool|string)\s+\w+/)) {
    return 'declaration'
  }
  
  // Assignment
  if (s.includes('=') && !s.includes('==') && s.endsWith(';')) {
    return 'assignment'
  }
  
  return 'unknown'
}

export function parseExpression(expr: string): any {
  expr = expr.replace(/;$/, '').trim()
  
  // If statement
  const ifMatch = expr.match(/^if\s*\((.+)\)/)
  if (ifMatch) {
    return {
      type: 'if',
      condition: ifMatch[1].trim(),
    }
  }
  
  // Else if
  const elseIfMatch = expr.match(/^else\s+if\s*\((.+)\)/)
  if (elseIfMatch) {
    return {
      type: 'else_if',
      condition: elseIfMatch[1].trim(),
    }
  }
  
  // Else
  if (expr === 'else' || expr.startsWith('else')) {
    return { type: 'else' }
  }
  
  // Assignment
  const assignMatch = expr.match(/^(\w+)\s*=\s*(.+)$/)
  if (assignMatch && !assignMatch[1].match(/^(int|float|double|char|bool|string)$/)) {
    return {
      type: 'assignment',
      variable: assignMatch[1],
      value: assignMatch[2].trim(),
    }
  }
  
  // Declaration
  const declMatch = expr.match(/^(int|float|double|char|bool|string)\s+(\w+)(?:\s*=\s*(.+))?/)
  if (declMatch) {
    return {
      type: 'declaration',
      varType: declMatch[1],
      variable: declMatch[2],
      initialValue: declMatch[3] ? declMatch[3].trim() : null,
    }
  }
  
  // Cout
  const coutMatch = expr.match(/cout\s*<<\s*(.+)/)
  if (coutMatch) {
    return {
      type: 'cout',
      value: coutMatch[1].trim(),
    }
  }
  
  // Cin
  const cinMatch = expr.match(/cin\s*>>\s*(\w+)/)
  if (cinMatch) {
    return {
      type: 'cin',
      variable: cinMatch[1],
    }
  }
  
  return { type: 'unknown', content: expr }
}

export function parseValue(value: string): any {
  value = value.trim()
  value = value.replace(/;$/, '')
  
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  
  if (!isNaN(Number(value)) && value !== '') {
    return Number(value)
  }
  
  if (value === 'true') return true
  if (value === 'false') return false
  
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    return { type: 'variable', name: value }
  }
  
  return value
}

export function parseCondition(condition: string): any {
  condition = condition.trim()
  
  const operators = ['>=', '<=', '==', '!=', '>', '<', '&&', '||']
  
  for (const op of operators) {
    if (condition.includes(op)) {
      const [left, right] = condition.split(op).map(s => s.trim())
      return {
        type: 'binary',
        operator: op,
        left: parseValue(left),
        right: parseValue(right),
      }
    }
  }
  
  return parseValue(condition)
}