'use client'

import { ReactNode } from 'react'

interface PixelBadgeProps {
  children: ReactNode
  variant?: 'green' | 'blue' | 'purple' | 'yellow'
  className?: string
}

export default function PixelBadge({ 
  children, 
  variant = 'green', 
  className = '' 
}: PixelBadgeProps) {
  const variants = {
    green: 'border-neon-green text-neon-green',
    blue: 'border-neon-blue text-neon-blue',
    purple: 'border-neon-purple text-neon-purple',
    yellow: 'border-neon-yellow text-neon-yellow',
  }

  return (
    <span className={`
      inline-block
      font-pixel text-[8px] md:text-[10px]
      px-2 py-1
      border-2
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  )
}