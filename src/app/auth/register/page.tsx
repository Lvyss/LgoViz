'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PixelButton from '@/components/ui/PixelButton'
import PixelCard from '@/components/ui/PixelCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
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
            Register
          </h1>
          
          <form onSubmit={handleRegister} className="space-y-6">
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
              <p className="text-text-muted font-mono text-[10px] mt-1">
                Minimal 6 karakter
              </p>
            </div>

            <div>
              <label className="font-mono text-text-secondary text-sm block mb-2">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Loading...' : 'Daftar'}
            </PixelButton>

            <p className="text-center font-mono text-text-muted text-sm">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-neon-green hover:text-neon-blue">
                Login
              </Link>
            </p>
          </form>
        </PixelCard>
      </main>
      <Footer />
    </>
  )
}