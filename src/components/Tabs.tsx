import type { Aba } from "../domain/tipos"

interface TabsProps {
  aba: Aba
  pagina: "PEDIDOS" | "PERSONALIZAR"
  stats: { todos: number; pedido: number; artes: number; impressao: number; producao: number; costura: number; entrega: number; finalizado: number }
  cor2: string
  onAbaChange: (aba: Aba) => void
  onPaginaChange: (pagina: "PEDIDOS" | "PERSONALIZAR") => void
}

export function Tabs({ aba, pagina, stats, cor2, onAbaChange, onPaginaChange }: TabsProps) {
  return (
    <nav className="max-w-[1280px] mx-auto px-4 mt-4 print-hide-layout">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "TODOS", label: "VISAO GERAL", count: stats.todos, bg: "#18181b" },
          { id: "PEDIDO", label: "PEDIDOS", count: stats.pedido, bg: cor2 },
          { id: "ARTES", label: "ARTES", count: stats.artes, bg: "#a855f7" },
          { id: "IMPRESSAO", label: "IMPRESSAO", count: stats.impressao, bg: "#f59e0b" },
          { id: "PRODUCAO", label: "PRODUCAO", count: stats.producao, bg: "#0284c7" },
          { id: "COSTURA", label: "COSTURA", count: stats.costura, bg: "#ec4899" },
          { id: "ENTREGA", label: "ENTREGA", count: stats.entrega, bg: "#059669" },
          { id: "HISTORICO", label: "HISTORICO", count: stats.finalizado, bg: "#0f766e" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { onAbaChange(tab.id as Aba); onPaginaChange("PEDIDOS") }}
            className="shrink-0 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-black tracking-wide border-2 border-solid transition"
            style={aba === tab.id && pagina === "PEDIDOS"
              ? { background: tab.bg, color: "#fff", borderColor: "transparent", boxShadow: "0 4px 12px rgba(0,0,0,.15)" }
              : { background: "#fff", color: "#52525b", borderColor: "#a1a1aa" }}
          >
            {tab.label}
            <span className="min-w-[22px] h-[22px] grid place-items-center rounded-full text-xs px-1.5"
              style={aba === tab.id && pagina === "PEDIDOS" ? { background: "rgba(255,255,255,.2)", color: "#fff" } : { background: "#f4f4f5", color: "#52525b" }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}