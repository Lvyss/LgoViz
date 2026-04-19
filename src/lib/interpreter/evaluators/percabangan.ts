// lib/interpreter/evaluators/percabangan.ts - FINAL: NESTED IF + ELSE IF CHAIN

import { ExecutionTrace, EvaluateOptions } from '../core/types'

export async function evaluatePercabangan(
  code: string,
  options?: EvaluateOptions
): Promise<ExecutionTrace> {
  const steps: ExecutionTrace['steps'] = []
  const variables: Record<string, { value: any; type: string }> = {}
  let output: string[] = []
  let hasError = false
  let errorMessage = ''
  let shouldStop = false

  const getVar = (name: string) => variables[name]?.value
  const setVar = (name: string, value: any, type: string = 'int') => {
    variables[name] = { value, type }
  }
  const addOutput = (text: string) => output.push(text)

  const getVarsSnapshot = () => {
    const snapshot: Record<string, any> = {}
    for (const [k, v] of Object.entries(variables)) snapshot[k] = v.value
    return snapshot
  }

  const recordStep = (lineNum: number, explanation: string) => {
    const varsSnapshot = getVarsSnapshot()
    const step = {
      stepIndex: steps.length,
      lineNumber: lineNum,
      variables: Object.entries(varsSnapshot).map(([name, value]) => ({
        name, value, type: typeof value, changed: true
      })),
      output: [...output],
      explanation,
      scopeDepth: 0,
      skipped: false,
    }
    steps.push(step)
    options?.onStep?.(step)
  }

  const evalExpr = (expr: string): any => {
    expr = expr.trim().replace(/;$/, '')
    if (expr.startsWith('"') && expr.endsWith('"')) return expr.slice(1, -1)
    if (expr === 'true') return true
    if (expr === 'false') return false
    if (!isNaN(Number(expr))) return Number(expr)
    if (expr.match(/^[a-zA-Z_]\w*$/)) return getVar(expr) ?? 0
    const binMatch = expr.match(/^(.+?)\s*([+\-*/%])\s*(.+)$/)
    if (binMatch) {
      const left = evalExpr(binMatch[1])
      const right = evalExpr(binMatch[3])
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

  const evalCondition = (cond: string): boolean => {
    cond = cond.trim()
    if (cond.startsWith('(') && cond.endsWith(')')) return evalCondition(cond.slice(1, -1))
    const orParts = cond.split(/\|\|/)
    if (orParts.length > 1) {
      for (const part of orParts) if (evalCondition(part.trim())) return true
      return false
    }
    const andParts = cond.split(/&&/)
    if (andParts.length > 1) {
      for (const part of andParts) if (!evalCondition(part.trim())) return false
      return true
    }
    const operators = ['>=', '<=', '==', '!=', '>', '<']
    for (const op of operators) {
      if (cond.includes(op)) {
        const parts = cond.split(op).map(s => s.trim())
        if (parts.length === 2) {
          const left = evalExpr(parts[0])
          const right = evalExpr(parts[1])
          switch (op) {
            case '>=': return left >= right
            case '<=': return left <= right
            case '==': return left == right
            case '!=': return left != right
            case '>':  return left > right
            case '<':  return left < right
          }
        }
      }
    }
    if (cond.match(/^[a-zA-Z_]\w*$/)) return Boolean(getVar(cond))
    if (!isNaN(Number(cond))) return Number(cond) !== 0
    if (cond === 'true') return true
    if (cond === 'false') return false
    return false
  }

  const evalCout = (content: string): string => {
    let text = content.replace(/cout\s*<<\s*/, '').replace(/;$/, '')
    const parts = text.split(/\s*<<\s*/)
    let outputText = ''
    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed === 'endl') outputText += '\n'
      else if (trimmed.startsWith('"') && trimmed.endsWith('"')) outputText += trimmed.slice(1, -1)
      else if (trimmed.match(/^[a-zA-Z_]\w*$/)) {
        const val = getVar(trimmed)
        outputText += val !== undefined ? String(val) : ''
      } else outputText += trimmed
    }
    return outputText
  }

  // ============ PARSE LINES ============
  const originalLines = code.split(/\r?\n/)
  const contentLines: { text: string; lineNum: number }[] = []

  for (let i = 0; i < originalLines.length; i++) {
    let line = originalLines[i].trim()
    if (line.includes('//')) line = line.split('//')[0].trim()
    if (line === '') continue
    if (line.startsWith('#include')) continue
    if (line.startsWith('using namespace')) continue
    contentLines.push({ text: line, lineNum: i + 1 })
  }

  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║                    DEBUG: CONTENT LINES                      ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  contentLines.forEach((l, i) => console.log(`  [${i}] L${l.lineNum}: "${l.text}"`))

  // ============ FIND MAIN ============
  let mainStartIdx = -1
  let mainStartLineNum = 0

  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].text
    if (line.includes('main') && line.includes('(') && line.includes(')')) {
      mainStartIdx = i
      mainStartLineNum = contentLines[i].lineNum
      if (line.includes('{')) mainStartIdx = i + 1
      break
    }
  }

  console.log(`\nmainStartIdx: ${mainStartIdx}, mainStartLineNum: ${mainStartLineNum}`)

  if (mainStartIdx === -1) {
    return { steps: [], totalSteps: 0, hasError: true, errorMessage: 'Function main() not found' }
  }

  // ============ FIND MAIN END ============
  let braceCount = 0
  let foundOpen = false
  let lastBraceIdx = -1

  for (let i = mainStartIdx; i < contentLines.length; i++) {
    const line = contentLines[i].text
    const openCount = (line.match(/\{/g) || []).length
    const closeCount = (line.match(/\}/g) || []).length
    if (openCount > 0) { braceCount += openCount; foundOpen = true }
    if (closeCount > 0) braceCount -= closeCount
    if (foundOpen && braceCount === 0) lastBraceIdx = i
  }

  const mainEndIdx = lastBraceIdx !== -1 ? lastBraceIdx + 1 : contentLines.length
  let bodyLines = contentLines.slice(mainStartIdx, mainEndIdx)
  if (bodyLines.length > 0 && bodyLines[0].text === '{') bodyLines = bodyLines.slice(1)

  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║                    DEBUG: FINAL BODY LINES                    ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  bodyLines.forEach((l, i) => console.log(`  [${i}] L${l.lineNum}: "${l.text}"`))

  recordStep(mainStartLineNum, '🚀 Memulai program main()')

  // ============ STATE MACHINE ============
  // Konsep kunci:
  // - Setiap { push state ke stack, setiap } pop state dari stack
  // - } else if / } else : pop → eval → push
  // - ifPendingElse & ifBranchSelected di stack menyimpan hasil IF
  //   supaya } else if / } else berikutnya bisa membaca hasilnya
  interface BlockState {
    parentSkipMode: boolean
    parentPendingElse: boolean
    parentBranchSelected: boolean
    ifPendingElse: boolean      // hasil IF di level ini: masih nunggu else?
    ifBranchSelected: boolean   // hasil IF di level ini: sudah ada yang true?
  }

  const stateStack: BlockState[] = []
  let currentSkipMode = false
  let currentPendingElse = false
  let currentBranchSelected = false

  // Helper: push block baru, warisi skipMode dari parent
  const pushBlock = (
    skipMode = currentSkipMode,
    pendingElse = currentPendingElse,
    branchSelected = currentBranchSelected
  ) => {
    stateStack.push({
      parentSkipMode: skipMode,
      parentPendingElse: pendingElse,
      parentBranchSelected: branchSelected,
      ifPendingElse: pendingElse,
      ifBranchSelected: branchSelected,
    })
    currentPendingElse = false
    currentBranchSelected = false
    // currentSkipMode TIDAK direset — diwarisi
  }

  // Helper: update ifPendingElse & ifBranchSelected di top of stack
  const updateStackIfState = () => {
    if (stateStack.length > 0) {
      stateStack[stateStack.length - 1].ifPendingElse = currentPendingElse
      stateStack[stateStack.length - 1].ifBranchSelected = currentBranchSelected
    }
  }

  // Helper: handle } else if / } else — pop lalu eval lalu push
