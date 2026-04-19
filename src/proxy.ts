import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            path: '/',
            maxAge: 0,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Auth pages - redirect ke halaman yang sesuai jika sudah login
  if (path.startsWith('/auth') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const target = profile?.role === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // Protected pages - redirect ke login kalo belum login
  if ((path.startsWith('/dashboard') || path.startsWith('/learn')) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Admin routes - cek role
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Fetch user role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/learn/:path*',
    '/auth/:path*',
  ],
}