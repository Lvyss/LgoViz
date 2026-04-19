'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      console.log('Register success:', data.user?.email)
      // Langsung login setelah register
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
      <div className="w-full max-w-md p-8 border rounded-xl bg-white/5 border-white/10">
        <h1 className="mb-6 text-2xl font-bold text-center">Daftar Akun LgoViz</h1>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-400">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Daftar'}
          </button>
        </form>
        
        <p className="mt-6 text-sm text-center text-gray-400">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-emerald-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}