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

  useEffect(() => {
    const initChat = async () => {
      const { data: chatData } = await supabase
        .from('chats')
        .select(`id, booking_id, bookings ( anime_characters ( name, avatar_url, anime_name ) )`)
        .eq('id', chatId)
        .single()

      if (chatData) {
        const char = (chatData.bookings as any)?.anime_characters
        setChatSession({
          id: chatData.id,
          booking_id: chatData.booking_id,
          character: {
            name: char?.name || 'Mate',
            avatar_url: char?.avatar_url || '',
            anime_name: char?.anime_name || ''
          }
        })
      }
      
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        
      if (msgs) setMessages(msgs as Message[])
      setLoading(false)
    }
    if (chatId) initChat()
  }, [chatId, supabase])

  useEffect(() => {
    if (!chatId) return
    const channel = supabase
      .channel(`chat_messages_${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [chatId, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !chatId) return

    const userMessageContent = inputValue.trim()
    setInputValue('')

    await supabase.from('messages').insert({
      chat_id: chatId,
      sender_type: 'user',
      message: userMessageContent
    })

    setTimeout(async () => {
      const mockReplies = [
        `ขอบคุณที่ทักมานะคะ ดีใจจังเลยที่วันนี้ได้คุยกันเซนเซย์! 🥰`,
        `อื้อ! มีอะไรอยากเล่าให้ฟังไหมคะ? พร้อมรับฟังเสมอนะคะ ✨`,
        `ช่วงนี้เป็นอย่างไรบ้างคะ? เหนื่อยไหม? รักษาสุขภาพด้วยนะโอนี่จัง 💖`
      ]
      await supabase.from('messages').insert({
        chat_id: chatId,
        sender_type: 'character',
        message: mockReplies[Math.floor(Math.random() * mockReplies.length)]
      })
    }, 1500)
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-pink-500">Loading...</div>

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-slate-200">
      <header className="bg-black border-b border-pink-900/50 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.push('/characters')} className="text-pink-500 hover:text-pink-400">◀</button>
        <img src={chatSession?.character.avatar_url} className="w-10 h-10 rounded-full border border-pink-500/50" />
        <div>
          <h2 className="font-bold text-white">{chatSession?.character.name}</h2>
          <p className="text-xs text-pink-500">{chatSession?.character.anime_name}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl w-full mx-auto">
        {messages.map((msg) => {
          const isUser = msg.sender_type === 'user'
          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start items-end'}`}>
              {/* แสดง Avatar ของตัวละครเฉพาะฝั่ง AI */}
              {!isUser && (
                <img src={chatSession?.character.avatar_url} className="w-8 h-8 rounded-full border border-pink-500/30 flex-shrink-0" />
              )}
              
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                isUser 
                  ? 'bg-pink-600 text-white rounded-tr-none' 
                  : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}>
                {msg.message}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-black border-t border-pink-900/50 p-4">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-slate-900 text-white rounded-xl px-4 py-3 border border-slate-800 focus:border-pink-500 outline-none"
            placeholder={`พิมพ์คุยกับ ${chatSession?.character.name}...`}
          />
          <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 rounded-xl font-bold transition">ส่ง</button>
        </form>
      </footer>
    </div>
  )
}