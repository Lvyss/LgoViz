'use client'

import { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

interface PixelButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
}

export default function PixelButton({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props  // <-- props lainnya (onClick, disabled, type, dll)
}: PixelButtonProps) {
  const variantStyles = {
    primary: 'border-neon-green text-neon-green hover:bg-neon-green hover:text-pixel-dark',
    secondary: 'border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-pixel-dark',
    danger: 'border-red-500 text-red-500 hover:bg-red-500 hover:text-pixel-dark',
  }

  return (
    <motion.button
      className={`
        font-pixel text-[10px] md:text-xs
        px-4 md:px-6 py-3 md:py-4
        bg-transparent
        border-2
        ${variantStyles[variant]}
        cursor-pointer
        uppercase tracking-wider
        transition-all duration-75
        hover:shadow-[4px_4px_0px_rgba(0,255,136,0.5)]
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.05 }}
      {...props}  // <-- props lainnya (onClick, disabled, type, dll)
    >
      {children}
    </motion.button>
  )
}