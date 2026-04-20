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
          <div key={idx} className={`stair-item h-[${height}vh] stair-${idx + 1}`}>
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
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/[0.01] rounded-full blur-[150px] z-[1]" />

      {/* HERO CONTENT - TETAP DI ATAS */}
      <div className="relative z-20 w-full px-4 pt-[10vh]">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* JUDUL DENGAN EFEK TYPING */}
          <div className="mb-6">
            <h1 className="text-7xl md:text-[100px] font-black tracking-tight leading-none">
              {displayText}
              {showCursor && (
                <span className="inline-block w-[4px] h-[0.8em] bg-white/80 ml-1 align-middle animate-pulse" />
              )}
            </h1>
          </div>

          {/* SUBTITLE - MUNCUL SETELAH JUDUL SELESAI */}
          {showSubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-3"
            >
              <p className="text-lg font-light tracking-wide md:text-2xl text-white/80">
                Visualisasi Logika & Algoritma
              </p>
              <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-gray-500 font-light">
                Jelajahi · Pahami · Kuasai
              </p>
            </motion.div>
          )}

          {/* BUTTON - MUNCUL SETELAH SUBTITLE */}
          {showSubtitle && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-6 mt-12"
            >
              <Link 
                href="/auth/register" 
                className="px-10 py-3 text-sm font-medium text-black transition-all duration-300 bg-white rounded-full hover:scale-105 hover:bg-gray-100"
              >
                Mulai Belajar Gratis
              </Link>
              
              <Link href="/modules" className="flex items-center gap-2 group">
                <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] group-hover:text-white/70 transition duration-300">
                  Lihat Modul
                </span>
                <svg className="w-3 h-3 transition-all text-white/40 group-hover:text-white/70 group-hover:translate-x-1" fill="none" viewBox="0 0 10 10">
                  <path d="M1 5H9M9 5L5 1M9 5L5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx>{`
        .stair-container {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 0px;
          align-items: flex-end;
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          width: 100%;
          height: 100vh;
          z-index: 5;
          pointer-events: none;
          background: linear-gradient(180deg, #000000 0%, #0a0a0a 85%, #121212 100%);
        }

        .stair-item {
          position: relative;
          background-color: #000;
          width: 100%;
          opacity: 0;
          transform: translateY(60px);
          animation: columnRise 1.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
        }

        .stair-1 { animation-delay: 0s; }
        .stair-2 { animation-delay: 0.05s; }
        .stair-3 { animation-delay: 0.1s; }
        .stair-4 { animation-delay: 0.15s; }
        .stair-5 { animation-delay: 0.25s; }
        .stair-6 { animation-delay: 0.15s; }
        .stair-7 { animation-delay: 0.1s; }
        .stair-8 { animation-delay: 0.05s; }
        .stair-9 { animation-delay: 0s; }

        @keyframes columnRise {
          0% {
            opacity: 0;
            transform: translateY(80px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .molten-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ff4500, #ffd700, transparent);
          background-size: 200% 100%;
          z-index: 10;
          opacity: 0;
        }

        @keyframes moltenFlash {
          0% { background-position: 200% 0; opacity: 0; }
          2% { opacity: 1; }
          15% { background-position: -200% 0; opacity: 1; }
          17%, 100% { opacity: 0; }
        }

        .stair-item::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          z-index: 8;
          background: #fff;
        }

        .stair-1::before, .stair-3::before, .stair-5::before, .stair-7::before, .stair-9::before {
          height: 1px;
          animation: whiteGlowThin 6s infinite ease-in-out;
        }

        .stair-2::before, .stair-4::before, .stair-6::before, .stair-8::before {
          height: 2px;
          animation: whiteGlowThick 6s infinite ease-in-out;
        }

        @keyframes whiteGlowThin {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; box-shadow: 0 0 4px rgba(255, 255, 255, 0.1); }
        }

        @keyframes whiteGlowThick {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; box-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
        }

        .side-line { 
          position: absolute; 
          top: 0; 
          right: 0; 
          z-index: 7; 
          transform-origin: top;
        }
        
        .side-thin { width: 1px; }
        .side-thick { width: 2px; }

        .side-static.side-thin { 
          background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 80%); 
        }
        .side-static.side-thick { 
          background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 90%); 
        }
        
        .side-fast-fade.side-thin {
          background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%);
          animation: sideBreath 7s infinite ease-in-out;
        }

        .side-fast-fade.side-thick {
          background: linear-gradient(180deg, 
            rgba(255,255,255,0.3) 0%, 
            rgba(255,255,255,0.1) 20%, 
            transparent 100%);
          animation: sideBreath 7s infinite ease-in-out;
        }

        @keyframes sideBreath { 
          0%, 100% { 
            opacity: 0; 
            transform: scaleY(0.8) translateY(-10px); 
          } 
          15%, 45% { 
            opacity: 1; 
            transform: scaleY(1) translateY(0); 
          } 
          60% { 
            opacity: 0; 
            transform: scaleY(1.1) translateY(5px);
          }
        }

        .stair-1 .molten-line { animation: moltenFlash 5s infinite linear; animation-delay: 0.5s; }
        .stair-2 .molten-line { animation: moltenFlash 7s infinite linear; animation-delay: 2s; }
        .stair-3 .molten-line { animation: moltenFlash 4s infinite linear; animation-delay: 3s; }
        .stair-4 .molten-line { animation: moltenFlash 8s infinite linear; animation-delay: 1s; }
        .stair-5 .molten-line { animation: moltenFlash 4.5s infinite linear; animation-delay: 0s; }
        .stair-6 .molten-line { animation: moltenFlash 6.5s infinite linear; animation-delay: 4s; }
        .stair-7 .molten-line { animation: moltenFlash 5.5s infinite linear; animation-delay: 1.5s; }
        .stair-8 .molten-line { animation: moltenFlash 7.5s infinite linear; animation-delay: 3.5s; }
        .stair-9 .molten-line { animation: moltenFlash 6s infinite linear; animation-delay: 2.5s; }

        .delay-1500 { animation-delay: 1.5s; }
        .delay-2000 { animation-delay: 2s; }
        .delay-2500 { animation-delay: 2.5s; }
        .delay-3000 { animation-delay: 3s; }
        .delay-3500 { animation-delay: 3.5s; }
        .delay-4000 { animation-delay: 4s; }
        .delay-5000 { animation-delay: 5s; }
        .delay-6000 { animation-delay: 6s; }
        .delay-7000 { animation-delay: 7s; }
        .delay-8000 { animation-delay: 8s; }
        .delay-9000 { animation-delay: 9s; }
      `}</style>
    </section>
  )
}