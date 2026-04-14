'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PixelButton from '@/components/ui/PixelButton'
import PixelCard from '@/components/ui/PixelCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <PixelCard className="w-full max-w-md" glow>
          <h1 className="font-pixel text-neon-green text-xl text-center mb-8">
            Login
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="font-mono text-text-secondary text-sm block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-pixel-dark border-2 border-neon-green/50 focus:border-neon-green outline-none px-4 py-3 font-mono text-text-primary"
                required
              />
            </div>

            <div>
              <label className="font-mono text-text-secondary text-sm block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-pixel-dark border-2 border-neon-green/50 focus:border-neon-green outline-none px-4 py-3 font-mono text-text-primary"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 font-mono text-sm text-center">
                {error}
              </p>
            )}

            <PixelButton type="submit" fullWidth disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </PixelButton>

            <p className="text-center font-mono text-text-muted text-sm">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-neon-green hover:text-neon-blue">
                Register
              </Link>
            </p>
          </form>
        </PixelCard>
      </main>
      <Footer />
    </>
  )
}