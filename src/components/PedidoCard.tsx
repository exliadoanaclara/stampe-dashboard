import type { Pedido } from "../domain/tipos"
import { fmtNumero, fmtData } from "../domain/datas"

/** Verifica se a URL aponta para uma imagem (aceita data URL base64 e URL normal). */
function ehImagem(url: string): boolean {
  return /^data:image\//i.test(url) || /\.(png|jpe?g|gif|svg|webp)(\?|$)/i.test(url)
}

/** Extrai a extensão real do arquivo (funciona em data URL base64 e URL normal). */
function extensaoDeArte(url: string): string {
  const mime = url.match(/^data:[^/]+\/([^;]+)/i)
  if (mime) return mime[1].toUpperCase()
  return url.split(".").pop()?.toUpperCase() ?? ""
}

interface PedidoCardProps {
  p: Pedido
  prog: number
  cor2: string
  visual: { mostrarObs: boolean; mostrarArte: boolean }
  onClick: () => void
}

export function PedidoCard({ p, prog, cor2, visual, onClick }: PedidoCardProps) {
  return (
    <article
      data-testid="pedido-card"
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl hover:border-zinc-300 transition text-left flex flex-col"
    >
      <div className="h-2 w-full" style={{ background: p.etapa === "PEDIDO" ? cor2 : p.etapa === "ARTES" ? "#a855f7" : p.etapa === "IMPRESSAO" ? "#f59e0b" : p.etapa === "PRODUCAO" ? "#0284c7" : p.etapa === "ENTREGA" ? "#059669" : "#0f766e" }} />
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[12px] tracking-[0.12em] font-black text-zinc-400">PEDIDO Nº {fmtNumero(p.numero)}</div>
            <div className="inline-flex items-center gap-2 mt-1.5 rounded-full px-3 py-1.5 text-[11px] font-black tracking-wide border"
              style={{
                background: p.etapa === "PEDIDO" ? "#fef2f2" : p.etapa === "ARTES" ? "#f5f3ff" : p.etapa === "IMPRESSAO" ? "#fffbeb" : p.etapa === "PRODUCAO" ? "#f0f9ff" : p.etapa === "ENTREGA" ? "#ecfdf5" : "#ecfdfe",
                color: p.etapa === "PEDIDO" ? cor2 : p.etapa === "ARTES" ? "#7c3aed" : p.etapa === "IMPRESSAO" ? "#b45309" : p.etapa === "PRODUCAO" ? "#0369a1" : p.etapa === "ENTREGA" ? "#047857" : "#0f766e",
                borderColor: p.etapa === "PEDIDO" ? "#fecaca" : p.etapa === "ARTES" ? "#e9d5ff" : p.etapa === "IMPRESSAO" ? "#fde68a" : p.etapa === "PRODUCAO" ? "#bae6fd" : p.etapa === "ENTREGA" ? "#a7f3d0" : "#b2f2f2",
              }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.etapa === "PEDIDO" ? cor2 : p.etapa === "ARTES" ? "#a855f7" : p.etapa === "IMPRESSAO" ? "#f59e0b" : p.etapa === "PRODUCAO" ? "#0284c7" : p.etapa === "ENTREGA" ? "#059669" : "#0f766e" }} />
              {p.etapa === "PEDIDO" ? "PEDIDO" : p.etapa === "ARTES" ? "ARTES" : p.etapa === "IMPRESSAO" ? "IMPRESSAO" : p.etapa === "PRODUCAO" ? "PRODUCAO" : p.etapa === "ENTREGA" ? "ENTREGA" : "FINALIZADO"}
            </div>
            {p.prioridade && p.prioridade !== "NORMAL" && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 bg-amber-100 border border-amber-200 text-[11px] font-black text-amber-800">
                ⚡ {p.prioridade.charAt(0).toUpperCase() + p.prioridade.slice(1).toLowerCase()}
              </div>
            )}
            {p.prioridadeLock?.ativo && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 bg-red-100 border border-red-200 text-[11px] font-black text-red-800 animate-pulse">
                🔴 PRIORIDADE REPOSIÇÃO
              </div>
            )}
            {p.prioridadeLock?.dataFim && !p.prioridadeLock?.ativo && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 bg-green-100 border border-green-200 text-[11px] font-black text-green-800">
                ✅ Reposição concluída
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-[12px] font-bold text-zinc-500">PROGRESSO</div>
            <div className="text-xl font-black leading-none">{prog}%</div>
          </div>
        </div>

        <div className="mt-4 h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full transition-all rounded-full" style={{ width: `${prog}%`, background: p.etapa === "FINALIZADO" ? "#059669" : cor2 }} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl p-3 border" style={{ background: "#fff5f5", borderColor: "#fee2e2" }}>
            <div className="text-[11px] font-black tracking-wide" style={{ color: cor2 }}>👥 CLIENTE</div>
            <div className="font-black text-sm truncate">{p.cliente}</div>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: "#fff5f5", borderColor: "#fee2e2" }}>
            <div className="text-[11px] font-black tracking-wide" style={{ color: cor2 }}>🖨️ SERVICO</div>
            <div className="font-black text-sm truncate">{p.servico}</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
          <div><div className="text-[11px] font-bold text-zinc-500">👤 ATENDENTE</div><div className="font-bold text-sm truncate">{p.atendente}</div></div>
          <div><div className="text-[11px] font-bold text-zinc-500">📅 INICIO</div><div className="font-bold text-sm">{fmtData(p.dataInicio)}</div></div>
          <div><div className="text-[11px] font-bold text-zinc-500">⏰ PREVISAO</div><div className="font-bold text-sm">{fmtData(p.previsaoConclusao)}</div></div>
        </div>
        {(p.telefone || p.quantidade || p.valor) && (
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            {p.telefone && (
              <div><div className="text-[11px] font-bold text-zinc-500">📞 TELEFONE</div><div className="font-bold text-sm truncate">{p.telefone}</div></div>
            )}
            {p.quantidade && (
              <div><div className="text-[11px] font-bold text-zinc-500">📦 QUANTIDADE</div><div className="font-bold text-sm truncate">{p.quantidade}</div></div>
            )}
            {p.valor && (
              <div><div className="text-[11px] font-bold text-zinc-500">💰 VALOR</div><div className="font-bold text-sm truncate">{p.valor}</div></div>
            )}
          </div>
        )}

        {visual.mostrarObs && p.observacoes && (
          <div className="mt-4 bg-[#fff8f8] rounded-r-xl p-3 border-l-4" style={{ borderLeftColor: cor2 }}>
            <div className="text-[11px] font-black" style={{ color: cor2 }}>OBSERVACOES</div>
            <div className="text-sm font-bold leading-tight line-clamp-2">{p.observacoes}</div>
          </div>
        )}

        {visual.mostrarArte && (
          <div className="mt-4">
            <div className="text-[11px] font-black tracking-wide text-zinc-500">PREVIA DA ARTE</div>
            <div className="mt-2 relative h-[120px] rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden grid place-items-center">
              {p.arteUrls.length > 0 ? (
                <>
                  {ehImagem(p.arteUrls[0]) ? (
                    <img src={p.arteUrls[0]} alt="arte" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                      <span className="text-4xl mb-1">📄</span>
                      <span className="text-[11px] font-bold uppercase">{extensaoDeArte(p.arteUrls[0])}</span>
                    </div>
                  )}
                  <a
                    href={p.arteUrls[0]}
                    download={`arte-pedido-${fmtNumero(p.numero)}.png`}
                    onClick={e => e.stopPropagation()}
                    title="Baixar imagem"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white border border-zinc-200 rounded-full px-2.5 py-1.5 text-[11px] font-black shadow-sm"
                  >⬇️</a>
                  {p.arteUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] rounded px-2 py-0.5">+{p.arteUrls.length - 1}</div>
                  )}
                </>
              ) : p.arteProducaoUrls.length > 0 ? (
                <>
                  {ehImagem(p.arteProducaoUrls[0]) ? (
                    <img src={p.arteProducaoUrls[0]} alt="arte producao" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                      <span className="text-4xl mb-1">📄</span>
                      <span className="text-[11px] font-bold uppercase">{extensaoDeArte(p.arteProducaoUrls[0])}</span>
                    </div>
                  )}
                  <a
                    href={p.arteProducaoUrls[0]}
                    download={`arte-producao-pedido-${fmtNumero(p.numero)}.png`}
                    onClick={e => e.stopPropagation()}
                    title="Baixar imagem"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white border border-zinc-200 rounded-full px-2.5 py-1.5 text-[11px] font-black shadow-sm"
                  >⬇️</a>
                  {p.arteProducaoUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] rounded px-2 py-0.5">+{p.arteProducaoUrls.length - 1}</div>
                  )}
                </>
              ) : (
                <span className="text-sm text-zinc-400">Sem arte</span>
              )}
            </div>
          </div>
        )}
        {p.itens && p.itens.length > 0 && (
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <div className="text-[11px] font-black tracking-wide text-amber-800">📋 ITENS</div>
            <div className="text-sm font-bold leading-tight line-clamp-1">{p.itens.map(i => `${i.descricao} (${i.quantidade} ${i.unidade})`).join(" • ")}</div>
          </div>
        )}
      </div>
      <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-sm">
        <span className="text-zinc-500">Atualizado {fmtData(p.dataAtualizacao)}</span>
        <span className="font-bold group-hover:underline" style={{ color: cor2 }}>Abrir documento →</span>
      </div>
    </article>
  )
}