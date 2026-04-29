'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HeroSection() {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [showSubtitle, setShowSubtitle] = useState(false)
  
  const fullText = 'LgoViz'
  
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i + 1))
      i++
      if (i === fullText.length) {
        clearInterval(interval)
        setTimeout(() => setShowSubtitle(true), 0)
        setTimeout(() => setShowCursor(false), 2500)
      }
    }, 120)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative flex flex-col items-center min-h-screen overflow-hidden text-white bg-black">
      
      {/* STAIRCASE */}
      <div className="stair-container">
        {[85, 70, 55, 40, 30, 40, 55, 70, 85].map((height, idx) => (
          <div key={idx} className={`stair-item stair-${idx + 1}`} style={{ height: `${height}vh` }}>
            <div className="molten-line" />
            
            {idx === 0 && (
              <>
                <div className="side-line side-static h-[15%] side-thin" />
                <div className="side-line side-fast-fade h-[40%] delay-2000 side-thin" />
                <div className="side-line side-fast-fade h-[10%] delay-5000 side-thin" />
              </>
            )}
            {idx === 1 && (
              <>
                <div className="side-line side-static h-[80%] side-thick" />
                <div className="side-line side-fast-fade h-[75%] delay-7000 side-thin" />
              </>
            )}
            {idx === 2 && (
              <>
                <div className="side-line side-static h-[35%] side-thin" />
                <div className="side-line side-fast-fade h-[20%] delay-3000 side-thick" />
                <div className="side-line side-fast-fade h-[45%] delay-8000 side-thin" />
              </>
            )}
            {idx === 3 && (
              <>
                <div className="side-line side-static h-[10%] side-thin" />
                <div className="side-line side-fast-fade h-[55%] delay-4000 side-thick" />
              </>
            )}
            {idx === 4 && (
              <>
                <div className="side-line side-static h-[5%] side-thick" />
                <div className="side-line side-fast-fade h-[15%] delay-9000 side-thin" />
              </>
            )}
            {idx === 5 && (
              <>
                <div className="side-line side-static h-[40%] side-thick" />
                <div className="side-line side-fast-fade h-[30%] delay-6000 side-thick" />
                <div className="side-line side-fast-fade h-[10%] delay-2500 side-thick" />
              </>
            )}
            {idx === 6 && (
              <>
                <div className="side-line side-static h-[90%] side-thick" />
                <div className="side-line side-fast-fade h-[50%] delay-7500 side-thin" />
              </>
            )}
            {idx === 7 && (
              <>
                <div className="side-line side-static h-[25%] side-thin" />
                <div className="side-line side-fast-fade h-[80%] delay-3500 side-thick" />
              </>
            )}
            {idx === 8 && (
              <>
                <div className="side-line side-static h-[50%] side-thin" />
                <div className="side-line side-fast-fade h-[20%] delay-1500 side-thin" />
                <div className="side-line side-fast-fade h-[40%] delay-6500 side-thin" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* AMBIENCE GLOW */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.01] rounded-full blur-[120px] z-[1]" />

      {/* HERO CONTENT - PERKECIL PADDING & TEXT */}
      <div className="relative z-20 w-full px-4 pt-[9vh]">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* JUDUL - PERKECIL UKURAN */}
          <div className="mb-4">
            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl lg:text-6xl">
              {displayText}
              {showCursor && (
                <span className="inline-block w-[3px] h-[0.8em] bg-white/80 ml-1 align-middle animate-pulse" />
              )}
            </h1>
          </div>

          {/* SUBTITLE - PERKECIL SPACING */}
          {showSubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-2"
            >
<p className="text-base font-light tracking-wide md:text-xl lg:text-xl text-white/90">
  Visualisasi <span className="font-medium ">Logika & Algoritma</span>
</p>
              <p className="text-[8px] md:text-[10px] tracking-[0.3em] uppercase text-gray-300 font-light">
                Jelajahi · Pahami · Kuasai
              </p>
            </motion.div>
          )}

          {/* BUTTON - PERKECIL PADDING & MARGIN */}
          {showSubtitle && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-5 mt-8 font-poppins"
            >
              <Link 
                href="/dashboard" 
                className="px-8 py-2.5 text-sm font-medium text-black transition-all duration-300 bg-white rounded-full hover:scale-105 hover:bg-gray-100"
              >
                Mulai Belajar Gratis
              </Link>
              
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <span className="text-white/60 text-[9px] uppercase tracking-[0.3em] group-hover:text-white transition duration-300">
                  Lihat Modul
                </span>
                <svg className="w-2.5 h-2.5 transition-all text-white/60 group-hover:text-white group-hover:translate-x-1" fill="none" viewBox="0 0 10 10">
                  <path d="M1 5H9M9 5L5 1M9 5L5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </motion.div>
          )}
        </div>
      </div>

    </section>
  )
}