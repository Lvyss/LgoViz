'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion' // 1. Import motion

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [hash, setHash] = useState('')

  useEffect(() => {
    setScrollY(window.scrollY)
    setHash(window.location.hash)

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      setScrollY(window.scrollY)
    }
    
    const handleHashChange = () => {
      setHash(window.location.hash)
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const navbarHeight = 64
      const elementPosition = section.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - navbarHeight
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const sectionId = window.location.hash.slice(1)
      setTimeout(() => {
        scrollToSection(sectionId)
      }, 100)
    }
  }, [pathname])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const menuItems = [
    { label: 'Beranda', action: () => pathname === '/' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : router.push('/'), href: '/' },
    { label: 'Fitur', action: () => pathname === '/' ? scrollToSection('fitur') : router.push('/#fitur'), href: '/#fitur' },
    { label: 'Modul', action: () => pathname === '/' ? scrollToSection('modul') : router.push('/#modul'), href: '/#modul' },
    { label: 'Pelajari', action: () => router.push('/dashboard'), href: '/dashboard' },
    { label: 'Tentang', action: () => pathname === '/' ? scrollToSection('about') : router.push('/#about'), href: '/#about' },
  ]

  return (
    // 2. Ganti nav jadi motion.nav
    <motion.nav
      // 3. Konfigurasi Animasi Slide Down
      initial={{ y: -100, opacity: 0 }} // Start: di luar layar atas & transparan
      animate={{ y: 0, opacity: 1 }}    // End: posisi normal & muncul
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1], // Smooth cubic-bezier flow
        delay: 0.1 
      }}
      className={`fixed top-0 w-full z-[100] transition-colors duration-500 ${
        scrolled
          ? 'bg-black/60 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center grid-cols-3 h-14">
          
          {/* LEFT: LOGO */}
          <div className="flex justify-start">
            <button
              onClick={() => pathname === '/' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : router.push('/')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8">
                <img src="/images/logo.png" alt="Logo" className="object-contain w-full h-full" />
              </div>
            </button>
          </div>

          {/* CENTER: NAV LINKS */}
          <div className="flex items-center justify-center gap-14">
            {menuItems.map((item) => {
              let isActive = pathname === item.href || (pathname === '/' && item.href.includes('#') && hash === item.href.slice(1))
              
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`
                    text-xs font-poppins tracking-tight transition-all duration-300
                    ${isActive 
                      ? 'text-white border-b border-white/40 pb-1' 
                      : 'text-white hover:text-white/60'
                    }
                  `}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* RIGHT: AUTH & CTA */}
          <div className="flex items-center justify-end gap-8">
            {user ? (
              <div className="flex items-center gap-6">
                <span className="hidden text-sm font-light text-white lg:block">
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-light text-white transition-colors hover:text-white/60"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  href="/auth/register"
                  className="px-6 py-2.5 text-sm font-medium font-poppins text-white border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  Ayo Mulai
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.nav>
  )
}
