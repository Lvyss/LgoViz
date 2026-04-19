'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const user = data.user ?? data.session?.user

      if (!user) {
        setError('Login gagal. Silakan coba lagi.')
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const redirectTo = profile?.role === 'admin' ? '/admin' : '/dashboard'
      router.push(redirectTo)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
      <div className="w-full max-w-md p-8 border rounded-xl bg-white/5 border-white/10">
        <h1 className="mb-6 text-2xl font-bold text-center">Login ke LgoViz</h1>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        
        <p className="mt-6 text-sm text-center text-gray-400">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="text-emerald-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}