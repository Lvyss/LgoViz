'use client'

import { useState, useEffect, useRef } from 'react'

interface InputModalProps {
  isOpen: boolean
  variableName: string
  variableType: string
  onSubmit: (value: string) => void
  onCancel?: () => void
}

export default function InputModal({
  isOpen,
  variableName,
  variableType,
  onSubmit,
  onCancel,
}: InputModalProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setError('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  // ✅ VALIDASI BERDASARKAN TIPE
  const validateInput = (value: string): boolean => {
    const trimmed = value.trim()
    
    if (trimmed === '') {
      setError('Input tidak boleh kosong')
      return false
    }

    switch (variableType) {
      case 'int':
        // Hanya angka integer (boleh negatif)
        if (!/^-?\d+$/.test(trimmed)) {
          setError('❌ Harus berupa angka bulat! Contoh: 42, -10, 100')
          return false
        }
        break

      case 'float':
      case 'double':
        // Angka desimal (boleh negatif, boleh titik)
        if (!/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
          setError('❌ Harus berupa angka desimal! Contoh: 3.14, -2.5, 100')
          return false
        }
        break

      case 'bool':
        // true/false/1/0 (case insensitive)
        if (!/^(true|false|[01])$/i.test(trimmed)) {
          setError('❌ Harus berupa nilai boolean! Contoh: true, false, 1, 0')
          return false
        }
        break

      case 'char':
        // Hanya 1 karakter
        if (trimmed.length !== 1) {
          setError('❌ Harus 1 karakter saja! Contoh: A, b, 1, @')
          return false
        }
        break

      case 'string':
        // String bisa apa saja, asal tidak kosong
        if (trimmed.length === 0) {
          setError('❌ String tidak boleh kosong!')
          return false
        }
        break

      default:
        break
    }

    setError('')
    return true
  }

  // ✅ HANDLE PERUBAHAN INPUT DENGAN VALIDASI LANGSUNG
  const handleInputChange = (value: string) => {
    setInputValue(value)
    
    // Validasi real-time (opsional, bisa juga hanya di submit)
    if (value.trim() !== '') {
      validateInput(value)
    } else {
      setError('')
    }
  }

  // ✅ HANDLE SUBMIT
  const handleSubmit = () => {
    if (!validateInput(inputValue)) {
      return
    }
    
    // Parse nilai sesuai tipe sebelum dikirim
    let parsedValue = inputValue.trim()
    
    switch (variableType) {
      case 'int':
        parsedValue = parseInt(parsedValue, 10).toString()
        break
      case 'float':
      case 'double':
        parsedValue = parseFloat(parsedValue).toString()
        break
      case 'bool':
        const lower = parsedValue.toLowerCase()
        if (lower === 'true' || lower === '1') {
          parsedValue = 'true'
        } else {
          parsedValue = 'false'
        }
        break
      case 'char':
        parsedValue = parsedValue.charAt(0)
        break
    }
    
    onSubmit(parsedValue)
  }

  // ✅ HANDLE ENTER KEY
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && !error) {
      handleSubmit()
    }
  }

  // ✅ GET PLACEHOLDER
  const getPlaceholder = () => {
    switch (variableType) {
      case 'int':
        return 'Contoh: 42, -10, 100'
      case 'float':
        return 'Contoh: 3.14, -2.5, 100.0'
      case 'bool':
        return 'Contoh: true / false / 1 / 0'
      case 'char':
        return 'Contoh: A, b, 1, @'
      default:
        return 'Masukkan nilai...'
    }
  }

  // ✅ GET EXAMPLE
  const getExample = () => {
    switch (variableType) {
      case 'int':
        return '42'
      case 'float':
        return '3.14'
      case 'bool':
        return 'true'
      case 'char':
        return 'A'
      default:
        return 'hello'
    }
  }

  // ✅ Warna berdasarkan tipe
  const getColorStyle = () => {
    switch (variableType) {
      case 'int':
        return {
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          button: 'from-emerald-500 to-emerald-600',
          ring: 'focus:ring-emerald-500',
          icon: '🔢',
        }
      case 'float':
      case 'double':
        return {
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          bg: 'bg-blue-500/10',
          button: 'from-blue-500 to-blue-600',
          ring: 'focus:ring-blue-500',
          icon: '🔢',
        }
      case 'bool':
        return {
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          bg: 'bg-purple-500/10',
          button: 'from-purple-500 to-purple-600',
          ring: 'focus:ring-purple-500',
          icon: '⚖️',
        }
      case 'char':
        return {
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          bg: 'bg-orange-500/10',
          button: 'from-orange-500 to-orange-600',
          ring: 'focus:ring-orange-500',
          icon: '🔤',
        }
      default:
        return {
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          bg: 'bg-gray-500/10',
          button: 'from-gray-500 to-gray-600',
          ring: 'focus:ring-gray-500',
          icon: '📝',
        }
    }
  }

  const colorStyle = getColorStyle()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      
      {/* Modal */}
      <div className="relative z-10 w-[90vw] max-w-md animate-[fadeInUp_0.2s_ease-out]">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorStyle.button} rounded-xl blur-xl opacity-20`} />
        
        <div className={`relative bg-gradient-to-b from-[#0f0f1a] to-[#0a0a0f] rounded-xl border ${colorStyle.border} shadow-2xl overflow-hidden`}>
          
          {/* Header */}
          <div className={`px-6 py-4 border-b ${colorStyle.border} ${colorStyle.bg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${colorStyle.bg} flex items-center justify-center text-xl`}>
                {colorStyle.icon}
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${colorStyle.text}`}>
                  Input Required
                </h3>
                <p className="text-xs text-gray-500">
                  Masukkan nilai untuk variabel <span className="font-mono">{variableName}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Variable Info */}
            <div className={`p-4 rounded-lg border ${colorStyle.border} ${colorStyle.bg}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="text-xs text-gray-500">Variable</p>
                    <code className={`text-xl font-mono font-semibold ${colorStyle.text}`}>
                      {variableName}
                    </code>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md ${colorStyle.bg} border ${colorStyle.border}`}>
                  <span className="font-mono text-xs text-gray-400">{variableType}</span>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Nilai <span className="text-xs text-gray-500">({variableType})</span>
                </label>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-4 py-3 rounded-lg bg-[#13131f] border ${error ? 'border-red-500' : colorStyle.border} text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-${colorStyle.text} focus:ring-2 ${colorStyle.ring} focus:ring-opacity-50`}
                  placeholder={getPlaceholder()}
                  autoComplete="off"
                />
                
                {/* Error Message */}
                {error && (
                  <p className="flex items-center gap-1 mt-2 text-sm text-red-400">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </p>
                )}
                
                {/* Hint / Example */}
                {!error && (
                  <p className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <span>💡</span>
                    <span>Contoh: <code className="px-1 bg-gray-800 rounded">{getExample()}</code></span>
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!inputValue.trim() || !!error}
                  className={`flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r ${colorStyle.button} text-white font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    <span>Submit</span>
                    <span>⏎</span>
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className={`px-6 py-3 border-t ${colorStyle.border} ${colorStyle.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colorStyle.text} animate-pulse`} />
                <span className="text-xs text-gray-500">
                  {variableType === 'int' && 'Integer number only'}
                  {variableType === 'float' && 'Decimal number only'}
                  {(variableType === 'double') && 'Decimal number only'}
                  {variableType === 'bool' && 'Boolean value (true/false/1/0)'}
                  {variableType === 'char' && 'Single character only'}
                  {variableType === 'string' && 'Text value'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Type</span>
                <span className={`text-xs font-mono ${colorStyle.text}`}>{variableType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}