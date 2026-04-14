'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PixelButton from '../ui/PixelButton'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

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

  return (
    <nav className="border-b-2 border-neon-green bg-pixel-darker/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <Link href="/" className="group">
          <h1 className="font-pixel text-sm md:text-base text-neon-green hover:text-neon-blue transition-colors">
            Lgo<span className="text-neon-blue">Viz</span>
          </h1>
        </Link>

        <div className="flex gap-2 md:gap-4 items-center">
          {user ? (
            <>
              <Link href="/dashboard">
                <PixelButton variant="secondary" className="text-[8px] md:text-[10px] py-2 md:py-3 px-3 md:px-4">
                  Dashboard
                </PixelButton>
              </Link>
              <PixelButton onClick={handleLogout} className="text-[8px] md:text-[10px] py-2 md:py-3 px-3 md:px-4">
                Logout
              </PixelButton>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <PixelButton variant="secondary" className="text-[8px] md:text-[10px] py-2 md:py-3 px-3 md:px-4">
                  Login
                </PixelButton>
              </Link>
              <Link href="/auth/register">
                <PixelButton className="text-[8px] md:text-[10px] py-2 md:py-3 px-3 md:px-4">
                  Register
                </PixelButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}