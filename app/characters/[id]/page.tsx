// app/characters/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CharacterDetailPage({ params }: Props) {
  // ใน Next.js เวอร์ชั่นใหม่ params ต้องใช้ await ก่อนนำมาใช้
  const { id } = await params
  const supabase = await createClient()

  // ดึงข้อมูลตัวละครรายบุคคลตาม ID ที่ส่งมาใน URL
  const { data: character, error } = await supabase
    .from('anime_characters')
    .select('*')
    .eq('id', id)
    .single() // ดึงมาแค่ Object เดียว ไม่เอาเป็น Array

  // ถ้าไม่เจอตัวละคร หรือมี Error ให้โยนไปหน้า 404 Not Found
  if (error || !character) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Banner */}
        <div className="h-64 sm:h-80 bg-slate-200 relative">
          <img
            src={character.banner_url || 'https://via.placeholder.com/1200x400'}
            alt={`${character.name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Back Button */}
          <Link 
            href="/characters" 
            className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-800 text-sm font-semibold rounded-xl shadow-sm transition"
          >
            ← ย้อนกลับ
          </Link>
        </div>

        {/* Profile Content */}
        <div className="p-8 sm:p-12 relative">
          {/* Avatar (ลอยเหนือนิดๆ) */}
          <div className="absolute -top-16 left-8 sm:left-12 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white overflow-hidden shadow-md bg-white">
            <img
              src={character.avatar_url || 'https://via.placeholder.com/150'}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info Header */}
          <div className="pt-12 sm:pt-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-slate-900">{character.name}</h1>
                <span className="flex items-center gap-1 bg-amber-50 text-amber-600 font-bold px-2 py-1 rounded-lg text-sm border border-amber-100">
                  ⭐ {Number(character.rating).toFixed(2)}
                </span>
              </div>
              <p className="text-indigo-600 font-medium mt-1">{character.anime_name}</p>
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between sm:justify-end gap-6">
              <div>
                <span className="text-xs text-slate-500 block">ราคาค่าบริการ</span>
                <span className="text-2xl font-black text-indigo-600">฿{character.price_per_hour}</span>
                <span className="text-sm text-slate-500"> / ชั่วโมง</span>
              </div>
            </div>
          </div>

          <hr className="my-8 border-slate-100" />

          {/* Details & Description */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">เกี่ยวกับฉัน</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {character.description}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">ลักษณะนิสัยและแท็ก</h2>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-semibold bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-xl">
                  บุคลิกหลัก: {character.personality}
                </span>
                {character.category?.map((tag: string) => (
                  <span key={tag} className="text-sm bg-slate-100 text-slate-600 font-medium px-3 py-1 rounded-xl">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <hr className="my-8 border-slate-100" />

          {/* Booking Action Action */}
          <div className="flex justify-end">
            <Link
              href={`/bookings/new?characterId=${character.id}`}
              className="w-full sm:w-auto inline-flex justify-center items-center py-4 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
            >
              ทำรายการจองเลย 🚀
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}