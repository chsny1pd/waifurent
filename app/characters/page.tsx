'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function CharactersPage() {
  const [characters, setCharacters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchCharacters = async () => {
      const { data, error } = await supabase
        .from('anime_characters')
        .select('*')
        .eq('is_available', true)
        .order('rating', { ascending: false })

      if (data) setCharacters(data)
      setLoading(false)
    }
    fetchCharacters()
  }, [supabase])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
      <link href="https://fonts.googleapis.com/css2?family=Itim&family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style jsx global>{`body { font-family: 'Kanit', sans-serif; } .font-cute { font-family: 'Itim', sans-serif; }`}</style>

      {/* Navbar */}
      <nav className="bg-black/80 backdrop-blur-lg border-b border-pink-900/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-600 to-black rounded-xl flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(219,39,119,0.5)]">🌸</div>
            <span className="text-2xl font-cute font-bold text-pink-500">WaifuRent</span>
          </Link>
          <div className="hidden md:flex gap-2 bg-pink-950/20 p-1.5 rounded-2xl border border-pink-900/30">
            <Link href="/" className="px-6 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-pink-600 transition-all">หน้าหลัก</Link>
            <Link href="/characters" className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-pink-600 shadow-lg shadow-pink-600/20">เลือกตัวละคร</Link>
          </div>
          <div className="flex items-center gap-3 border border-pink-900/50 px-4 py-2 rounded-2xl bg-black">
            <span className="text-sm font-bold text-slate-300">My ID</span>
            <div className="w-9 h-9 rounded-full bg-pink-600 border-2 border-pink-600" />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-cute font-bold text-white tracking-tight sm:text-6xl">
            Explore Your Anime Mates 🌸
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            เลือกตัวละครที่คุณชื่นชอบเพื่อไปแชทและสร้างความทรงจำสุดพิเศษ
          </p>
        </div>

        {loading ? (
            <div className="text-center text-slate-500 py-20">กำลังโหลดตัวละคร...</div>
        ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((waifu) => (
                <div key={waifu.id} className="group bg-black border border-pink-900/30 rounded-3xl overflow-hidden hover:border-pink-500 transition-all duration-300 hover:-translate-y-2">
                <div className="w-full h-64 overflow-hidden">
                    <img
                    src={waifu.avatar_url || 'https://via.placeholder.com/400'}
                    alt={waifu.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-cute font-bold text-white">{waifu.name}</h2>
                        <p className="text-xs text-pink-400 font-semibold bg-pink-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                        {waifu.anime_name}
                        </p>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-400 font-bold text-sm bg-amber-500/10 px-2 py-1 rounded-lg">
                        <span>⭐</span>
                        <span>{Number(waifu.rating || 0).toFixed(2)}</span>
                    </div>
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-3">
                    {waifu.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-pink-900/30 text-pink-300 font-medium px-2.5 py-1 rounded-md border border-pink-900/50">
                        Type: {waifu.personality}
                    </span>
                    {waifu.category?.map((cat: string) => (
                        <span key={cat} className="text-xs bg-slate-900 text-slate-400 font-medium px-2.5 py-1 rounded-md border border-slate-800">
                        {cat}
                        </span>
                    ))}
                    </div>
                </div>

                <div className="p-6 border-t border-pink-900/30 bg-pink-950/10 flex items-center justify-between">
                    <div>
                    <span className="text-xs text-slate-500 block">ราคาเริ่มต้น</span>
                    <span className="text-lg font-bold text-white">฿{waifu.price_per_hour}</span>
                    <span className="text-xs text-slate-400"> / ชม.</span>
                    </div>
                    
                    <Link 
                    href={`/characters/${waifu.id}`}
                    className="inline-flex justify-center items-center py-2.5 px-6 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold shadow-lg shadow-pink-600/20 transition"
                    >
                    ดูรายละเอียด
                    </Link>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  )
}