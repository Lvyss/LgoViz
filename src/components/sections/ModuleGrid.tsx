'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRef } from 'react'

type Module = {
  id: string
  title: string
  description: string
  icon: string
  topicCount: number
}

const modules: Module[] = [
  { id: 'percabangan', title: 'Percabangan', description: 'Pelajari logika if-else, switch-case, dan pengambilan keputusan.', icon: '🔀', topicCount: 5 },
  { id: 'perulangan', title: 'Perulangan', description: 'Kuasai for loop, while loop, dan teknik iterasi untuk efisiensi kode.', icon: '🔄', topicCount: 5 },
  { id: 'struktur-data', title: 'Struktur Data', description: 'Pahami array, stack, queue, dan algoritma sorting.', icon: '📊', topicCount: 8 },
]

const firstTopicByModule: Record<string, string> = {
  percabangan: 'if',
  perulangan: 'for-loop',
  'struktur-data': 'array',
}

// Variants untuk container header
const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, delay: 0.1, ease: "easeOut" }
  }
}

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }
  }
}

const descVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, delay: 0.4, ease: "easeOut" }
  }
}

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { 
    scaleX: 1, 
    opacity: 1,
    transition: { duration: 0.8, delay: 0.5, ease: "easeOut" }
  }
}

export default function ModuleGrid() {
  return (
    <section id="modul" className="relative py-32 overflow-hidden bg-black font-poppins">
      
      {/* AMBIENT MOVING BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -20, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 left-0 -translate-y-1/2 w-[500px] h-[300px] bg-orange-500/10 rounded-full blur-[100px]"
        />
        
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-1/2 w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[80px]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-20 max-w-6xl px-6 mx-auto">
        
        {/* HEADER - dengan whileInView repeatable */}
        <div className="relative mb-24">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <motion.div 
                variants={badgeVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="inline-block px-3 py-1 mb-4 border rounded-full border-orange-500/20 bg-orange-500/5"
              >
                <span className="text-[9px] tracking-[0.3em] uppercase text-orange-500 font-bold">Modul</span>
              </motion.div>
              
              <motion.h2 
                variants={titleVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="text-4xl font-semibold tracking-tighter text-white md:text-6xl"
              >
                Kurikulum <span className="text-orange-500">Visual</span>
              </motion.h2>
            </div>
            
            <motion.p 
              variants={descVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
              className="max-w-xs pl-6 text-sm font-light leading-relaxed text-gray-500 border-l border-white/10"
            >
              Pilih modul yang ingin kamu bedah. Setiap materi dilengkapi dengan debugger interaktif.
            </motion.p>
          </div>

          {/* Garis Molten */}
          <motion.div 
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="absolute -bottom-10 left-0 w-full h-[1px] bg-gradient-to-r from-orange-500/50 via-orange-500/10 to-transparent origin-left"
          />
        </div>

        {/* MODULE GRID */}
        <div className="grid gap-6 md:grid-cols-3">
          {modules.map((module, idx) => (
            <ModuleCard key={module.id} module={module} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Variants untuk card
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.9, 
      delay: 0.2,
      ease: [0.21, 0.47, 0.32, 1.01]
    }
  }
}

function ModuleCard({ module, index }: { module: Module, index: number }) {
  const firstTopic = firstTopicByModule[module.id] ?? 'if'

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      transition={{ delay: index * 0.15 }}  // delay lebih panjang per card
      className="[perspective:1000px]"
    >
      <Link href={`/learn/${module.id}/${firstTopic}`} className="relative block h-full group">
        <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/5 bg-[#080808] p-8 transition-all duration-500 group-hover:border-orange-500/20 group-hover:bg-[#0A0A0A] group-hover:shadow-[0_20px_50px_rgba(249,115,22,0.05)]">
          
          {/* ICON */}
          <div className="relative mb-8">
            <div className="absolute inset-0 transition-opacity rounded-full opacity-0 bg-orange-500/20 blur-2xl group-hover:opacity-100" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-2xl transition-all duration-500 group-hover:scale-110 group-hover:border-orange-500/20">
              {module.icon}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-[1px] bg-orange-500/30 group-hover:w-10 transition-all" />
              <span className="text-[9px] font-mono text-orange-500/60 uppercase tracking-wider">{module.topicCount} Topics</span>
            </div>
            
            <h3 className="mb-2 text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-orange-500">
              {module.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-500 transition-colors group-hover:text-gray-400">
              {module.description}
            </p>
          </div>

          {/* CTA Arrow */}
          <div className="flex justify-end mt-8">
            <div className="flex items-center justify-center w-8 h-8 transition-all border rounded-full border-white/10 text-white/20 group-hover:border-orange-500 group-hover:text-orange-500 group-hover:translate-x-1">
              →
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}