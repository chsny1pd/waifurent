'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  const characterId = formData.get('characterId') as string
  const bookingType = formData.get('bookingType') as string
  const duration = parseInt(formData.get('duration') as string)
  const pricePerHour = parseFloat(formData.get('pricePerHour') as string)
  const scheduledAt = formData.get('scheduledAt') as string

  if (
    !characterId ||
    !bookingType ||
    !duration ||
    !pricePerHour ||
    !scheduledAt
  ) {
    return { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }
  }

  const totalPrice = pricePerHour * duration

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      character_id: characterId,
      booking_type: bookingType,
      duration,
      total_price: totalPrice,
      status: 'confirmed',
      scheduled_at: new Date(scheduledAt).toISOString()
    })
    .select()
    .single()

  if (bookingError || !booking) {
    return {
      error: `เกิดข้อผิดพลาดในการจอง: ${bookingError?.message}`
    }
  }

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
    return {
      error: `สร้างห้องแชทล้มเหลว: ${chatError.message}`
    }
  }

  redirect(`/chats/${chat.id}`)
}