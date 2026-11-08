import type { ChatMsg, UserState } from "../domain/tipos"
import { fmtDataHora } from "../domain/datas"

interface ChatProps {
  chat: ChatMsg[]
  showChat: boolean
  setShowChat: (v: boolean) => void
  chatTexto: string
  setChatTexto: (v: string) => void
  chatNaoLidas: number
  chatBoxRef: React.RefObject<HTMLDivElement | null>
  enviarChat: () => void
  user: UserState
}

export function Chat({ chat, showChat, setShowChat, chatTexto, setChatTexto, chatNaoLidas, chatBoxRef, enviarChat, user }: ChatProps) {
  return (
    <>
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-4 right-4 z-40 no-print w-14 h-14 grid place-items-center rounded-full shadow-xl flex-shrink-0"
        style={{ background: chatNaoLidas > 0 ? "#c1121f" : "#c1121f" }}
        aria-label="Chat"
      >
        <span className="text-2xl">💬</span>
        {chatNaoLidas > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full grid place-items-center">{chatNaoLidas > 99 ? "99+" : chatNaoLidas}</span>
        )}
      </button>

      {showChat && (
        <div className="fixed bottom-4 right-4 z-40 no-print w-full md:w-[380px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col" role="dialog" aria-label="Chat da STAMPE">
          <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 grid place-items-center rounded-full text-xl" style={{ background: "#c1121f" }}>💬</span>
              <div>
                <div className="font-black text-sm">CHAT STAMPE</div>
                <div className="text-xs text-zinc-400">Mensagens entre setores</div>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} className="w-8 h-8 grid place-items-center rounded-full bg-white/10 hover:bg-white/20">✕</button>
          </div>

          <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
            {chat.length === 0 ? (
              <div className="text-center text-zinc-500 py-8 text-sm">Nenhuma mensagem ainda</div>
            ) : (
              chat.map(m => (
                <div key={m.id} className={`flex gap-2 ${m.user === user.nome ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-1 ${m.user === user.nome ? "text-right" : ""}`}>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs text-zinc-500 font-medium">{fmtDataHora(m.data)}</span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{
                        background: m.user === user.nome ? "#c1121f" : "#0284c7",
                        color: "#fff"
                      }}>{m.user === user.nome ? "VOCÊ" : m.user}</span>
                    </div>
                    <div className="mt-1 inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-tight"
                      style={{
                        background: m.user === user.nome ? "#c1121f" : "#fff",
                        color: m.user === user.nome ? "#fff" : "#18181b",
                        border: m.user === user.nome ? "none" : "1px solid #e4e4e7",
                        borderRadius: m.user === user.nome ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.25rem",
                        boxShadow: m.user === user.nome ? "0 2px 8px rgba(193,18,31,.2)" : "0 1px 3px rgba(0,0,0,.05)"
                      }}>
                      {m.texto}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-zinc-100 bg-white flex gap-2">
            <input
              value={chatTexto}
              onChange={e => setChatTexto(e.target.value)}
              onKeyDown={e => e.key === "Enter" && enviarChat()}
              placeholder="Digite e pressione Enter..."
              className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-full outline-none text-sm"
            />
            <button onClick={enviarChat} disabled={!chatTexto.trim()} className="w-10 h-10 grid place-items-center rounded-full text-white font-bold" style={{ background: "#c1121f", opacity: chatTexto.trim() ? 1 : 0.5 }}>➤</button>
          </div>
        </div>
      )}
    </>
  )
}