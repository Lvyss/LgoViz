import { ExecutionTrace, EvaluateOptions, EvaluatorType } from '../core/types'
import { evaluatePercabangan } from './percabangan'
// nanti tambah: import { evaluatePerulangan } from './perulangan'
// nanti tambah: import { evaluateStrukturData } from './struktur-data'

export async function evaluateByType(
  code: string,
  type: EvaluatorType,
  options?: EvaluateOptions
): Promise<ExecutionTrace> {
  switch (type) {
    case 'percabangan':
      return evaluatePercabangan(code, options)
    case 'perulangan':
      // return evaluatePerulangan(code, options)
      return {
        steps: [],
        totalSteps: 0,
        hasError: true,
        errorMessage: 'Modul perulangan masih dalam pengembangan (Coming Soon)'
      }
    case 'struktur-data':
      return {
        steps: [],
        totalSteps: 0,
        hasError: true,
        errorMessage: 'Modul struktur data masih dalam pengembangan (Coming Soon)'
      }
    default:
      return {
        steps: [],
        totalSteps: 0,
        hasError: true,
        errorMessage: 'Evaluator tidak ditemukan'
      }
  }
}