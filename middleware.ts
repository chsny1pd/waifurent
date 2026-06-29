// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
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
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // แก้ไขเรื่อง Type: บน request ให้เซ็ตเฉพาะ name และ value
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          
          response = NextResponse.next({
            request,
          })
          
          // บน response ให้ส่ง options เข้าไปด้วย โดยระบุ type ให้เข้ากันได้กับ Next.js
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // ดึงข้อมูลผู้ใช้ปัจจุบันเพื่อเช็ค Session
  const { data: { user } } = await supabase.auth.getUser()

  // กำหนดหน้าที่ต้อง Login ก่อนเข้า (Protected Routes)
  const isProtectedPath = 
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/bookings') ||
    request.nextUrl.pathname.startsWith('/chats') ||
    request.nextUrl.pathname.startsWith('/admin')

  // 1. ถ้าล็อกอินอยู่แล้ว แต่อยากเข้าหน้า /login -> ดีดไปหน้าแรก (Home)
  if (request.nextUrl.pathname.startsWith('/login') && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. ถ้ายังไม่ได้ล็อกอิน แต่จะเข้าหน้าส่วนตัว -> ดีดไปหน้า /login
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * ตรวจจับทุกเส้นทางยกเว้นไฟล์ static และพวกรูปภาพ
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}