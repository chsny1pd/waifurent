'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { createBooking } from '@/features/bookings/actions'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Character {
  id: string
  name: string
  anime_name: string
  price_per_hour: number
  avatar_url: string
}

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const characterId = searchParams.get('characterId')

  const [character, setCharacter] = useState<Character | null>(null)
  const [duration, setDuration] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (!characterId) return

    const fetchCharacter = async () => {
      const { data } = await supabase
        .from('anime_characters')
        .select('id, name, anime_name, price_per_hour, avatar_url')
        .eq('id', characterId)
        .single()

      if (data) setCharacter(data)
    }

    fetchCharacter()
  }, [characterId])

  if (!characterId) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        ไม่พบรหัสตัวละคร
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        กำลังโหลด...
      </div>
    )
  }

  const totalPrice = character.price_per_hour * duration

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const result = await createBooking(formData)

    if (result?.error) {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">

        {/* ฝั่งซ้าย */}
        <div className="relative min-h-[300px] md:min-h-full bg-neutral-800">
          <img
            src={character.avatar_url}
            alt={character.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-8 left-8">
            <h1 className="text-4xl md:text-5xl font-black">
              {character.name}
            </h1>
            <p className="text-pink-500 font-bold uppercase tracking-widest">
              {character.anime_name}
            </p>
          </div>
        </div>

        {/* ฝั่งขวา */}
        <div className="p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">ยืนยันการจอง</h2>

              <Link
                href={`/characters/${character.id}`}
                className="text-sm text-neutral-500 hover:text-white transition"
              >
                ← ย้อนกลับ
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* hidden fields */}
              <input
                type="hidden"
                name="characterId"
                value={character.id}
              />

              <input
                type="hidden"
                name="pricePerHour"
                value={character.price_per_hour}
              />

              {/* booking type */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-2">
                  ประเภทกิจกรรม
                </label>

                <select
                  name="bookingType"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-pink-500 focus:outline-none"
                >
                  <option value="Chatting">
                    💬 Chatting (คุยแชทแก้เหงา)
                  </option>
                  <option value="Gaming">
                    🎮 Gaming (เล่นเกมด้วยกัน)
                  </option>
                  <option value="Story Roleplay">
                    🎭 Story Roleplay
                  </option>
                  <option value="Virtual Date">
                    🌹 Virtual Date
                  </option>
                </select>
              </div>

              {/* duration */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-2">
                  จำนวนเวลา (ชั่วโมง)
                </label>

                <input
                  name="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) =>
                    setDuration(parseInt(e.target.value) || 1)
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* scheduled date */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-2">
                  นัดหมายวันที่
                </label>

                <input
                  name="scheduledAt"
                  type="datetime-local"
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm focus:border-pink-500 focus:outline-none [color-scheme:dark]"
                />
              </div>

              {/* summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase font-bold">
                    ราคารวม
                  </div>

                  <div className="text-2xl font-black text-pink-500">
                    ฿{totalPrice.toLocaleString()}
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex items-center justify-center">
                  <span className="text-emerald-400 text-xs font-bold uppercase">
                    ● พร้อมให้บริการ
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-pink-600 hover:bg-pink-700 font-bold transition shadow-lg shadow-pink-900/20"
              >
                {loading ? 'กำลังทำรายการ...' : 'ยืนยันและชำระเงิน 💳'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}