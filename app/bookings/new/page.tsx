// app/bookings/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { createBooking } from '@/features/bookings/actions'
import { useRouter, useSearchParams } from 'next/navigation'

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
  const [bookingType, setBookingType] = useState<string>('Chatting')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // เรียกใช้ createBrowserClient ของ @supabase/ssr โดยตรง
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ดึงข้อมูล Waifu ที่เลือกมาโชว์ในฟอร์มสรุปยอดเงิน
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
  }, [characterId, supabase])

  if (!characterId) {
    return <div className="p-8 text-center text-red-500">ไม่พบรหัสตัวละคร กรุณากลับไปเลือกใหม่</div>
  }

  if (!character) {
    return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล Waifu...</div>
  }

  const totalPrice = character.price_per_hour * duration

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createBooking(formData)

    if (result?.error) {
      setErrorMsg(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">ยืนยันการจอง Mate</h1>
          <p className="text-sm text-slate-500 mt-1">ตรวจสอบกิจกรรมและช่วงเวลาที่ต้องการทำร่วมกัน</p>
        </div>

        {/* Waifu Card Summary */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <img src={character.avatar_url} alt={character.name} className="w-16 h-16 rounded-xl object-cover" />
          <div>
            <h3 className="font-bold text-slate-900">{character.name}</h3>
            <p className="text-xs text-indigo-600 font-medium">{character.anime_name}</p>
            <p className="text-sm text-slate-500 mt-1">฿{character.price_per_hour} / ชั่วโมง</p>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="characterId" value={character.id} />
          <input type="hidden" name="pricePerHour" value={character.price_per_hour} />

          {/* Select Activity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">เลือกประเภทกิจกรรม</label>
            <select
              name="bookingType"
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none text-black"
            >
              <option value="Chatting">💬 Chatting (คุยแชทแก้เหงา)</option>
              <option value="Gaming">🎮 Gaming (เล่นเกมด้วยกัน)</option>
              <option value="Virtual Date">🌹 Virtual Date (ออกเดทเสมือนจริง)</option>
              <option value="Story Roleplay">🎭 Story Roleplay (โรลเพลย์ตามบทบาท)</option>
            </select>
          </div>

          {/* Select Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนเวลาที่ต้องการเช่า (ชั่วโมง)</label>
            <input
              name="duration"
              type="number"
              min="1"
              max="24"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none text-black"
            />
          </div>

          {/* Select Schedule Date/Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">เลือกวันและเวลาที่นัดหมาย</label>
            <input
              name="scheduledAt"
              type="datetime-local"
              required
              className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none text-black"
            />
          </div>

          <hr className="border-slate-100 my-4" />

          {/* Total Price Summary */}
          <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <span className="text-sm font-medium text-slate-700">ยอดรวมทั้งสิ้น:</span>
            <span className="text-xl font-black text-indigo-600">฿{totalPrice.toLocaleString()}</span>
          </div>

          {errorMsg && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">⚠️ {errorMsg}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'กำลังทำรายการ...' : 'ยืนยันและชำระเงิน 💳'}
          </button>
        </form>

      </div>
    </div>
  )
}