const handleCloseThenBranch = (lineNum: number, isElseIf: boolean, condition?: string): boolean => {
  if (stateStack.length === 0) return false

  const prev = stateStack.pop()!
  const parentSkipMode = prev.parentSkipMode
  const savedPendingElse = prev.ifPendingElse
  const savedBranchSelected = prev.ifBranchSelected

  // Restore parent state
  currentSkipMode = prev.parentSkipMode
  currentPendingElse = prev.parentPendingElse
  currentBranchSelected = prev.parentBranchSelected

  if (parentSkipMode) {
    currentSkipMode = true
    currentBranchSelected = false
    currentPendingElse = false
  } else if (savedBranchSelected) {
    currentSkipMode = true
    currentBranchSelected = true
    currentPendingElse = false
  } else if (savedPendingElse) {
    if (isElseIf && condition !== undefined) {
      const condResult = evalCondition(condition)
      console.log(`    Condition: "${condition}" → ${condResult ? 'TRUE ✅' : 'FALSE ❌'}`)
      recordStep(lineNum, `🔀 ELSE IF: "${condition}" → ${condResult ? '✅ TRUE' : '❌ FALSE'}`)
      if (condResult) {
        currentSkipMode = false
        currentBranchSelected = true
        currentPendingElse = false
      } else {
        currentSkipMode = true
        currentBranchSelected = false
        currentPendingElse = true
      }
    } else {
      currentSkipMode = false
      currentBranchSelected = true
      currentPendingElse = false
    }
  }

  // Return parentSkipMode supaya caller bisa pakai untuk push berikutnya
  return parentSkipMode
}

  let idx = 0

  while (idx < bodyLines.length && !shouldStop) {
    const { text: line, lineNum } = bodyLines[idx]

    console.log(`\n╔══════════════════════════════════════════════════════════════╗`)
    console.log(`║ EXECUTING LINE [${idx}] L${lineNum}: "${line.substring(0, 60)}"`)
    console.log(`║ skipMode=${currentSkipMode}, pendingElse=${currentPendingElse}, branchSelected=${currentBranchSelected}`)
    console.log(`╚══════════════════════════════════════════════════════════════╝`)

    // ── 1. OPEN BRACE standalone ──────────────────────────────────
    if (line === '{') {
      console.log(`  → OPEN BRACE: pushBlock`)
      pushBlock()
      idx++; continue
    }

// ── 2. CLOSE BRACE standalone ─────────────────────────────────
    if (line === '}') {
      console.log(`  → CLOSE BRACE: popBlock`)
      if (stateStack.length > 0) {
        const prev = stateStack.pop()!
        currentSkipMode = prev.parentSkipMode
        currentPendingElse = prev.parentPendingElse
        currentBranchSelected = prev.parentBranchSelected
      }
      idx++; continue
    }

const closeElseIfMatch = line.match(/^\}\s*else\s+if\s*\((.+)\)\s*\{?$/)
if (closeElseIfMatch) {
  console.log(`  → TYPE: } ELSE IF {`)
  const condition = closeElseIfMatch[1].trim()
  const parentSkipMode = handleCloseThenBranch(lineNum, true, condition)

  const branchSelectedNow = currentBranchSelected
  const pendingElseNow = currentPendingElse

  if (line.includes('{')) {
    stateStack.push({
      parentSkipMode: parentSkipMode,  // ← pakai parentSkipMode dari sebelum chain
      parentPendingElse: false,
      parentBranchSelected: false,
      ifPendingElse: pendingElseNow,
      ifBranchSelected: branchSelectedNow,
    })
    currentPendingElse = false
    currentBranchSelected = false
  }

  idx++; continue
}

// ── 4. "} else {" ────────────────────────────────────────────
if (line.match(/^\}\s*else(\s*\{.*)?$/)) {
  console.log(`  → TYPE: } ELSE {`)
  const parentSkipMode = handleCloseThenBranch(lineNum, false)

  const branchSelectedNow = currentBranchSelected
  const pendingElseNow = currentPendingElse

  if (line.includes('{')) {
    stateStack.push({
      parentSkipMode: parentSkipMode,  // ← sama
      parentPendingElse: false,
      parentBranchSelected: false,
      ifPendingElse: pendingElseNow,
      ifBranchSelected: branchSelectedNow,
    })
    currentPendingElse = false
    currentBranchSelected = false
  }

  idx++; continue
}
    // ── 5. IF ─────────────────────────────────────────────────────
    const ifMatch = line.match(/^if\s*\((.+)\)\s*\{?$/)
    if (ifMatch) {
      const condition = ifMatch[1].trim()

      // Push SEBELUM eval — simpan state parent
      if (line.includes('{')) pushBlock()

      if (currentSkipMode) {
        console.log(`  → TYPE: IF (skipped)`)
        idx++; continue
      }

      const condResult = evalCondition(condition)
      console.log(`  → TYPE: IF\n    Condition: "${condition}" → ${condResult ? 'TRUE ✅' : 'FALSE ❌'}`)
      recordStep(lineNum, `🔀 IF: Memeriksa kondisi "${condition}" → ${condResult ? '✅ TRUE' : '❌ FALSE'}`)

      if (condResult) {
        currentBranchSelected = true
        currentPendingElse = false
        currentSkipMode = false
      } else {
        currentBranchSelected = false
        currentPendingElse = true
        currentSkipMode = true
      }

      // Update stack entry dengan hasil IF
      if (line.includes('{')) updateStackIfState()

      idx++; continue
    }

    // ── 6. ELSE IF standalone ("else if (...) {") ─────────────────
    const elseIfMatch = line.match(/^else\s+if\s*\((.+)\)\s*\{?$/)
    if (elseIfMatch) {
      console.log(`  → TYPE: ELSE IF standalone`)
      const condition = elseIfMatch[1].trim()

      if (currentPendingElse && !currentBranchSelected) {
        const condResult = evalCondition(condition)
        console.log(`    Condition: "${condition}" → ${condResult ? 'TRUE ✅' : 'FALSE ❌'}`)
        recordStep(lineNum, `🔀 ELSE IF: "${condition}" → ${condResult ? '✅ TRUE' : '❌ FALSE'}`)

        if (condResult) {
          currentSkipMode = false
          currentBranchSelected = true
          currentPendingElse = false
        }
        // false: skipMode tetap true, pendingElse tetap true
      } else {
        console.log(`  → ELSE IF skipped (branch already selected)`)
        currentSkipMode = true
      }

      if (line.includes('{')) {
        pushBlock()
        updateStackIfState()
      }

      idx++; continue
    }

    // ── 7. ELSE standalone ────────────────────────────────────────
    if (line === 'else' || line === 'else {') {
      console.log(`  → TYPE: ELSE standalone`)

      if (currentPendingElse && !currentBranchSelected) {
        console.log(`  → ELSE executing`)
        currentSkipMode = false
        currentBranchSelected = true
        currentPendingElse = false
      } else {
        console.log(`  → ELSE skipped`)
        currentSkipMode = true
      }

      if (line.includes('{')) {
        pushBlock()
        updateStackIfState()
      }

      idx++; continue
    }

    // ── 8. DECLARATION ────────────────────────────────────────────
    const declMatch = line.match(/^(int|float|double|char|bool|string)\s+(\w+)(?:\s*=\s*(.+))?;?$/)
    if (declMatch) {
      if (!currentSkipMode) {
        console.log(`  → TYPE: DECLARATION`)
        const varType = declMatch[1]
        const varName = declMatch[2]
        let value: any = 0
        if (declMatch[3]) value = evalExpr(declMatch[3].trim().replace(/;$/, ''))
        setVar(varName, value, varType)
        recordStep(lineNum, `📦 Deklarasi variabel: ${varType} ${varName} = ${JSON.stringify(value)}`)
      } else {
        console.log(`  → TYPE: DECLARATION (skipped)`)
      }
      idx++; continue
    }

    // ── 9. CIN ────────────────────────────────────────────────────
    if (line.startsWith('cin')) {
      if (!currentSkipMode) {
        console.log(`  → TYPE: CIN`)
        const cinMatch = line.match(/cin\s*>>\s*(\w+)/)
        if (cinMatch && options?.onInput) {
          const varName = cinMatch[1]
          recordStep(lineNum, `⌨️ Meminta input untuk variabel: ${varName}`)
          const inputValue = await options.onInput(varName, 'int')
          const parsedValue = parseInt(inputValue) || 0
          setVar(varName, parsedValue)
          recordStep(lineNum, `✅ Input diterima: ${varName} = ${parsedValue}`)
        }
      } else {
        console.log(`  → TYPE: CIN (skipped)`)
      }
      idx++; continue
    }

    // ── 10. COUT ──────────────────────────────────────────────────
    if (line.startsWith('cout')) {
      if (!currentSkipMode) {
        console.log(`  → TYPE: COUT (executing)`)
        const outputText = evalCout(line)
        addOutput(outputText)
        recordStep(lineNum, `📤 Output: "${outputText.replace(/\n/g, '\\n')}"`)
      } else {
        console.log(`  → TYPE: COUT (skipped)`)
      }
      idx++; continue
    }

    // ── 11. ASSIGNMENT ────────────────────────────────────────────
    const assignMatch = line.match(/^(\w+)\s*=\s*(.+?);?$/)
    if (assignMatch && !line.includes('==') && !line.includes('!=')) {
      if (!currentSkipMode) {
        console.log(`  → TYPE: ASSIGNMENT`)
        const varName = assignMatch[1]
        const newValue = evalExpr(assignMatch[2].trim())
        setVar(varName, newValue)
        recordStep(lineNum, `📝 Assign: ${varName} = ${JSON.stringify(newValue)}`)
      } else {
        console.log(`  → TYPE: ASSIGNMENT (skipped)`)
      }
      idx++; continue
    }

    // ── 12. RETURN ────────────────────────────────────────────────
    if (line.startsWith('return')) {
      console.log(`  → TYPE: RETURN`)
      recordStep(lineNum, `✅ Program selesai (return 0)`)
      shouldStop = true
      idx++; continue
    }

    console.log(`  → TYPE: UNKNOWN - ${currentSkipMode ? 'skipped' : 'executed'}`)
    idx++
  }

  if (!shouldStop && steps.length > 0) {
    const lastStep = steps[steps.length - 1]
    if (lastStep && !lastStep.explanation.includes('selesai') && !lastStep.explanation.includes('return')) {
      const lastLine = bodyLines.length > 0 ? bodyLines[bodyLines.length - 1].lineNum : 0
      recordStep(lastLine, '🏁 Program selesai')
    }
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║                    DEBUG: FINAL STEPS                        ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  steps.forEach((s, i) => console.log(`  ${i + 1}. L${s.lineNumber} ${s.explanation}`))

  return {
    steps,
    totalSteps: steps.length,
    hasError,
    errorMessage,
  }
}