// Shared utilities untuk semua evaluator

export function evalExpression(expr: string, getVariable: (name: string) => any): any {
  expr = expr.trim().replace(/;$/, '')
  
  // String literal
  if (expr.startsWith('"') && expr.endsWith('"')) return expr.slice(1, -1)
  
  // Boolean
  if (expr === 'true') return true
  if (expr === 'false') return false
  
  // Number
  if (!isNaN(Number(expr))) return Number(expr)
  
  // Variable
  if (expr.match(/^[a-zA-Z_]\w*$/)) {
    return getVariable(expr) ?? 0
  }
  
  // Binary operations
  const binMatch = expr.match(/^(.+?)\s*([+\-*/%])\s*(.+)$/)
  if (binMatch) {
    const left = evalExpression(binMatch[1], getVariable)
    const right = evalExpression(binMatch[3], getVariable)
    switch (binMatch[2]) {
      case '+': return left + right
      case '-': return left - right
      case '*': return left * right
      case '/': return left / right
      case '%': return left % right
    }
  }
  
  return expr
}

export function evalCondition(cond: string, getVariable: (name: string) => any): boolean {
  cond = cond.trim()
  const operators = ['>=', '<=', '==', '!=', '>', '<', '&&', '||']
  
  for (const op of operators) {
    if (cond.includes(op)) {
      const parts = cond.split(op).map(s => s.trim())
      if (parts.length === 2) {
        const left = evalExpression(parts[0], getVariable)
        const right = evalExpression(parts[1], getVariable)
        
        if (op === '&&') return Boolean(left) && Boolean(right)
        if (op === '||') return Boolean(left) || Boolean(right)
        
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
  }
  
  if (cond.match(/^[a-zA-Z_]\w*$/)) {
    return Boolean(getVariable(cond))
  }
  
  return cond === 'true'
}

export function parseSimpleLine(line: string): { type: string; content: string; lineNumber: number } | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  
  // Declaration: int x = 5;
  const declMatch = trimmed.match(/^(int|float|double|char|bool|string)\s+(\w+)(?:\s*=\s*(.+))?;?$/)
  if (declMatch) {
    return { type: 'declaration', content: trimmed, lineNumber: 0 }
  }
  
  // Assignment: x = 10;
  const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+?);?$/)
  if (assignMatch && !trimmed.includes('==') && !trimmed.includes('!=')) {
    return { type: 'assignment', content: trimmed, lineNumber: 0 }
  }
  
  // If statement
  if (trimmed.startsWith('if')) {
    return { type: 'if', content: trimmed, lineNumber: 0 }
  }
  
  // Else if
  if (trimmed.startsWith('else if')) {
    return { type: 'else_if', content: trimmed, lineNumber: 0 }
  }
  
  // Else
  if (trimmed === 'else' || trimmed === 'else;') {
    return { type: 'else', content: trimmed, lineNumber: 0 }
  }
  
  // Cout
  if (trimmed.startsWith('cout')) {
    return { type: 'cout', content: trimmed, lineNumber: 0 }
  }
  
  // Cin
  if (trimmed.startsWith('cin')) {
    return { type: 'cin', content: trimmed, lineNumber: 0 }
  }
  
  // Return
  if (trimmed.startsWith('return')) {
    return { type: 'return', content: trimmed, lineNumber: 0 }
  }
  
  // Brace
  if (trimmed === '{') return { type: 'brace_open', content: '{', lineNumber: 0 }
  if (trimmed === '}') return { type: 'brace_close', content: '}', lineNumber: 0 }
  
  return { type: 'unknown', content: trimmed, lineNumber: 0 }
}

export function evalCout(content: string, getVariable: (name: string) => any): string {
  let text = content.replace(/cout\s*<<\s*/, '').replace(/;$/, '')
  const parts = text.split(/\s*<<\s*/)
  let output = ''
  
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed === 'endl') {
      output += '\n'
    } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      output += trimmed.slice(1, -1)
    } else if (trimmed.match(/^[a-zA-Z_]\w*$/)) {
      const val = getVariable(trimmed)
      output += val !== undefined ? String(val) : ''
    } else {
      output += trimmed
    }
  }
  return output
}