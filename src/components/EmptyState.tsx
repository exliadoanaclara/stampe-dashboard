import type { Aba } from "../domain/tipos"

interface EmptyStateProps {
  onNovoPedido: () => void
  cor2: string
  canCriarPedido: boolean
  aba: Aba
}

export function EmptyState({ onNovoPedido, cor2, canCriarPedido, aba }: EmptyStateProps) {
  const mostrarBotao = canCriarPedido && aba === "PEDIDO"
  return (
    <div className="bg-white border-2 border-solid border-red-700 rounded-2xl p-10 text-center">
      <div className="text-4xl mb-3">📄</div>
      <h3 className="font-bold text-zinc-800">Nenhum pedido encontrado</h3>
      <p className="text-sm text-zinc-500 mt-1">Ajuste os filtros ou crie um novo pedido.</p>
      {mostrarBotao && (
        <button onClick={onNovoPedido} className="mt-4 text-white rounded-full px-5 py-2 font-bold text-sm" style={{ background: cor2 }}>＋ Criar pedido</button>
      )}
    </div>
  )
}