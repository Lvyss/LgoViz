'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth/login')
      } else {
        setUserEmail(data.user.email ?? null)
      }
    })
  }, [router])

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/topics', label: 'Topik', icon: '📚' },
    { href: '/admin/questions', label: 'Soal Quiz', icon: '📝' },
    { href: '/admin/materials', label: 'Materi', icon: '✏️' },
    { href: '/admin/students', label: 'Siswa', icon: '👥' },
  ]

  return (
    <div className="flex min-h-screen bg-[#020202] text-white font-poppins selection:bg-orange-500/30">
      
      {/* SIDEBAR: DARK MOLTEN GLASS */}
      <aside className="fixed h-full w-72 border-r border-white/5 bg-[#050505] z-50">
        
        {/* LOGO: CONSISTENT WITH HERO */}
        <div className="p-8 mb-4">
          <Link href="/admin" className="group">
            <h1 className="text-2xl italic font-black tracking-tighter uppercase">
              LGO<span className="text-orange-500 transition-colors duration-500 group-hover:text-yellow-500">VIZ</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-[1px] w-8 bg-orange-600" />
              <span className="text-[8px] font-mono tracking-[0.4em] text-gray-500 uppercase">System_Admin</span>
            </div>
          </Link>
        </div>

        {/* NAVIGATION: EMBERS HIGHLIGHT */}
        <nav className="px-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500 group
                  ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
                `}
              >
                {/* Molten Background Active */}
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute inset-0 border bg-gradient-to-r from-orange-600/10 via-yellow-600/5 to-transparent border-white/5 rounded-2xl"
                  />
                )}
                
                {/* Icon with Heat Effect */}
                <span className={`relative z-10 text-xl transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0'}`}>
                  {item.icon}
                </span>

                <span className={`relative z-10 text-[10px] font-bold tracking-[0.1em] uppercase ${isActive ? 'text-orange-400' : ''}`}>
                  {item.label}
                </span>

                {/* Animated Indicator line */}
                {isActive && (
                  <motion.div 
                    layoutId="activeLine"
                    className="absolute left-0 w-1 h-6 bg-gradient-to-b from-red-600 via-orange-500 to-yellow-400 rounded-r-full shadow-[2px_0_12px_rgba(234,88,12,0.8)]" 
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* ADMIN FOOTER: GLASS CARD */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="relative overflow-hidden p-4 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl group">
            {/* Ambient Ember Glow inside card */}
            <div className="absolute w-16 h-16 transition-all -right-4 -bottom-4 bg-orange-600/10 blur-2xl group-hover:bg-orange-600/20" />
            
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-yellow-500 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#080808] text-xs font-black">
                  {userEmail?.[0].toUpperCase() || 'A'}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-white/90 truncate uppercase tracking-tighter">
                  {userEmail || 'Administrator'}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
                  <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">Neural_Link_Active</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  router.push('/auth/login')
                }}
                className="p-2 text-gray-600 transition-colors hover:text-orange-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="relative flex-1 ml-72">
        {/* Background Grid & Glow - Consistent with Landing Page */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-orange-600/5 rounded-full blur-[120px] opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        <div className="relative z-10 p-12">
          {children}
        </div>
      </main>
    </div>
  )
}