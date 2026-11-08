import { ROLES } from "../domain/tipos"
import type { UserState } from "../domain/tipos"

interface HeaderProps {
  user: UserState
  visual: {
    logoUrl: string | null
    logoImgAlt: number
    titulo: string
    subtitulo: string
    nomeEmpresa: string
    subLogo: string
    logoTam: number
    corHeader: string
    corHeader2: string
    corHeader3: string
  }
  onPaginaChange: (pagina: "PEDIDOS" | "PERSONALIZAR") => void
  onShowConfig: () => void
  onShowNovo: () => void
  onCadastroUsuarios?: () => void
  onShowCentroComando?: () => void
  onShowPainelCostura?: () => void
  onLogout: () => void
  canCriarPedido: boolean
}

export function Header({ user, visual, onPaginaChange, onShowConfig, onShowNovo, onCadastroUsuarios, onShowCentroComando, onShowPainelCostura, onLogout, canCriarPedido }: HeaderProps) {
  const cor1 = visual.corHeader
  const cor2 = visual.corHeader2
  const cor3 = visual.corHeader3
  const headerBg = `linear-gradient(135deg, ${cor1} 0%, ${cor2} 50%, ${cor3} 100%)`
  const nomeLogo = visual.nomeEmpresa.replace(/\s+/g, "")

  return (
    <header className="relative overflow-hidden print-hide-layout">
      <div style={{ background: headerBg }} className="text-white px-4 md:px-6 pt-6 pb-10">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            {visual.logoUrl && (
              <img src={visual.logoUrl} alt="logo" className="w-auto object-contain shrink-0" style={{ height: visual.logoImgAlt }} />
            )}
            <div className="min-w-0">
              <h1 className="text-[40px] md:text-[52px] font-black leading-none tracking-tight">{visual.titulo}</h1>
              <p className="text-white/80 text-sm md:text-[15px] -mt-1 tracking-wide">{visual.subtitulo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-white/10 backdrop-blur rounded-full px-4 py-2 border-2 border-solid border-white/30">
              <div className="leading-none">
                <div className="font-black tracking-widest" style={{ fontSize: visual.logoTam }}>
                  {visual.logoUrl ? null : <span className="opacity-80">◎</span>} {nomeLogo}
                </div>
                {visual.subLogo && (
                  <div className="tracking-[0.2em] opacity-80 -mt-1" style={{ fontSize: Math.max(8, Math.round(visual.logoTam * 0.62)) }}>{visual.subLogo}</div>
                )}
              </div>
            </div>
            <div className="md:hidden flex items-center gap-2 font-black tracking-widest" style={{ fontSize: visual.logoTam }}>
              {visual.logoUrl ? null : <span>◎</span>} {nomeLogo}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 mt-3 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden md:inline text-zinc-500">Logado como:</span>
          <span className="bg-white border-2 border-solid border-zinc-700 rounded-full px-3 py-1.5 text-xs md:text-sm font-bold shadow-sm">
            {user.nome} ({(user.roles ?? []).map(r => ROLES.find(x => x.value === r)?.label).filter(Boolean).join(", ")})
          </span>
          <span className="hidden lg:inline text-xs text-zinc-500 ml-2">{ROLES.find(x => x.value === user.roles[0])?.desc}</span>
          <button
            onClick={onLogout}
            className="hidden md:inline text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded-md border-2 border-solid border-red-700"
          >
            Sair
          </button>
        </div>
        <div className="flex items-center gap-2">
          {(user.roles ?? []).includes("ADMIN") && onCadastroUsuarios && (
            <button
              onClick={onCadastroUsuarios}
              className="text-xs md:text-sm bg-white border-2 border-solid border-zinc-700 rounded-full px-3 py-1.5 hover:bg-zinc-50 flex items-center gap-1.5 font-bold"
            >
              <span>👥</span> Usuarios
            </button>
          )}
          {(user.roles ?? []).includes("ADMIN") && onShowCentroComando && (
            <button
              onClick={onShowCentroComando}
              className="text-xs md:text-sm bg-red-600 hover:bg-red-700 text-white border-2 border-solid border-red-700 rounded-full px-3 py-1.5 flex items-center gap-1.5 font-bold shadow-md"
            >
              <span>📊</span> Centro de Comando
            </button>
          )}
          {((user.roles ?? []).includes("PRODUCAO") || (user.roles ?? []).includes("ADMIN")) && onShowPainelCostura && (
            <button
              onClick={onShowPainelCostura}
              className="text-xs md:text-sm bg-purple-600 hover:bg-purple-700 text-white border-2 border-solid border-purple-700 rounded-full px-3 py-1.5 flex items-center gap-1.5 font-bold shadow-md"
            >
              <span>🧵</span> Costura
            </button>
          )}
          <button onClick={() => onPaginaChange("PERSONALIZAR")} className="text-xs md:text-sm bg-white border-2 border-solid border-zinc-700 rounded-full px-3 py-1.5 hover:bg-zinc-50 flex items-center gap-1.5 font-bold">
            <span>🎨</span> Personalizar
          </button>
          <button onClick={onShowConfig} className="text-xs md:text-sm bg-white border-2 border-solid border-zinc-700 rounded-full px-3 py-1.5 hover:bg-zinc-50 hidden sm:flex items-center gap-1.5">
            <span>⚙️</span> Progresso
          </button>
          {canCriarPedido && (
            <button onClick={onShowNovo} className="text-xs md:text-sm font-bold text-white rounded-full px-4 md:px-5 py-1.5 md:py-2 shadow-md flex items-center gap-2" style={{ background: cor2 }}>
              <span className="text-lg leading-none">＋</span> <span className="hidden md:inline">Novo Pedido</span><span className="md:hidden">Novo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
