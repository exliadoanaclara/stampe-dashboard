import { useState, useEffect, useMemo, useCallback } from "react"
import type { Pedido, Etapa, UserState } from "../domain/tipos"
import { fmtNumero, fmtData, fmtDataHora } from "../domain/datas"
import { calcularStatusPrazo } from "../domain/regras"
import { getProgresso } from "../domain/progresso"
import { DEFAULT_CONFIG } from "../domain/tipos"

/** Painel de Costura - Interface mobile para a funcionária de costura (FASE 06).
 * Tela simplificada, responsiva para celular.
 * - Identificar o pedido (número, cliente, serviço)
 * - Consultar informações necessárias
 * - Atualizar o andamento (adicionar observações)
 * - Registrar a conclusão (enviar para ENTREGA)
 * Sem navegação administrativa ou relatórios.
 */
interface PainelCosturaProps {
  user: UserState
  pedidos: Pedido[]
  onClose: () => void
  enviarParaEntrega: (p: Pedido, user: UserState) => Promise<void>
  addInfoCostura: (p: Pedido) => void
  tempInfoCostura: string
  setTempInfoCostura: (v: string) => void
}

const ETAPA_LABEL: Record<Etapa, string> = {
  PEDIDO: "Pedido",
  ARTES: "Artes",
  IMPRESSAO: "Impressao",
  PRODUCAO: "Producao",
  COSTURA: "Costura",
  ENTREGA: "Entrega",
  FINALIZADO: "Finalizado",
}

export function PainelCostura({
  user, pedidos, onClose, enviarParaEntrega, addInfoCostura, tempInfoCostura, setTempInfoCostura,
}: PainelCosturaProps) {
  const ehProducaoOuAdmin = (user.roles ?? []).includes("PRODUCAO") || (user.roles ?? []).includes("ADMIN")

  if (!ehProducaoOuAdmin) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4 text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-zinc-100 max-w-md w-full">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-black text-zinc-900 mb-2">Acesso restrito</h1>
          <p className="text-zinc-600 mb-6">O painel de costura é exclusivo para a equipe de produção.</p>
          <button onClick={onClose} className="w-full rounded-full py-3 font-black text-white shadow-md" style={{ background: "#b5000c" }}>
            Voltar
          </button>
        </div>
      </div>
    )
  }

  // Pedidos que estao em COSTURA ou PRODUCAO (aguardando costura)
  const pedidosCostura = useMemo(() => {
    return pedidos.filter(p =>
      (p.etapa === "COSTURA" || p.etapa === "PRODUCAO") && !p.canceladoEm
    ).sort((a, b) => a.numero - b.numero)
  }, [pedidos])

  return (
    <div className="min-h-screen bg-red-50 text-zinc-900 p-2 md:p-4 max-w-[500px] mx-auto">
      {/* Header */}
      <header className="bg-red-600 rounded-2xl shadow-lg p-5 mb-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-black tracking-widest uppercase opacity-90">STAMPE - Costura</div>
            <div className="text-xl font-black mt-0.5">Painel da Costureira</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm hover:bg-red-800 transition">✕</button>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">{user.nome}</span>
          <span className="text-xs opacity-80">| Produção / Costura</span>
        </div>
      </header>

      {/* Contador */}
      <div className="mb-4 px-1">
        <div className="flex items-center justify-between bg-white rounded-xl border border-red-200 p-3 shadow-sm">
          <div>
            <div className="text-xs font-black tracking-widest text-red-600 uppercase">Pedidos para costurar</div>
            <div className="text-3xl font-black text-zinc-900">{pedidosCostura.length}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-black">
            🧵
          </div>
        </div>
      </div>

      {pedidosCostura.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 text-center mb-4">
          <div className="text-5xl mb-3">🧵</div>
          <div className="text-xl font-black text-zinc-900 mb-2">Sem pedidos para costura</div>
          <p className="text-zinc-500 text-sm">
            Nenhum pedido está na etapa de Produção ou Costura no momento.
          </p>
        </div>
      )}

      {/* Lista de pedidos */}
      <div className="space-y-2">
        {pedidosCostura.map(p => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-red-100 p-4 mb-2">
            {/* Cabeçalho do pedido */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                    No {fmtNumero(p.numero)}
                  </span>
                  {p.prioridade === "URGENTE" && (
                    <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">🚨 URGENTE</span>
                  )}
                </div>
                <div className="text-sm font-bold text-zinc-900 leading-tight">{p.cliente}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{p.servico}</div>
                <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full" style={{
                    background: p.etapa === "COSTURA" ? "#7c3aed" : "#0284c7"
                  }} />
                  <span className="font-bold">{ETAPA_LABEL[p.etapa]}</span>
                  {p.dataPrazo && (
                    <>
                      <span className="ml-2 text-[10px]">|</span>
                      <span className={`text-[10px] font-bold ${calcularStatusPrazo(p.dataPrazo) === "VERMELHO" ? "text-red-600" : calcularStatusPrazo(p.dataPrazo) === "LARANJA" ? "text-amber-600" : "text-emerald-600"}`}>
                        {fmtData(p.dataPrazo)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{
                background: p.etapa === "COSTURA" ? "rgba(124, 58, 237, 0.1)" : "rgba(2, 132, 199, 0.1)",
                color: p.etapa === "COSTURA" ? "#7c3aed" : "#0284c7"
              }}>
                {p.etapa === "COSTURA" ? "C" : "P"}
              </div>
            </div>

            {/* Ações da costureira */}
            <div className="space-y-2">
              {p.etapa === "PRODUCAO" && (
                <button
                  onClick={() => enviarParaEntrega(p, user)}
                  disabled={false}
                  className="w-full rounded-xl py-3 font-black text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "#059669" }}
                >
                  <span>🚚</span> Iniciar costura - enviar para Entrega
                </button>
              )}
              {p.etapa === "COSTURA" && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Observação da costura</label>
                    <textarea
                      value={tempInfoCostura}
                      onChange={e => setTempInfoCostura(e.target.value)}
                      rows={2}
                      placeholder="Ex: Costura concluída, peças prontas..."
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => addInfoCostura(p)}
                      className="w-full rounded-xl py-2.5 font-black text-zinc-900 bg-zinc-100 border border-zinc-200 shadow-sm flex items-center justify-center gap-2 transition hover:bg-zinc-200"
                    >
                      <span>📝</span> Registrar observação
                    </button>
                  </div>
                  <button
                    onClick={() => enviarParaEntrega(p, user)}
                    className="w-full rounded-xl py-3 font-black text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "#7c3aed" }}
                  >
                    <span>✅</span> Concluir costura - enviar para Entrega
                  </button>
                </>
              )}
            </div>

            {/* Historico recente da costura (ultimas 3 infos) */}
            {p.infosCostura.length > 0 && (
              <div className="mt-3 pt-3 border-t border-zinc-100">
                <div className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-2">Historico da costura</div>
                <div className="space-y-1">
                  {p.infosCostura.slice(-3).map(info => (
                    <div key={info.id} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 w-1 h-1 rounded-full bg-zinc-300" />
                      <div className="text-zinc-700 leading-tight">
                        <span className="font-bold text-zinc-900">{info.usuario}</span>{" "}
                        <span className="text-zinc-500">{info.texto}</span>
                        <span className="ml-1 text-zinc-400">[{fmtDataHora(info.data)}]</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="mt-6 text-center">
        <button onClick={onClose} className="w-full rounded-full py-3 font-black text-white shadow-md" style={{ background: "#b5000c" }}>
          Voltar para pedidos
        </button>
      </footer>
    </div>
  )
}
