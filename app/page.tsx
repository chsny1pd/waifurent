'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<any>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error(error.message)
        return
      }

      setUser(null)
      setIsMenuOpen(false)

      router.replace('/login')
      router.refresh()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

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
    },
    {
      name: "Power",
      quote: "ข้าคือปีศาจเลือดผู้เก่งกาจ!",
      ranking: "🥈 TOP 2",
      landscapeImg: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80",
        "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=400&q=80"
      ]
    },
    {
      name: "Aki",
      quote: "ชีวิตของฉันขึ้นอยู่กับเป้าหมายนี้",
      ranking: "🥉 TOP 3",
      landscapeImg: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=400&q=80",
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80",
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80"
      ]
    }
  ]

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % topWaifus.length)

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + topWaifus.length) % topWaifus.length)

  const scrollToReviews = (e: any) => {
    e.preventDefault()
    document.getElementById('reviews-section')?.scrollIntoView({
      behavior: 'smooth'
    })
  }

  const scrollToTop = (e: any) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
    }

    getSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
      <link
        href="https://fonts.googleapis.com/css2?family=Itim&family=Kanit:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style jsx global>{`
        body {
          font-family: 'Kanit', sans-serif;
        }
        .font-cute {
          font-family: 'Itim', sans-serif;
        }
      `}</style>

      {/* Navbar */}
      <nav className="bg-black/80 backdrop-blur-lg border-b border-pink-900/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" onClick={scrollToTop} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-600 to-black rounded-xl flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(219,39,119,0.5)]">
              🌸
            </div>
            <span className="text-2xl font-cute font-bold text-pink-500">
              WaifuRent
            </span>
          </Link>

          <div className="hidden md:flex gap-2 bg-pink-950/20 p-1.5 rounded-2xl border border-pink-900/30">
            <Link
              href="/"
              onClick={scrollToTop}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-pink-600 transition-all"
            >
              หน้าหลัก
            </Link>

            <a
              href="#reviews-section"
              onClick={scrollToReviews}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-pink-600 transition-all cursor-pointer"
            >
              รีวิวจากลูกค้า
            </a>

            <Link
              href="/characters"
              className="px-6 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-pink-600 transition-all"
            >
              เลือกตัวละคร
            </Link>
          </div>

          {/* Profile */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 border border-pink-900/50 px-4 py-2 rounded-2xl bg-black shadow-sm hover:border-pink-600 transition"
                >
                  <span className="text-sm font-bold text-slate-300">
                    {user?.user_metadata?.full_name ||
                      user?.user_metadata?.user_name ||
                      'My ID'}
                  </span>

                  <img
                    src={
                      user?.user_metadata?.avatar_url ||
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"
                    }
                    className="w-9 h-9 rounded-full border-2 border-pink-600"
                  />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-[#2d1b4e] border border-pink-900/50 rounded-2xl p-4 shadow-2xl z-50">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-pink-900/50">
                      <img
                        src={
                          user?.user_metadata?.avatar_url ||
                          "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"
                        }
                        className="w-12 h-12 rounded-full border-2 border-pink-500"
                      />

                      <div>
                        <p className="font-bold text-white">
                          {user?.user_metadata?.full_name ||
                            user?.user_metadata?.user_name ||
                            'User'}
                        </p>
                        <p className="text-xs text-pink-300">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm font-medium text-white">
                      <Link href="/chats" className="block hover:text-pink-400 transition">
                        แชทของไอดอลที่ซื้ออยู่
                      </Link>

                      <Link href="/orders" className="block hover:text-pink-400 transition">
                        ประวัติการสั่งซื้อ
                      </Link>

                      <div className="border-t border-pink-900/50 pt-4 mt-4">
                        <button
                          onClick={handleLogout}
                          className="text-red-400 hover:text-red-300 transition w-full text-left"
                        >
                          ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-2xl bg-pink-600 hover:bg-pink-700 transition"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="w-full bg-gradient-to-b from-pink-950/20 to-[#0a0a0a] py-16 relative group">
        <button onClick={prevSlide} className="absolute left-4 top-1/2 bg-black/50 p-4 rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition">
          ◀
        </button>

        <button onClick={nextSlide} className="absolute right-4 top-1/2 bg-black/50 p-4 rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition">
          ▶
        </button>

        <div className="max-w-[1600px] mx-auto px-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/3 space-y-6">
            <span className="inline-block bg-pink-600/20 px-4 py-1 rounded-full text-xs font-bold text-pink-400 tracking-wider">
              {topWaifus[currentIndex].ranking}
            </span>

            <h2 className="text-7xl font-cute font-bold text-white leading-tight">
              {topWaifus[currentIndex].name}
            </h2>

            <p className="text-lg text-slate-400 italic bg-black/40 p-6 rounded-3xl border border-pink-900/30 shadow-inner">
              "{topWaifus[currentIndex].quote}"
            </p>

            <Link
              href="/characters"
              className="inline-block bg-pink-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-pink-700 transition-all duration-300"
            >
              เลือกเดตกับเธอคนนี้เลยค่า 💖
            </Link>
          </div>

          <div className="w-full lg:w-1/3">
            <img
              src={topWaifus[currentIndex].landscapeImg}
              className="w-full h-96 object-cover rounded-[2rem] shadow-2xl ring-4 ring-pink-900/20"
            />
          </div>

          <div className="w-full lg:w-1/3 grid grid-cols-2 gap-4">
            {topWaifus[currentIndex].images.map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-full h-40 object-cover rounded-2xl shadow-md border border-pink-900/20"
              />
            ))}
          </div>
        </div>
      </div>

      <hr className="border-t border-pink-900/30 my-8 max-w-[1600px] mx-auto" />

      <main id="reviews-section" className="max-w-[1600px] mx-auto p-12 space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-10">
          <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-pink-900/30 bg-black">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/q15CRdE5Bv0"
              title="Makima"
              frameBorder="0"
              allowFullScreen
            />
          </div>

          <div className="space-y-8 text-left">
            <h1 className="text-5xl font-cute font-bold text-white leading-tight">
              ค้นพบความฟินกับคู่เดตในฝัน 🥰
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed">
              เปิดประสบการณ์การพูดคุยและออกเดตแบบส่วนตัวกับตัวละครที่คุณหลงรัก
            </p>

            <Link
              href="/characters"
              className="inline-flex items-center justify-center bg-white text-black px-12 py-5 rounded-2xl text-xl font-bold hover:bg-pink-500 hover:text-white transition-all duration-300"
            >
              ไปเลือกตัวละครกันเลย 🚀
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-8 bg-black border border-pink-900/30 rounded-3xl shadow-sm hover:border-pink-600 transition-all"
            >
              <div className="text-pink-500 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-lg text-slate-400 font-cute">
                "ระบบแชท Realtime ตอบไวมาก ประทับใจมากครับ!"
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}