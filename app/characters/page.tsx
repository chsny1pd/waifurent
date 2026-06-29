// app/characters/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CharactersPage() {
  const supabase = await createClient()

  // ดึงข้อมูลตัวละครทั้งหมดจาก Supabase
  const { data: characters, error } = await supabase
    .from('anime_characters')
    .select('*')
    .eq('is_available', true)
    .order('rating', { ascending: false })

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading characters: {error.message}</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Explore Your Anime Mates
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            เลือกตัวละครที่คุณชื่นชอบเพื่อไปแชท เล่นเกม หรือทำกิจกรรมเสมือนจริงร่วมกันได้เลย!
          </p>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {characters?.map((waifu) => (
            <div key={waifu.id} className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
              <div>
                {/* Avatar/Cover Image */}
                <div className="w-full h-64 bg-slate-200 aspect-w-1 aspect-h-1 group-hover:opacity-75 overflow-hidden">
                  <img
                    src={waifu.avatar_url || 'https://via.placeholder.com/400'}
                    alt={waifu.name}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                
                {/* Badges & Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{waifu.name}</h2>
                      <p className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        {waifu.anime_name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-lg">
                      <span>⭐</span>
                      <span>{Number(waifu.rating).toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-3">
                    {waifu.description}
                  </p>

                  {/* Personality Badge */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs bg-rose-50 text-rose-600 font-medium px-2.5 py-1 rounded-md border border-rose-100">
                      Type: {waifu.personality}
                    </span>
                    {waifu.category?.map((cat: string) => (
                      <span key={cat} className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-md">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">ราคาเริ่มต้น</span>
                  <span className="text-lg font-bold text-indigo-600">฿{waifu.price_per_hour}</span>
                  <span className="text-xs text-slate-500"> / ชม.</span>
                </div>
                
                <Link 
                  href={`/characters/${waifu.id}`}
                  className="inline-flex justify-center items-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition"
                >
                  ดูรายละเอียด
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}