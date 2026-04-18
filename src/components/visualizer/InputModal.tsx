'use client'

import { useState, useEffect, useRef } from 'react'
import PixelCard from '../ui/PixelCard'
import PixelButton from '../ui/PixelButton'

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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  const getInputType = () => {
    switch (variableType) {
      case 'int':
      case 'float':
      case 'double':
        return 'number'
      case 'bool':
        return 'text'
      default:
        return 'text'
    }
  }

  const getPlaceholder = () => {
    switch (variableType) {
      case 'int':
        return 'Contoh: 42'
      case 'float':
        return 'Contoh: 3.14'
      case 'bool':
        return 'Contoh: true / false / 1 / 0'
      case 'char':
        return 'Contoh: A'
      default:
        return 'Masukkan nilai...'
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() !== '') {
      onSubmit(inputValue)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
      <div className="relative">
        {/* CRT flicker effect */}
        <div className="absolute inset-0 pointer-events-none bg-neon-green/5 animate-pulse" />
        
        <PixelCard glow className="w-[90vw] max-w-md">
          <div className="mb-4 text-center">
            <div className="inline-block mb-2">
              <span className="font-mono text-sm text-neon-green animate-pixel-blink">
                █ INPUT_REQUIRED █
              </span>
            </div>
            <h3 className="mb-2 text-sm font-pixel text-neon-blue">
              Masukkan nilai untuk variabel
            </h3>
            <div className="inline-block p-3 border-2 bg-pixel-dark border-neon-green/50">
              <code className="font-mono text-lg text-neon-green">
                {variableName}
              </code>
              <span className="ml-2 font-mono text-sm text-text-muted">
                ({variableType})
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-mono text-sm text-text-secondary">
                Nilai:
              </label>
              <input
                ref={inputRef}
                type={getInputType()}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-3 font-mono text-lg text-center border-2 outline-none bg-pixel-dark border-neon-green/50 focus:border-neon-green text-text-primary"
                placeholder={getPlaceholder()}
                step={variableType === 'float' ? 'any' : '1'}
              />
            </div>

            <div className="flex gap-3">
              {onCancel && (
                <PixelButton 
                  type="button" 
                  variant="secondary" 
                  onClick={onCancel}
                  className="flex-1"
                >
                  CANCEL
                </PixelButton>
              )}
              <PixelButton 
                type="submit" 
                className="flex-1"
              >
                ⚡ SUBMIT
              </PixelButton>
            </div>
          </form>

          <p className="mt-4 font-mono text-xs text-center text-text-muted">
            Tekan Enter untuk submit
          </p>
        </PixelCard>
      </div>
    </div>
  )
}