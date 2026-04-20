'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

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
    <div className="relative flex min-h-screen overflow-hidden text-white bg-black font-poppins">
      
      {/* --- AMBIENT MOVEMENT (Background) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -left-[5%] w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px]"
        />
      </div>

      {/* --- LEFT SIDE: Visual Branding (Splitted Layout) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 border-r border-white/5 bg-[#050505] z-10">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-20 h-20 ">
            <img src="/images/logo.png" alt="" />
          </div>
        </div>

        {/* Content Visual */}
        <div className="relative">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-light tracking-tight leading-[1.1] mb-8"
          >
            Masuk dan bedah <br />
            <span className="italic text-white/40">logika program.</span>
          </motion.h2>
          
          <div className="w-1/2 h-[1px] bg-gradient-to-r from-orange-500/50 via-orange-500/10 to-transparent mb-8" />
          
          <p className="max-w-sm text-sm font-light text-gray-500">
            Platform visualisasi algoritma terdepan untuk siswa SMK RPL. Lanjutkan perjalanan belajarmu sekarang.
          </p>
        </div>

        {/* Bottom Bar */}
        <p className="text-[10px] tracking-widest text-gray-700 uppercase">© LGOVIZ — Visualizer for Excellence.</p>
      </div>

      {/* --- RIGHT SIDE: Login Form --- */}
      <div className="z-20 flex items-center justify-center w-full p-8 lg:w-1/2 md:p-16 bg-black/40 backdrop-blur-sm lg:bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo Only */}
          <div className="flex items-center justify-center gap-3 mb-12 lg:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.3)]">
              <span className="text-sm font-black text-white">L</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">Lgo<span className="text-orange-500">Viz</span></span>
          </div>

          {/* Form Header */}
          <div className="mb-12">
            <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white">Selamat Datang Kembali</h1>
            <p className="text-sm font-light text-gray-500">Masukkan kredensial Anda untuk mengakses dashboard.</p>
          </div>
          
          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-3 p-4 mb-8 text-xs font-light text-red-300 border rounded-xl bg-red-950/20 border-red-500/20"
            >
              <span className="text-lg">⚠️</span> {error}
            </motion.div>
          )}
          
          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6 font-light">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs tracking-wider text-gray-400 uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 text-white border rounded-xl bg-white/[0.03] border-white/5 transition-all focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(234,88,12,0.1)]"
                placeholder="smkrpl@lgoviz.com"
                required
              />
            </div>
            
            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs tracking-wider text-gray-400 uppercase">Password</label>
                <Link href="#" className="text-xs text-gray-600 transition-colors hover:text-orange-500/60">Lupa Password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 text-white border rounded-xl bg-white/[0.03] border-white/5 transition-all focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(234,88,12,0.1)]"
                placeholder="••••••••"
                required
              />
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm font-semibold text-white transition-all bg-orange-600 rounded-xl hover:bg-orange-500 disabled:opacity-50 active:scale-95 group"
            >
              <span className="relative flex items-center justify-center gap-2">
                {loading ? 'Mengotentikasi...' : 'Masuk ke Dashboard'} 
                {!loading && <span className="transition-transform group-hover:translate-x-1">→</span>}
              </span>
            </button>
          </form>
          
          {/* Register Link */}
          <p className="mt-12 text-sm font-light text-center text-gray-500">
            Belum punya akses?{' '}
            <Link href="/auth/register" className="font-semibold text-orange-400 transition-colors hover:text-orange-300 underline-offset-4 hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </motion.div>
      </div>

    </div>
  )
}