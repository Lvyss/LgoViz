'use client';
import Link from 'next/link';
import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface PixelButtonProps extends Omit<HTMLMotionProps<"button">, 'ref'> {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export default function PixelButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}: PixelButtonProps) {
  const baseClass = `font-pixel inline-block border-2 cursor-pointer transition-all duration-100 uppercase tracking-wider ${
    variant === 'primary'
      ? 'border-neon-green text-neon-green hover:bg-neon-green hover:text-black'
      : 'border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black'
  } ${
    size === 'sm' ? 'text-[10px] px-4 py-2' 
    : size === 'md' ? 'text-xs px-6 py-3' 
    : 'text-sm px-8 py-4'
  } ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {children}
      </Link>
    );
  }

  return (
    <motion.button
      className={baseClass}
      disabled={disabled}
      whileHover={{ x: -2, y: -2 }}
      whileTap={{ x: 0, y: 0 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}