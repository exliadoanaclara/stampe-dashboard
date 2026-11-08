import { useEffect, useRef, useState, useCallback } from "react"
import type { ChatMsg, UserState } from "../domain/tipos"
import * as storage from "../data/storage"

export function useChat(user: UserState) {
  const [chat, setChat] = useState<ChatMsg[]>(() => storage.carregarChat())
  const [showChat, setShowChat] = useState(false)
  const [chatTexto, setChatTexto] = useState("")
  const [chatNaoLidas, setChatNaoLidas] = useState(0)
  const chatCanalRef = useRef<BroadcastChannel | null>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)

  // Persistência do chat
  useEffect(() => {
    const r = storage.salvarChat(chat)
    if (!r.ok) console.error("Falha ao salvar chat:", r.erro)
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
  }, [chat])

  // BroadcastChannel + storage event para sync entre abas
  useEffect(() => {
    function receber(msg: ChatMsg) {
      setChat(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg].slice(-300))
      if (!showChat) setChatNaoLidas(n => n + 1)
    }
    if (typeof BroadcastChannel !== "undefined") {
      const canal = new BroadcastChannel(storage.CHAT_CANAL)
      canal.onmessage = e => receber(e.data as ChatMsg)
      chatCanalRef.current = canal
      return () => { canal.close(); chatCanalRef.current = null }
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storage.LS_CHAT || !e.newValue) return
      try {
        const lista = JSON.parse(e.newValue) as ChatMsg[]
        const ultimo = lista[lista.length - 1]
        if (ultimo) receber(ultimo)
      } catch { /* ignore */ }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [showChat])

  const enviarChat = useCallback(() => {
    const texto = chatTexto.trim()
    if (!texto) return
    const msg: ChatMsg = { id: Math.random().toString(36).slice(2, 9) + Date.now().toString(36), user: user.nome || "ANONIMO", texto, data: new Date().toISOString() }
    setChat(prev => [...prev, msg].slice(-300))
    setChatTexto("")
    try { chatCanalRef.current?.postMessage(msg) } catch { /* canal fechado */ }
  }, [chatTexto, user.nome])

  const toggleChat = useCallback(() => {
    setShowChat(prev => {
      const next = !prev
      if (next) setChatNaoLidas(0)
      return next
    })
  }, [])

  return { chat, setChat, showChat, setShowChat, chatTexto, setChatTexto, chatNaoLidas, chatBoxRef, enviarChat, toggleChat }
}