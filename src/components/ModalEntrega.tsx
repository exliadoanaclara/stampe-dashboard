import { useState } from "react"
import type { Pedido } from "../domain/tipos"
import { fmtData, fmtDataHora, fmtNumero } from "../domain/datas"

/** Modal de entrega detalhado (FASE 07).
 * Permite registrar: responsável, data/horário, situação, pagamento (opcional),
 * assinatura (opcional) e observações. Campos opcionais não bloqueiam o fluxo.
 */
interface ModalEntregaProps {
  show: boolean
  pedido: Pedido | null
  onClose: () => void
  onConfirmar: (dados: {
    entreguePor?: string
    dataEntrega?: string
    entregaSituacao?: string
    entregaPagamento?: string
    entregaAssinatura?: string
    observacoes?: string
  }) => void
}

export function ModalEntrega({ show, pedido, onClose, onConfirmar }: ModalEntregaProps) {
  const [entreguePor, setEntreguePor] = useState("")
  const [dataEntrega, setDataEntrega] = useState("")
  const [entregaSituacao, setEntregaSituacao] = useState("Entregue")
  const [entregaPagamento, setEntregaPagamento] = useState("")
  const [entregaAssinatura, setEntregaAssinatura] = useState("")
  const [observacoes, setObservacoes] = useState("")

  if (!show) return null

  const agora = new Date()
  const dataHoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`
  const horaAgora = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚚</span>
              <div className="font-black text-lg">Registro de Entrega</div>
            </div>
            <button onClick={onClose} className="text-white hover:text-red-100 text-xl">✕</button>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-xs font-black tracking-widest text-green-700 uppercase mb-1">
              Pedido No {pedido ? fmtNumero(pedido.numero) : "-"} — {pedido?.cliente ?? ""}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">Responsável pela entrega *</label>
                <input
                  value={entreguePor}
                  onChange={e => setEntreguePor(e.target.value)}
                  placeholder="Nome do funcionário"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm font-bold focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">Data</label>
                  <input
                    type="date"
                    value={dataEntrega}
                    onChange={e => setDataEntrega(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm font-bold focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">Horário</label>
                  <input
                    type="time"
                    value={horaAgora}
                    readOnly
                    className="w-full px-3 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">Situação da entrega</label>
                <select
                  value={entregaSituacao}
                  onChange={e => setEntregaSituacao(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm font-bold focus:border-green-500"
                >
                  <option value="Entregue">Entregue</option>
                  <option value="Parcial">Entrega Parcial</option>
                  <option value="Retirada na loja">Retirada na loja</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Pagamento (opcional)</span>
                  <span className="ml-auto text-[10px] text-zinc-400">Campo não obrigatório</span>
                </div>
                <input
                  value={entregaPagamento}
                  onChange={e => setEntregaPagamento(e.target.value)}
                  placeholder="Ex: Pix, Cartão, Boleto, A combinar..."
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm focus:border-green-500"
                />
              </div>

              <div className="pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Assinatura (opcional)</span>
                  <span className="ml-auto text-[10px] text-zinc-400">Campo não obrigatório</span>
                </div>
                <input
                  value={entregaAssinatura}
                  onChange={e => setEntregaAssinatura(e.target.value)}
                  placeholder="Nome do cliente que assinou (ou anexar base64)"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">Observações</label>
                <textarea
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Ocorrências da entrega..."
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm focus:border-green-500"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const dataHora = dataEntrega ? `${dataEntrega}T${horaAgora}:00` : new Date().toISOString()
                  onConfirmar({
                    entreguePor: entreguePor.trim() || undefined,
                    dataEntrega: dataHora,
                    entregaSituacao: entregaSituacao || undefined,
                    entregaPagamento: entregaPagamento.trim() || undefined,
                    entregaAssinatura: entregaAssinatura.trim() || undefined,
                    observacoes: observacoes.trim() || undefined,
                  })
                }}
                disabled={!entreguePor.trim()}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ✅ Concluir Entrega
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
