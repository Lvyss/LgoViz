'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion' 

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [hash, setHash] = useState('')
  const [isOpen, setIsOpen] = useState(false)

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

  // Fungsi scroll ke section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const navbarHeight = 56
      const elementPosition = section.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - navbarHeight
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  // Handle hash dari URL
  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const sectionId = window.location.hash.slice(1)
      setTimeout(() => {
        scrollToSection(sectionId)
      }, 300)
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

  // Menu items untuk mobile (pakai Link langsung)
  const mobileMenuItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Fitur', href: '/#fitur' },
    { label: 'Modul', href: '/#modul' },
    { label: 'Pelajari', href: '/dashboard' },
    { label: 'Tentang', href: '/#about' },
  ]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className={`fixed top-0 w-full z-[100] transition-colors duration-500 ${
        scrolled || isOpen
          ? 'bg-black/60 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:grid md:grid-cols-3">
          
          {/* LEFT: LOGO */}
          <div className="flex justify-start">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8">
                <img src="/images/logo.png" alt="Logo" className="object-contain w-full h-full" />
              </div>
            </Link>
          </div>

          {/* CENTER: NAV LINKS (Desktop Only) */}
          <div className="items-center justify-center hidden gap-14 md:flex">
            <Link href="/" className="text-xs tracking-tight text-white transition-all duration-300 font-poppins hover:text-white/60">
              Beranda
            </Link>
            <Link href="/#fitur" className="text-xs tracking-tight text-white transition-all duration-300 font-poppins hover:text-white/60">
              Fitur
            </Link>
            <Link href="/#modul" className="text-xs tracking-tight text-white transition-all duration-300 font-poppins hover:text-white/60">
              Modul
            </Link>
            <Link href="/dashboard" className="text-xs tracking-tight text-white transition-all duration-300 font-poppins hover:text-white/60">
              Pelajari
            </Link>
            <Link href="/#about" className="text-xs tracking-tight text-white transition-all duration-300 font-poppins hover:text-white/60">
              Tentang
            </Link>
          </div>

          {/* RIGHT: AUTH & MOBILE TOGGLE */}
          <div className="flex items-center justify-end gap-4 md:gap-8">
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center gap-6">
                  <span className="text-sm font-light text-white">{user.email?.split('@')[0]}</span>
                  <button onClick={handleLogout} className="text-sm font-light text-white transition-colors hover:text-white/60">Logout</button>
                </div>
              ) : (
                <Link href="/auth/register" className="px-6 py-2.5 text-sm font-medium font-poppins text-white border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300">Ayo Mulai</Link>
              )}
            </div>

            {/* Mobile Toggle Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white md:hidden focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN - PAKAI LINK LANGSUNG BUKAN BUTTON */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b bg-black/90 backdrop-blur-xl md:hidden border-white/10"
          >
            <div className="flex flex-col gap-4 px-6 py-8">
              {mobileMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-light transition-colors text-white/80 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-2 border-white/10" />
              {user ? (
                <div className="flex flex-col gap-4">
                  <span className="text-sm text-white/50">{user.email}</span>
                  <button onClick={handleLogout} className="text-left text-red-400">Logout</button>
                </div>
              ) : (
                <Link 
                  href="/auth/register" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 text-center text-white border border-white/20 rounded-xl"
                >
                  Ayo Mulai
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}