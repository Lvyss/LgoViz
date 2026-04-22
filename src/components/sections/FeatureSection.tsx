'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'

type Feature = {
  icon: string
  title: string
  description: string
  className?: string
}

const features: Feature[] = [
  { 
    icon: '🎮', 
    title: 'Visual Interaktif', 
    description: 'Highlight baris kode C++ secara real-time saat dieksekusi.',
    className: 'md:col-span-2' 
  },
  { 
    icon: '⚡', 
    title: 'Variable Tracker', 
    description: 'Monitor perubahan nilai variabel di memori secara instan.',
    className: 'md:col-span-1' 
  },
  { 
    icon: '📚', 
    title: '15+ Topik', 
    description: 'Kurikulum lengkap dari fundamental hingga struktur data.',
    className: 'md:col-span-1' 
  },
  { 
    icon: '⌨️', 
    title: 'Code Editor', 
    description: 'Tulis dan modifikasi kode langsung di dalam browser.',
    className: 'md:col-span-1' 
  },
  { 
    icon: '🎬', 
    title: 'Logic Control', 
    description: 'Atur kecepatan eksekusi, play, atau pause sesukamu.',
    className: 'md:col-span-1' 
  },
]

export default function FeatureSection() {
  return (
    <section id="fitur" className="relative py-24 overflow-hidden bg-black font-poppins">
      
      {/* AMBIENT MOLTEN GLOW */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-orange-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-20 max-w-6xl px-6 mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col items-start pl-8 mb-20 border-l border-orange-500/30">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            // viewport={{ once: true }}  ← HAPUS atau ganti jadi false
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-[10px] tracking-[0.5em] uppercase text-orange-500 font-semibold">Fitur</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-4xl font-light leading-tight tracking-tight text-white md:text-5xl"
          >
            Instrumen presisi untuk <br />
            <span className="italic text-white/40">membedah logika program.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-lg text-xs leading-relaxed text-gray-400 font-poppins"
          >
            LgoViz mengubah baris kode yang abstrak menjadi visualisasi interaktif, memudahkan Anda memahami alur algoritma secara mendalam.
          </motion.p>
        </div>

        {/* FEATURE GRID */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index }: { feature: Feature, index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}  // ← HAPUS atau ganti false
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className={`
        group relative overflow-hidden rounded-2xl 
        border border-white/5 bg-[#050505]
        p-8 transition-all duration-300 hover:border-orange-500/20
        ${feature.className || ''}
      `}
    >
      {/* SPOTLIGHT EFFECT */}
      <div 
        className="absolute transition-opacity duration-500 opacity-0 pointer-events-none -inset-px group-hover:opacity-100"
        style={{
          background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.05), transparent 40%)`
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/10 text-xl grayscale group-hover:grayscale-0 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all duration-500">
            {feature.icon}
          </div>
          <h3 className="text-base font-semibold tracking-tight text-white/90">
            {feature.title}
          </h3>
        </div>
        
        <p className="text-xs font-light leading-relaxed text-gray-500 transition-colors group-hover:text-gray-300">
          {feature.description}
        </p>

        {/* Bar bawah */}
        <div className="mt-6 h-[1px] w-6 bg-orange-500/30 group-hover:w-full transition-all duration-700" />
      </div>
    </motion.div>
  )
}

