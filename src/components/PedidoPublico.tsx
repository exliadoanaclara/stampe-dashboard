import { useEffect, useState } from "react"
import type { Pedido, Etapa } from "../domain/tipos"
import { getProgresso } from "../domain/progresso"
import { DEFAULT_CONFIG } from "../domain/tipos"
import { fmtNumero, fmtData, fmtDataHora } from "../domain/datas"

/** Componente publico de acompanhamento individual do cliente (FASE 08).
 * Renderizado SEM autenticacao. Recebe o token via query param ?token=...
 * Mostra apenas informações liberadas para o cliente.
 */
interface PedidoPublicoProps {
  token: string | null
  pedidos: Pedido[]
  onClose?: () => void
}

const ETAPA_LABEL: Record<Etapa, string> = {
  PEDIDO: "Recebido",
  ARTES: "Preparacao da arte",
  IMPRESSAO: "Em impressao",
  PRODUCAO: "Em producao",
  COSTURA: "Em costura",
  ENTREGA: "Entrega",
  FINALIZADO: "Finalizado",
}

export function PedidoPublico({ token, pedidos, onClose }: PedidoPublicoProps) {
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!token) {
      setErro("Token invalido")
      setCarregando(false)
      return
    }
    // Busca o pedido pelo token (sem expor outros pedidos)
    const p = pedidos.find(
      x => x.tokenAcompanhamento === token && x.tokenAcompanhamentoAtivo
    )
    if (!p) {
      setErro("Link invalido ou revogado")
      setCarregando(false)
      return
    }
    setPedido(p)
    setCarregando(false)
  }, [token, pedidos])

  if (carregando) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white text-zinc-800 font-black text-xl">
        Carregando pedido...
      </div>
    )
  }

  if (erro || !pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-zinc-100">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-black text-zinc-900 mb-2">{erro || "Pedido nao encontrado"}</h1>
          <p className="text-zinc-600 mb-6">O link de acompanhamento e invalido ou foi revogado pela empresa.</p>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full rounded-full py-3 font-black text-white shadow-md"
              style={{ background: "#b5000c" }}
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    )
  }

  const prog = getProgresso(pedido.etapa, DEFAULT_CONFIG)
  const etapaLabel = ETAPA_LABEL[pedido.etapa]

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 p-4 md:p-8">
      <div className="max-w-[480px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-black text-xl">
              🧵
            </span>
            <div>
              <div className="text-xs font-black tracking-widest text-zinc-500 uppercase">STAMPE</div>
              <div className="text-sm font-bold text-zinc-900">Acompanhamento do Pedido</div>
            </div>
          </div>

          {/* Numero do pedido */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-bold text-zinc-600">Numero do pedido</div>
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <span className="font-black text-zinc-900">No {fmtNumero(pedido.numero)}</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Pedido cliente</span>
            </div>
          </div>

          {/* Status atual */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-bold text-zinc-600">Etapa atual</div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${prog >= 100 ? "bg-emerald-500" : prog >= 75 ? "bg-blue-500" : prog >= 50 ? "bg-orange-500" : "bg-zinc-400"}`} />
              <span className="font-bold text-sm">{etapaLabel}</span>
              <span className="ml-auto text-xs font-bold text-zinc-400">{prog}%</span>
            </div>
          </div>

          {/* Previsão de entrega */}
          {pedido.previsaoEntrega && (
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm font-bold text-zinc-600">Previsao de entrega</div>
              <div className="font-bold text-sm">{fmtData(pedido.previsaoEntrega)}</div>
            </div>
          )}

          <div className="h-1 bg-zinc-200 rounded-full overflow-hidden mb-6">
            <div className={`h-full rounded-full transition-all duration-500 ${prog >= 100 ? "bg-emerald-500" : prog >= 75 ? "bg-blue-500" : prog >= 50 ? "bg-orange-500" : "bg-zinc-400"}`} style={{ width: `${prog}%` }} />
          </div>
        </div>

        {/* Linha do tempo das etapas autorizadas (soma as etapas concluídas até a atual) */}
        <div className="space-y-4">
          <div className="text-xs font-black tracking-widest text-zinc-500 uppercase mb-2">Historico do pedido</div>
          <div className="space-y-3">
            {pedido.etapaHistorico.map((h, i) => {
              const concluida = i < pedido.etapaHistorico.length - 1 || pedido.etapa === "FINALIZADO"
              return (
                <div key={h.data} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{
                    background: concluida ? "#059669" : "#cbd5e1",
                  }} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start text-sm font-bold">
                      <span>{ETAPA_LABEL[h.para]}</span>
                      <span className={concluida ? "text-emerald-600" : "text-zinc-400"}>{concluida ? "Concluido" : "Atual"}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {fmtDataHora(h.data)}{h.motivo ? ` — ${h.motivo}` : ""}
                    </div>
                  </div>
                </div>
              )
            })}
            {/* Etapa atual se ainda nao tem historico de entrada */}
            {pedido.etapaHistorico.length === 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-cbd5e1" />
                <div className="flex-1">
                  <div className="text-sm font-bold">{etapaLabel}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Etapa atual</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-600">ℹ️</span>
            <span className="text-zinc-700">
              Este e o link exclusivo do seu pedido. Voce so pode acompanhar este pedido, nao e possivel acessar outros pedidos ou a fila geral da empresa.
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-6 rounded-full py-3 font-black text-white shadow-md flex items-center justify-center gap-2"
            style={{ background: "#b5000c" }}
          >
            <span>✕</span> Fechar acompanhamento
          </button>
        )}
      </div>
    </div>
  )
}
