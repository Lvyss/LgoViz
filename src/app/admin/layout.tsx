'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
  { href: '/admin/topics', label: 'Topik', icon: '📚' },     // ← Tambah ini
  { href: '/admin/questions', label: 'Soal Quiz', icon: '📝' },
  { href: '/admin/materials', label: 'Materi', icon: '✏️' },
  { href: '/admin/students', label: 'Siswa', icon: '👥' },
]

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0a0a0f] fixed h-full overflow-y-auto">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2 mb-8">
            <span className="text-xl font-bold text-emerald-400">LgoViz</span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">Admin</span>
          </Link>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                    ${isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
              <span className="text-sm text-emerald-400">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{userEmail || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/auth/login')
              }}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}