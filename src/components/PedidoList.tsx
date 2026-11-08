import type { Pedido } from "../domain/tipos"
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
}

export function PedidoList({ pedidos, prog, cor2, visual, onSelect, onNovoPedido, canCriarPedido }: PedidoListProps) {
  return (
    <>
      {pedidos.length === 0 ? (
        <EmptyState onNovoPedido={onNovoPedido} cor2={cor2} canCriarPedido={canCriarPedido} />
      ) : (
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
      )}
    </>
  )
}