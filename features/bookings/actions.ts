// features/bookings/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  // 1. ดึงข้อมูลผู้ใช้ปัจจุบันมาทำรายการ
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }

  const characterId = formData.get('characterId') as string
  const bookingType = formData.get('bookingType') as string
  const duration = parseInt(formData.get('duration') as string)
  const pricePerHour = parseFloat(formData.get('pricePerHour') as string)
  const scheduledAt = formData.get('scheduledAt') as string

  if (!characterId || !bookingType || !duration || !scheduledAt) {
    return { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }
  }

  // 2. คำนวณราคาสุทธิ
  const totalPrice = pricePerHour * duration

  // 3. บันทึกข้อมูลลงตาราง bookings
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      character_id: characterId,
      booking_type: bookingType,
      duration: duration,
      total_price: totalPrice,
      status: 'confirmed', // ในเฟสนี้ข้ามระบบจ่ายเงินไปก่อน ให้เป็น confirmed ทันทีเพื่อความรวดเร็ว
      scheduled_at: new Date(scheduledAt).toISOString()
    })
    .select()
    .single()

  if (bookingError || !booking) {
    return { error: `เกิดข้อผิดพลาดในการจอง: ${bookingError?.message}` }
  }

  // 4. (Magic Step) จองเสร็จปุ๊บ สร้างห้องแชทในตาราง chats มารองรับทันที!
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .insert({
      booking_id: booking.id,
      user_id: user.id,
      character_id: characterId
    })
    .select()
    .single()

  if (chatError) {
    return { error: `สร้างห้องแชทล้มเหลว แต่การจองสำเร็จแล้ว: ${chatError.message}` }
  }

  // 5. พาทั้งคู่เด้งไปที่ห้องแชทใหม่ทันทีเพื่อเริ่มสนทนา
  redirect(`/chats/${chat.id}`)
}