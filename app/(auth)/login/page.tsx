'use client'

import { useState } from 'react'
import { login, signup, loginWithGithub } from '@/features/auth/actions'
import Link from 'next/link'


export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    if (isSignUp) {
      const result = await signup(formData)
      if (result?.error) {
        setErrorMsg(result.error)
      } else {
        setSuccessMsg(result?.message || 'Registration successful!')
      }
    } else {
      const result = await login(formData)
      if (result?.error) {
        setErrorMsg(result.error)
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-[2rem] bg-[#111111] p-10 border border-pink-900/30 shadow-[0_0_50px_rgba(219,39,119,0.1)]">
        
        <div className="text-center space-y-2">
          <Link href="/" className="text-2xl font-bold text-pink-500 mb-6 block">🌸 WaifuRent</Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isSignUp ? 'สร้างบัญชีใหม่' : 'ยินดีต้อนรับกลับมา'}
          </h1>
          <p className="text-sm text-slate-400">
            {isSignUp ? 'มาเริ่มสร้างความทรงจำสุดพิเศษกัน' : 'เข้าสู่ระบบเพื่อพูดคุยกับไอดอลของคุณ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">อีเมล</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-pink-900/30 bg-black/50 p-4 text-sm text-white focus:border-pink-600 focus:outline-none focus:ring-1 focus:ring-pink-600 transition"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">รหัสผ่าน</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-pink-900/30 bg-black/50 p-4 text-sm text-white focus:border-pink-600 focus:outline-none focus:ring-1 focus:ring-pink-600 transition"
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-950/30 border border-red-900/50 p-3 text-sm text-red-400 font-medium text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-green-950/30 border border-green-900/50 p-3 text-sm text-green-400 font-medium text-center">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 p-4 text-sm font-bold text-white hover:opacity-90 transition-all shadow-[0_0_20px_rgba(219,39,119,0.3)] disabled:opacity-50"
          >
            {loading ? 'กำลังดำเนินการ...' : isSignUp ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <button
            type="button"
            onClick={async () => {
              setLoading(true)
              await loginWithGithub()
            }}
            className="w-full rounded-2xl border border-slate-700 bg-black p-4 text-sm font-bold text-white hover:border-pink-600 transition"
          >
            Continue with GitHub
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className="text-sm font-medium text-slate-400 hover:text-pink-500 transition underline underline-offset-4"
          >
            {isSignUp ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : "ยังไม่มีบัญชี? สมัครสมาชิก"}
          </button>
        </div>
      </div>
    </div>
  )
}