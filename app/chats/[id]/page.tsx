// app/chats/[id]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams, useRouter } from 'next/navigation'

interface Message {
  id: string
  chat_id: string
  sender_type: 'user' | 'character'
  message: string
  created_at: string
}

interface ChatSession {
  id: string
  booking_id: string
  character: {
    name: string
    avatar_url: string
    anime_name: string
  }
}

export default function ChatRoomPage() {
  const { id: chatId } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. ดึงรายละเอียดห้องแชท และข้อความเก่า
  useEffect(() => {
    const initChat = async () => {
      // ดึงข้อมูลห้องแชท
      const { data: chatData, error } = await supabase
        .from('chats')
        .select(`
          id,
          booking_id,
          bookings (
            anime_characters (
              name,
              avatar_url,
              anime_name
            )
          )
        `)
        .eq('id', chatId)
        .single()

      if (error || !chatData) {
        console.error('Error fetching chat:', error)
        setLoading(false)
        return
      }

      const bookingsData = chatData.bookings as any
      const characterData = bookingsData?.anime_characters

      setChatSession({
        id: chatData.id,
        booking_id: chatData.booking_id,
        character: {
          name: characterData?.name || 'Mate',
          avatar_url: characterData?.avatar_url || 'https://via.placeholder.com/150',
          anime_name: characterData?.anime_name || 'Unknown Anime'
        }
      })

      // ดึงข้อความเก่าที่มีอยู่
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (messagesData) {
        setMessages(messagesData as Message[])
      }
      setLoading(false)
    }

    if (chatId) initChat()
  }, [chatId, supabase])

  // 2. เปิดระบบ Realtime ดักฟังข้อความใหม่ๆ
  useEffect(() => {
    if (!chatId) return

    const channel = supabase
      .channel(`chat_messages_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, supabase])

  // 3. เลื่อนหน้าจอลงไปล่างสุดเมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 4. ฟังก์ชันส่งข้อความ
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !chatId) return

    const userMessageContent = inputValue.trim()
    setInputValue('')

    // 🛠️ เอา sender_id ออกเรียบร้อย ยิงตรงเข้า 3 คอลัมน์หลักตามตารางจริงของคุณ
    const { error: insertError } = await supabase.from('messages').insert({
      chat_id: chatId,
      sender_type: 'user',
      message: userMessageContent 
    })

    if (insertError) {
      console.error('ส่งข้อความล้มเหลว:', insertError)
      alert('Supabase Error: ' + insertError.message)
      return
    }

    // --- ระบบตอบกลับอัตโนมัติ (Mock AI Reply) ---
    setTimeout(async () => {
      const mockReplies = [
        `ขอบคุณที่ทักมานะคะ ดีใจจังเลยที่วันนี้ได้คุยกันเซนเซย์! 🥰`,
        `อื้อ! มีอะไรอยากเล่าให้ฟังไหมคะ? พร้อมรับฟังเสมอนะคะ ✨`,
        `ช่วงนี้เป็นอย่างไรบ้างคะ? เหนื่อยไหม? รักษาสุขภาพด้วยนะโอนี่จัง 💖`,
        `ฮั่นแน่ คิดอะไรอยู่หรือเปล่าเอ่ย? แซวเล่นนะคะ ฮาๆ 💬`,
        `รับทราบค่ะ! เดี๋ยวคุยเรื่องนี้กันต่อยาวๆ เลยนะค๊าาา 🌹`
      ]
      const randomReply = mockReplies[Math.floor(Math.random() * mockReplies.length)]

      await supabase.from('messages').insert({
        chat_id: chatId,
        sender_type: 'character',
        message: randomReply 
      })
    }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">กำลังเชื่อมต่อห้องแชทความปลอดภัยสูง...</p>
        </div>
      </div>
    )
  }

  if (!chatSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <div className="text-center max-w-sm bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-red-400 font-bold mb-2">⚠️ ไม่พบเซสชันห้องแชท</p>
          <p className="text-slate-400 text-sm mb-4">ห้องแชทนี้อาจหมดอายุ หรือคุณไม่มีสิทธิ์เข้าถึง</p>
          <button onClick={() => router.push('/')} className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-xl text-sm font-medium transition">
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      
      {/* Chat Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.push('/characters')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
          ◀
        </button>
        <img
          src={chatSession.character.avatar_url}
          alt={chatSession.character.name}
          className="w-10 h-10 rounded-full object-cover border border-indigo-500/50"
        />
        <div>
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            {chatSession.character.name}
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </h2>
          <p className="text-xs text-indigo-400 font-medium">{chatSession.character.anime_name}</p>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl w-full mx-auto content-start">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm space-y-1">
            <p>💬 ห้องแชทเริ่มทำงานแล้ว</p>
            <p className="text-xs text-slate-600">พิมพ์ข้อความเพื่อเริ่มคุยกับ {chatSession.character.name} ได้เลย!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender_type === 'user'
            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <img
                    src={chatSession.character.avatar_url}
                    alt={chatSession.character.name}
                    className="w-8 h-8 rounded-full object-cover mt-0.5"
                  />
                )}
                
                <div className="max-w-[75%] space-y-0.5">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <p className={`text-[10px] text-slate-500 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Chat Input Bar */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`พิมพ์ข้อความหา ${chatSession.character.name}...`}
            className="flex-1 bg-slate-950 text-slate-100 rounded-xl px-4 py-3 text-sm border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-600 transition"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 rounded-xl text-sm transition disabled:opacity-40"
          >
            ส่ง 🚀
          </button>
        </form>
      </footer>

    </div>
  )
}