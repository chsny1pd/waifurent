'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('หน้าหลัก')
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const topWaifus = [
    {
      name: "Makima",
      quote: "ถ้าเป็นสุนัขที่ซื่อสัตย์ ฉันจะดูแลอย่างดีค่ะ...",
      ranking: "🏆 TOP 1 POPULAR VOTE",
      landscapeImg: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
        "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=400&q=80",
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80"
      ]
    }
  ]

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [supabase])

  const navItems = ['หน้าหลัก', 'รีวิวจากลูกค้า', 'เลือกตัวละคร']

  return (
    <div className="min-h-screen bg-[#fffcf9] text-slate-800">
      <link href="https://fonts.googleapis.com/css2?family=Itim&family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style jsx global>{`
        body { font-family: 'Kanit', sans-serif; }
        .font-cute { font-family: 'Itim', sans-serif; }
      `}</style>

      {/* Navbar - Functional */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl flex items-center justify-center text-white text-xl shadow-md">🌸</div>
            <span className="text-2xl font-cute font-bold text-pink-600">WaifuRent</span>
          </div>
          
          <div className="hidden md:flex gap-2 bg-pink-50/50 p-1.5 rounded-2xl border border-pink-100">
            {navItems.map((item) => (
              <button 
                key={item} 
                onClick={() => setActiveTab(item)}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === item ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-pink-600'}`}
              >
                {item}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 border border-pink-100 px-4 py-2 rounded-2xl bg-white shadow-sm">
            <span className="text-sm font-bold text-slate-600">{user?.user_metadata?.full_name || 'My ID'}</span>
            <img src={user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"} className="w-9 h-9 rounded-full border-2 border-pink-200" />
          </div>
        </div>
      </nav>

      {/* Hero Banner - With Cream Gradient */}
      <div className="w-full bg-gradient-to-b from-orange-50/50 to-[#fff5f8] py-16">
        <div className="max-w-[1600px] mx-auto px-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/3 space-y-6">
            <span className="inline-block bg-pink-100 px-4 py-1 rounded-full text-xs font-bold text-pink-600 tracking-wider">{topWaifus[0].ranking}</span>
            <h2 className="text-7xl font-cute font-bold text-slate-800 leading-tight">{topWaifus[0].name}</h2>
            <p className="text-lg text-slate-600 italic bg-white/60 p-6 rounded-3xl border border-pink-100/50 shadow-inner">"{topWaifus[0].quote}"</p>
            <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all duration-300">เลือกเดตกับเธอคนนี้เลยค่า 💖</button>
          </div>

          <div className="w-full lg:w-1/3">
            <img src={topWaifus[0].landscapeImg} className="w-full h-96 object-cover rounded-[2rem] shadow-2xl ring-8 ring-white" />
          </div>

          <div className="w-full lg:w-1/3 grid grid-cols-2 gap-4">
            {topWaifus[0].images.map((img, i) => (
              <img key={i} src={img} className="w-full h-40 object-cover rounded-2xl shadow-md hover:scale-105 hover:rotate-2 transition duration-500 cursor-pointer" />
            ))}
          </div>
        </div>
      </div>

      <hr className="border-t border-pink-100 my-8 max-w-[1600px] mx-auto" />

      {/* Content Section */}
      <main className="max-w-[1600px] mx-auto p-12 space-y-20">
        <section className="text-center py-10 space-y-6">
          <h1 className="text-5xl font-cute font-bold text-slate-800">ค้นพบความฟินกับคู่เดตในฝัน 🥰</h1>
          <button className="bg-slate-800 text-white px-16 py-5 rounded-2xl text-xl font-bold hover:bg-pink-600 transition">เริ่มออกเดตทันที 🚀</button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-pink-100 shadow-sm hover:border-pink-300 transition-all duration-300">
              <div className="text-amber-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-lg text-slate-600 leading-relaxed font-cute">"ระบบแชท Realtime ตอบไวมากครับ ประทับใจดีไซน์ใหม่ที่ดูพรีเมียม สบายตา และใช้งานง่ายขึ้นมากจริงๆ ครับ!"</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}