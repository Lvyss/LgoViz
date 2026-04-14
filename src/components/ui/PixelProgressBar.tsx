'use client'

interface PixelProgressBarProps {
  value: number
  max: number
  className?: string
}

export default function PixelProgressBar({ 
  value, 
  max, 
  className = '' 
}: PixelProgressBarProps) {
  const percentage = (value / max) * 100

  return (
    <div className={`
      w-full h-4
      bg-pixel-darker
      border-2 border-neon-green
      overflow-hidden
      ${className}
    `}>
      <div 
        className="h-full bg-neon-green transition-all duration-150"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}