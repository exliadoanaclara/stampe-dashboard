import type { Pedido, Aba } from "../domain/tipos"
import { PedidoCard } from "./PedidoCard"
import { EmptyState } from "./EmptyState"

interface PedidoListProps {
  pedidos: Pedido[]
  prog: (p: Pedido) => number
  cor2: string
  visual: { mostrarObs: boolean; mostrarArte: boolean }
  onSelect: (id: string) => void
  onNovoPedido: () => void
  canCriarPedido: boolean
  aba: Aba
}

export function PedidoList({ pedidos, prog, cor2, visual, onSelect, onNovoPedido, canCriarPedido, aba }: PedidoListProps) {
  const mostrarBotaoNovo = canCriarPedido && aba === "PEDIDO"
  return (
    <>
      {pedidos.length === 0 ? (
        <EmptyState onNovoPedido={onNovoPedido} cor2={cor2} canCriarPedido={canCriarPedido} aba={aba} />
      ) : (
        <>
          {mostrarBotaoNovo && (
            <div className="mb-4 flex justify-end">
              <button onClick={onNovoPedido} className="text-white rounded-full px-4 py-2 font-bold text-sm shadow-md flex items-center gap-2" style={{ background: cor2 }}>
                <span className="text-lg leading-none">＋</span> Novo Pedido
              </button>
            </div>
          )}
        <div className="no-print grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pedidos.map(p => (
            <PedidoCard
              key={p.id}
              p={p}
              prog={prog(p)}
              cor2={cor2}
              visual={visual}
              onClick={() => onSelect(p.id)}
            />
          ))}
        </div>
        </>
      )}
    </>
  )
}