import { ReactNode } from 'react'

interface PixelCardProps {
  children: ReactNode
  className?: string
  glow?: boolean
}

export default function PixelCard({ children, className = '', glow = false }: PixelCardProps) {
  return (
    <div
      className={`
        bg-pixel-panel
        border-2 border-neon-green
        p-4 md:p-6
        ${glow ? 'shadow-[0_0_15px_rgba(0,255,136,0.3)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}