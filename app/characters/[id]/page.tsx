import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: character, error } = await supabase
    .from('anime_characters')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !character) notFound()

  const getYouTubeID = (url: string | null) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const videoId = getYouTubeID(character.youtube_url)

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      {/* Background Glow (ใส่สีชมพูฟุ้งๆ ให้หลังเว็บไม่โล่ง) */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(219,39,119,0.05),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-6xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(219,39,119,0.3)] grid grid-cols-1 lg:grid-cols-2">
        
        {/* ฝั่งซ้าย: Media Section (จัดให้เต็ม) */}
        <div className="relative min-h-[400px] lg:min-h-[500px] bg-black">
          {videoId ? (
            <iframe
              className="w-full h-full absolute inset-0"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`}
              allow="autoplay; encrypted-media"
            />
          ) : (
            <img src={character.banner_url} alt={character.name} className="w-full h-full object-cover" />
          )}
          {/* Overlay gradient เพื่อความหรู */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
        </div>

        {/* ฝั่งขวา: Details (เพิ่มรายละเอียดให้ไม่โล่ง) */}
        <div className="p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="inline-block px-4 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold tracking-widest uppercase border border-pink-500/30 mb-6">
              {character.anime_name}
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 mb-4">
              {character.name}
            </h1>

            <div className="flex items-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-2xl ${i < Math.round(character.rating || 5) ? 'text-pink-500' : 'text-neutral-700'}`}>
                  ★
                </span>
              ))}
              <span className="text-neutral-500 text-sm ml-2 font-mono">({character.rating}.0)</span>
            </div>
            
            <p className="text-neutral-300 text-lg leading-relaxed mb-10 border-l-2 border-pink-600 pl-4">
              {character.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-5 rounded-2xl border border-pink-500/10">
                <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-tighter">ราคาเริ่มต้น</p>
                <p className="text-3xl font-black text-white mt-1">฿{character.price_per_hour}</p>
              </div>
              <div className="bg-black/40 p-5 rounded-2xl border border-pink-500/10 flex items-center">
                 <p className="text-neutral-400 text-sm font-medium">✨ พร้อมให้บริการ <br/> <span className="text-emerald-400 text-xs">Active Now</span></p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Link href="/characters" className="flex-1 text-center py-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 font-bold transition duration-300">
              ย้อนกลับ
            </Link>
            <Link href={`/bookings/new?characterId=${character.id}`} className="flex-[2] text-center py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-lg transition duration-300 shadow-[0_0_20px_-5px_rgba(219,39,119,0.5)]">
              จองเลย 🚀
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}