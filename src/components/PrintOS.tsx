import type { Pedido, VisualConfig } from "../domain/tipos"
import { fmtNumero, fmtData, fmtDataHora } from "../domain/datas"

interface PrintOSProps {
  selected: Pedido
  visual: VisualConfig
  cor2: string
}

export function PrintOS({ selected, visual, cor2 }: PrintOSProps) {
  const nomeLogo = visual.nomeEmpresa.replace(/\s+/g, "")
  const headerBg = `linear-gradient(135deg, ${visual.corHeader} 0%, ${visual.corHeader2} 50%, ${visual.corHeader3} 100%)`

  return (
    <div className="print-document print-center print-hide">
      <div style={{ background: headerBg }} className="text-white p-6 print-banner">
        <div className="max-w-[722px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {visual.logoUrl && (
              <img src={visual.logoUrl} alt="logo" className="w-auto object-contain shrink-0" style={{ height: visual.logoImgAlt }} />
            )}
            <div className="min-w-0">
              <h1 className="text-[36px] md:text-[48px] font-black leading-none">{visual.titulo}</h1>
              <p className="text-white/80 text-sm md:text-[14px] -mt-1">{visual.subtitulo}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-black tracking-widest" style={{ fontSize: visual.logoTam }}>
              {visual.logoUrl ? null : <span className="opacity-80">◎</span>} {nomeLogo}
            </div>
            {visual.subLogo && (
              <div className="tracking-[0.2em] opacity-80 -mt-1" style={{ fontSize: Math.max(8, Math.round(visual.logoTam * 0.62)) }}>{visual.subLogo}</div>
            )}
            <div className="mt-2 text-xs bg-white/15 border border-white/20 rounded-full px-3 py-1">PEDIDO Nº {fmtNumero(selected.numero)}</div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[722px] mx-auto">
        <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm mb-4">
          <span className="w-7 h-7 grid place-items-center rounded bg-red-50 border border-red-100" style={{ color: cor2 }}>📄</span> RESUMO DO PEDIDO
        </div>
        <div className="rounded-2xl p-5 border mb-5" style={{ background: "#fff5f5", borderColor: "#fee2e2" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div>
              <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>👥</span> CLIENTE</div>
              <div className="font-black text-sm mt-1">- {selected.cliente}</div>
            </div>
            <div>
              <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>🖨️</span> SERVICO</div>
              <div className="font-black text-sm mt-1">- {selected.servico}</div>
            </div>
            <div>
              <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>👤</span> ATENDENTE</div>
              <div className="font-black text-sm mt-1">- {selected.atendente}</div>
            </div>
            <div>
              <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📅</span> PREVISAO</div>
              <div className="font-black text-sm mt-1">- {fmtData(selected.previsaoConclusao)}</div>
            </div>
          </div>
          {(selected.telefone || selected.quantidade || selected.valor) && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {selected.telefone && (
                <div>
                  <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📞</span> TELEFONE</div>
                  <div className="font-black text-sm mt-1">- {selected.telefone}</div>
                </div>
              )}
              {selected.quantidade && (
                <div>
                  <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📦</span> QUANTIDADE</div>
                  <div className="font-black text-sm mt-1">- {selected.quantidade}</div>
                </div>
              )}
              {selected.valor && (
                <div>
                  <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>💰</span> VALOR</div>
                  <div className="font-black text-sm mt-1">- {selected.valor}</div>
                </div>
              )}
            </div>
          )}
          {(selected.prioridade && selected.prioridade !== "NORMAL") || (selected.itens && selected.itens.length > 0) && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {(selected.prioridade && selected.prioridade !== "NORMAL") && (
                <div>
                  <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>⚡</span> PRIORIDADE</div>
                  <div className="font-black text-sm mt-1 capitalize">- {selected.prioridade}</div>
                </div>
              )}
              {selected.itens && selected.itens.length > 0 && (
                <div>
                  <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📋</span> ITENS</div>
                  <div className="font-black text-sm mt-1 leading-tight">- {selected.itens.map(i => `${i.descricao} (${i.quantidade} ${i.unidade})`).join(" • ")}</div>
                </div>
              )}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-red-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📅</span> INICIO</div>
              <div className="font-black text-sm mt-1">- {fmtData(selected.dataInicio)}</div>
            </div>
            <div className="md:col-span-3 text-xs text-zinc-500 flex items-end">
              Criado {fmtDataHora(selected.dataCriacao)} • Atualizado {fmtDataHora(selected.dataAtualizacao)}
              {selected.dataEntrega && ` • Entregue ${fmtDataHora(selected.dataEntrega)} por ${selected.entreguePor}`}
              {selected.dataFinalizacao && ` • Finalizado ${fmtDataHora(selected.dataFinalizacao)} por ${selected.usuarioFinalizacao}`}
            </div>
          </div>
        </div>

        {visual.mostrarObs && selected.observacoes && (
          <div className="mb-5 rounded-2xl overflow-hidden flex border" style={{ background: "#fff5f5", borderColor: "#fee2e2" }}>
            <div className="w-1.5 shrink-0" style={{ background: cor2 }} />
            <div className="p-5 flex-1">
              <div className="flex items-center gap-2 font-black text-sm" style={{ color: cor2 }}>
                <span className="w-7 h-7 grid place-items-center rounded bg-white border border-red-100">📋</span> OBSERVACOES
              </div>
              <div className="mt-2 font-black text-sm md:text-[15px] leading-tight">- {selected.observacoes}</div>
            </div>
          </div>
        )}

        {visual.mostrarArte && (
          <section className="mb-5">
            <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm mb-3">
              <span className="w-7 h-7 grid place-items-center rounded bg-red-50 border border-red-100" style={{ color: cor2 }}>🖼️</span> PREVIA DA ARTE
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 md:p-4 min-h-[200px] grid place-items-center overflow-hidden">
              {selected.arteUrls.length > 0 ? (
                <>
                  <img src={selected.arteUrls[0]} alt="Previa da arte" className="max-h-[420px] w-auto object-contain rounded-xl" />
                  {selected.arteUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs rounded px-2 py-1">+{selected.arteUrls.length - 1}</div>
                  )}
                </>
              ) : selected.arteProducaoUrls.length > 0 ? (
                <>
                  <img src={selected.arteProducaoUrls[0]} alt="Previa da arte de producao" className="max-h-[420px] w-auto object-contain rounded-xl" />
                  {selected.arteProducaoUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs rounded px-2 py-1">+{selected.arteProducaoUrls.length - 1}</div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-2">🖼️</div>
                  <div className="text-sm text-zinc-500 font-medium">Nenhuma previa enviada</div>
                </div>
              )}
            </div>
          </section>
        )}

        {selected.etapa !== "PEDIDO" && selected.etapa !== "FINALIZADO" && (
          <section className="mb-5">
            <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm mb-3">
              <span className="w-7 h-7 grid place-items-center bg-white border border-zinc-200 rounded">🔄</span> ETAPA ATUAL: {selected.etapa}
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-4">
              <div className="text-[11px] font-black text-zinc-700">ETAPA ATUAL</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-black border"
                style={{
                  background: selected.etapa === "IMPRESSAO" ? "#fffbeb" : "#f0f9ff",
                  color: selected.etapa === "IMPRESSAO" ? "#b45309" : "#0369a1",
                  borderColor: selected.etapa === "IMPRESSAO" ? "#fde68a" : "#bae6fd",
                }}>
                <span className="w-2 h-2 rounded-full" style={{ background: selected.etapa === "IMPRESSAO" ? "#f59e0b" : "#0284c7" }} />
                {selected.etapa}
              </div>
              {selected.previsaoImpressao && (
                <div className="mt-4 text-xs text-zinc-500">Previsao Impressao: {fmtData(selected.previsaoImpressao)}</div>
              )}
              {selected.previsaoProducao && (
                <div className="mt-1 text-xs text-zinc-500">Previsao Producao: {fmtData(selected.previsaoProducao)}</div>
              )}
              {selected.previsaoEntrega && (
                <div className="mt-1 text-xs text-zinc-500">Previsao Entrega: {fmtData(selected.previsaoEntrega)}</div>
              )}
            </div>
          </section>
        )}

        {(selected.etapa === "ENTREGA" || selected.etapa === "FINALIZADO") && selected.infosEntrega.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm mb-3">
              <span className="w-7 h-7 grid place-items-center bg-white border border-zinc-200 rounded">🚚</span> ENTREGA
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="font-black text-emerald-800 text-sm mb-2">INFORMACOES DA ENTREGA</div>
              <div className="space-y-2">
                {selected.infosEntrega.map((it: any) => (
                  <div key={it.id} className="bg-white border border-emerald-100 rounded-lg p-2 text-sm font-bold leading-tight">
                    {it.texto}
                    <div className="text-[11px] text-zinc-500 mt-1">{it.usuario} • {fmtDataHora(it.data)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {(selected.infosImpressao.length > 0 || selected.infosProducao.length > 0) && (
          <section className="mb-5">
            <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm mb-3">
              <span className="w-7 h-7 grid place-items-center bg-white border border-zinc-200 rounded">📝</span> INFORMACOES ADICIONAIS
            </div>
            {selected.infosImpressao.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                <div className="font-black text-amber-800 text-sm mb-2">IMPRESSAO</div>
                <div className="space-y-2">
                  {selected.infosImpressao.map((it: any) => (
                    <div key={it.id} className="bg-white border border-amber-100 rounded-lg p-2 text-sm font-bold leading-tight">
                      {it.texto}
                      <div className="text-[11px] text-zinc-500 mt-1">{it.usuario} • {fmtDataHora(it.data)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selected.infosProducao.length > 0 && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                <div className="font-black text-sky-800 text-sm mb-2">PRODUCAO</div>
                <div className="space-y-2">
                  {selected.infosProducao.map((it: any) => (
                    <div key={it.id} className="bg-white border border-sky-100 rounded-lg p-2 text-sm font-bold leading-tight">
                      {it.texto}
                      <div className="text-[11px] text-zinc-500 mt-1">{it.usuario} • {fmtDataHora(it.data)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {selected.etapa === "FINALIZADO" && (
          <div className="mt-6 bg-emerald-600 text-white rounded-xl p-4 text-center font-black text-lg">
            ✅ PEDIDO FINALIZADO EM {fmtDataHora(selected.dataFinalizacao!)} POR {selected.usuarioFinalizacao?.toUpperCase()} • 100%
          </div>
        )}

        {selected.canceladoEm && (
          <div className="mt-6 bg-red-600 text-white rounded-xl p-4 text-center font-black text-lg">
            ✕ PEDIDO CANCELADO EM {fmtDataHora(selected.canceladoEm)} POR {selected.canceladoPor?.toUpperCase()} — {selected.canceladoMotivo}
          </div>
        )}

        <div className="mt-6 h-2 rounded-full" style={{ background: cor2 }} />
      </div>
    </div>
  )
}