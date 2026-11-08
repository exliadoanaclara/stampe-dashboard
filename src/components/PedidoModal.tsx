import { useState, useRef } from "react"
import type { Pedido, InfoItem, VisualConfig, Etapa, ProgressConfig } from "../domain/tipos"
import { ARTE_ACEITOS } from "../domain/tipos"
import { fmtNumero, fmtData, fmtDataHora } from "../domain/datas"

/** Converte File para data URL (base64) — persiste no localStorage */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ehImagem(url: string): boolean {
  if (/^data:image\//i.test(url)) return true
  if (/\.(png|jpe?g|gif|svg|webp)([#?]|$)/i.test(url)) return true
  // Check hash for blob URLs: blob:.../uuid#png
  const hashMatch = url.match(/#(\w+)$/i)
  if (hashMatch && /^(png|jpe?g|gif|svg|webp)$/i.test(hashMatch[1])) return true
  return false
}

function ehPDF(url: string): boolean {
  if (/^data:application\/pdf/i.test(url)) return true
  if (/\.pdf([#?]|$)/i.test(url)) return true
  // Check hash for blob URLs: blob:.../uuid#pdf
  const hashMatch = url.match(/#(\w+)$/i)
  if (hashMatch && /^pdf$/i.test(hashMatch[1])) return true
  return false
}

function renderArtePreview(url: string, alt: string, className: string = "") {
  // Remove hash (#ext) from blob URLs for src - browser doesn't support hash in blob: URLs
  const srcUrl = url.replace(/#\w+$/, '')
  if (ehImagem(url)) {
    return <img src={srcUrl} alt={alt} className={`w-full h-full object-contain ${className}`} />
  }
  if (ehPDF(url)) {
    return (
      <iframe
        src={srcUrl}
        title={alt}
        className={`w-full h-full ${className}`}
        style={{ border: 'none', background: '#fff' }}
      />
    )
  }
  return (
    <div className={`w-full h-full bg-zinc-100 flex flex-col items-center justify-center text-zinc-400 ${className}`}>
      <span className="text-4xl mb-2">📄</span>
      <span className="text-xs font-bold uppercase truncate">{extensaoDeArte(url)}</span>
    </div>
  )
}

function extensaoDeArte(url: string): string {
  // Handle blob URLs - extract extension from hash or query
  if (url.startsWith('blob:')) {
    const hashMatch = url.match(/[#?](\w+)$/)
    if (hashMatch) return hashMatch[1].toUpperCase()
    // Try to get from original filename in URL path
    const pathMatch = url.match(/\.(\w+)(?:[#?]|$)/)
    if (pathMatch) return pathMatch[1].toUpperCase()
    return "BIN"
  }
  const mime = url.match(/^data:[^/]+\/([^;]+)/i)
  if (mime) return mime[1].toUpperCase()
  return url.split(".").pop()?.toUpperCase() ?? ""
}

interface PedidoModalProps {
  selected: Pedido
  prog: number
  cor2: string
  visual: VisualConfig
  config: ProgressConfig
  canEditResumo: boolean
  editMode: boolean
  setEditMode: (v: boolean) => void
  showHistorico: boolean
  setShowHistorico: (v: boolean) => void
  tempInfoImp: string
  setTempInfoImp: (v: string) => void
  tempInfoArtes: string
  setTempInfoArtes: (v: string) => void
  tempInfoFin: string
  setTempInfoFin: (v: string) => void
  tempInfoEntrega: string
  setTempInfoEntrega: (v: string) => void
  tempInfoCostura: string
  setTempInfoCostura: (v: string) => void
  previsaoEdit: { id: string; imp: string; fin: string } | null
  canEditImpressao: boolean
  canEditArtes: boolean
  canEditProducao: boolean
  canEditEntrega: boolean
  canEditCostura: boolean
  tokenAcompanhamento?: string
  tokenAcompanhamentoAtivo?: boolean
  onGerarLink?: () => void
  onRevogarLink?: () => void
  canEditArteUrl: boolean
  canEditArteArte: boolean
  canEditArteProducao: boolean
  canEnviarParaArtes: boolean
  canEnviarParaImpressao: boolean
  canEnviarParaProducao: boolean
  canEnviarParaCostura: boolean
  canEnviarParaEntrega: boolean
  canFinalizar: boolean
  podeVoltarEtapa: boolean
  podeCancelar: boolean
  podeReabrir: boolean
  podeEntregaConcluida: boolean
  motivoBloqueio: (p: Pedido, destino: Etapa) => string | null
  onClose: () => void
  onPrint: () => void
  onSalvarEdicao: (formData: FormData) => void
  onEnviarParaArtes: () => void
  onEnviarParaImpressao: () => void
  onEnviarParaProducao: () => void
  onEnviarParaCostura: () => void
  onEnviarParaEntrega: () => void
  onEntregaConcluida: () => void
  onFinalizar: () => void
  onReabrir: () => void
  onVoltarEtapa: () => void
  onCancelar: () => void
  onSubstituirArte: (urls: string[]) => void
  onSubstituirArteArte: (urls: string[]) => void
  onSubstituirArteProducao: (urls: string[]) => void
  onAddInfoImpressao: () => void
  onAddInfoArtes: () => void
  onAddInfoProducao: () => void
  onAddInfoCostura: () => void
  onAddInfoEntrega: () => void
  onSalvarPrevisaoImp: () => void
  onSalvarPrevisaoFin: () => void
  onSalvarPrevisaoCostura: () => void
  onSalvarPrevisaoEntrega: () => void
  onEditarPrevisao: (imp: string, fin: string) => void
}

export function PedidoModal({
  selected, prog, cor2, visual, config,
  canEditResumo, editMode, setEditMode, showHistorico, setShowHistorico,
  tempInfoImp, setTempInfoImp, tempInfoArtes, setTempInfoArtes, tempInfoFin, setTempInfoFin, tempInfoEntrega, setTempInfoEntrega, tempInfoCostura, setTempInfoCostura,
  previsaoEdit, canEditImpressao, canEditArtes, canEditProducao, canEditEntrega, canEditCostura, canEditArteUrl, canEditArteArte, canEditArteProducao,
  canEnviarParaArtes, canEnviarParaImpressao, canEnviarParaProducao, canEnviarParaCostura, canEnviarParaEntrega, canFinalizar,
  tokenAcompanhamento, tokenAcompanhamentoAtivo,
  onGerarLink, onRevogarLink,
  podeVoltarEtapa, podeCancelar, podeReabrir, podeEntregaConcluida, motivoBloqueio,
  onClose, onPrint, onSalvarEdicao, onEnviarParaArtes, onEnviarParaImpressao,
  onEnviarParaProducao, onEnviarParaCostura, onEnviarParaEntrega, onEntregaConcluida, onFinalizar, onReabrir, onVoltarEtapa, onCancelar,
  onSubstituirArte, onSubstituirArteArte, onSubstituirArteProducao, onAddInfoImpressao, onAddInfoArtes, onAddInfoProducao, onAddInfoCostura, onAddInfoEntrega,
  onSalvarPrevisaoImp, onSalvarPrevisaoFin, onSalvarPrevisaoCostura, onSalvarPrevisaoEntrega, onEditarPrevisao
}: PedidoModalProps) {
  const [tempArteUrls, setTempArteUrls] = useState<string[]>([])
  const [tempArteArteUrls, setTempArteArteUrls] = useState<string[]>([])
  const [tempArteProducaoUrls, setTempArteProducaoUrls] = useState<string[]>([])
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null)
  const artePrepRef = useRef<HTMLInputElement>(null)
  const arteOrigRef = useRef<HTMLInputElement>(null)
  const arteProdRef = useRef<HTMLInputElement>(null)
  const artePrepEmptyRef = useRef<HTMLInputElement>(null)
  const arteOrigEmptyRef = useRef<HTMLInputElement>(null)
  const arteProdEmptyRef = useRef<HTMLInputElement>(null)

  const removerArteUrl = (index: number) => {
    const atualizadas = selected.arteUrls.filter((_, i) => i !== index)
    onSubstituirArte(atualizadas)
  }

  const removerArteProducaoUrl = (index: number) => {
    const atualizadas = selected.arteProducaoUrls.filter((_, i) => i !== index)
    onSubstituirArteProducao(atualizadas)
  }

  const removerArteArteUrl = (index: number) => {
    const atualizadas = selected.arteArteUrls.filter((_, i) => i !== index)
    onSubstituirArteArte(atualizadas)
  }

  const nomeLogo = visual.nomeEmpresa.replace(/\s+/g, "")
  const headerBg = `linear-gradient(135deg, ${visual.corHeader} 0%, ${visual.corHeader2} 50%, ${visual.corHeader3} 100%)`

  const basePrevisaoImp = selected.previsaoImpressao || selected.previsaoConclusao || ""
  const basePrevisaoFin = selected.previsaoProducao || selected.previsaoImpressao || selected.previsaoConclusao || ""
  const basePrevisaoEntrega = selected.previsaoEntrega || selected.previsaoProducao || selected.previsaoImpressao || ""
  const editandoPrevisao = previsaoEdit && previsaoEdit.id === selected.id ? previsaoEdit : null
  const currentPrevisaoImp = editandoPrevisao ? editandoPrevisao.imp : basePrevisaoImp
  const currentPrevisaoFin = editandoPrevisao ? editandoPrevisao.fin : basePrevisaoFin

  return (
    <>
      <div data-testid="pedido-modal" className="fixed inset-0 z-50 flex flex-col min-h-screen bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div 
          onClick={e => e.stopPropagation()} 
          className="w-[1000px] max-w-[1000px] h-[1300px] max-h-[1300px] bg-white rounded-2xl shadow-2xl flex flex-col mx-auto my-auto"
        >
        {/* Header FIXO no topo (sticky) */}
        <div style={{ background: headerBg }} className="text-white px-6 py-5 md:py-6 flex-shrink-0 sticky top-0 z-10 rounded-t-2xl">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-4 min-w-0">
              {visual.logoUrl && (
                <img src={visual.logoUrl} alt="logo" className="w-auto object-contain shrink-0" style={{ height: visual.logoImgAlt }} />
              )}
              <div className="min-w-0">
                <div className="text-[13px] tracking-[0.18em] font-bold opacity-90">PEDIDO Nº {fmtNumero(selected.numero)}</div>
                <h2 className="text-[30px] md:text-[40px] font-black leading-tight">{visual.titulo}</h2>
                <div className="text-white/80 text-sm mt-1">{visual.subtitulo}</div>
                <div className="mt-3 inline-flex items-center gap-2 bg-white rounded-full px-3 py-1.5 text-xs font-black" style={{ color: "#27272a" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: selected.etapa === "PEDIDO" ? cor2 : selected.etapa === "IMPRESSAO" ? "#f59e0b" : selected.etapa === "PRODUCAO" ? "#0284c7" : selected.etapa === "ENTREGA" ? "#059669" : "#0f766e" }} />
                  {selected.etapa} • {prog}%
                  <span className="opacity-60">•</span>
                  <span className="font-bold opacity-70">{selected.cliente}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="font-black tracking-widest" style={{ fontSize: visual.logoTam }}>
                {visual.logoUrl ? null : <span className="opacity-80">◎</span>} {nomeLogo}
              </div>
              {visual.subLogo && (
                <div className="tracking-[0.2em] opacity-80 -mt-1" style={{ fontSize: Math.max(8, Math.round(visual.logoTam * 0.62)) }}>{visual.subLogo}</div>
              )}
              <div className="mt-3 text-xs bg-white/15 border border-white/20 rounded-full px-3 py-1">Progresso: <b>{prog}%</b></div>
            </div>
            <button onClick={onClose} className="no-print w-9 h-9 grid place-items-center rounded-full bg-white/15 hover:bg-white/20 border border-white/20">✕</button>
            <button data-testid="modal-print-button" onClick={onPrint} className="w-9 h-9 grid place-items-center rounded-full bg-white/15 hover:bg-white/20 border border-white/20" title="Imprimir comanda">🖨️</button>
          </div>
          <div className="mt-3 h-2 bg-black/20 rounded-full overflow-hidden no-print">
            <div className="h-full bg-white transition-all rounded-full" style={{ width: `${prog}%` }} />
          </div>
          
          {/* Indicador de prioridade de reposição */}
          {selected.prioridadeLock?.ativo && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-xl animate-pulse">
              <span className="text-red-100 font-black text-sm">🔴 PRIORIDADE DE REPOSIÇÃO ATIVA</span>
              <span className="text-red-200 text-xs ml-auto">Pedido travado até concluir reposição</span>
            </div>
          )}
          {selected.prioridadeLock?.dataFim && !selected.prioridadeLock?.ativo && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-xl">
              <span className="text-green-100 font-black text-sm">✅ REPOSIÇÃO CONCLUÍDA</span>
              <span className="text-green-200 text-xs ml-auto">Prioridade liberada</span>
            </div>
          )}
          
          <div className="mt-1.5 flex justify-between text-[10px] font-bold tracking-wide opacity-90 no-print">
            <span className={prog >= config.PEDIDO && prog >= config.IMPRESSAO ? "text-white" : "text-white/60"}>PEDIDO {config.PEDIDO}%</span>
            <span className={prog >= config.IMPRESSAO ? "text-white" : "text-white/60"}>IMPRESSAO {config.IMPRESSAO}%</span>
            <span className={prog >= config.PRODUCAO ? "text-white" : "text-white/60"}>PRODUCAO {config.PRODUCAO}%</span>
            <span className={prog >= config.ENTREGA ? "text-white" : "text-white/60"}>ENTREGA {config.ENTREGA}%</span>
            <span className={prog >= config.FINALIZADO ? "text-white" : "text-white/60"}>FINALIZADO {config.FINALIZADO}% ✓</span>
          </div>
        </div>

        {/* Conteúdo com SCROLL próprio - flex */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-5 space-y-4" style={{ scrollbarGutter: 'stable' }}>
          {selected.etapa !== "PEDIDO" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex gap-2 text-sm">
              <span>🔒</span>
              <div><b>Dados principais bloqueados</b> <span className="text-zinc-600">— pedido avancou para {selected.etapa}. Alteracoes sao rejeitadas pelo backend.</span></div>
            </div>
          )}

          <section>
            <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
              <span className="w-7 h-7 grid place-items-center rounded bg-red-50 border border-red-100" style={{ color: cor2 }}>📄</span> RESUMO DO PEDIDO
              {canEditResumo && !editMode && (
                <button onClick={() => setEditMode(true)} className="no-print ml-auto text-xs bg-zinc-900 text-white rounded-full px-3 py-1.5">✏️ Editar</button>
              )}
              {editMode && (
                <div className="ml-auto flex gap-2">
                  <button onClick={() => setEditMode(false)} className="no-print text-xs bg-white border border-zinc-200 rounded-full px-3 py-1.5">Cancelar</button>
                  <button onClick={() => {
                    const form = document.getElementById("edit-form") as HTMLFormElement
                    if (form) onSalvarEdicao(new FormData(form))
                  }} className="no-print text-xs text-white rounded-full px-3 py-1.5 font-bold" style={{ background: cor2 }}>Salvar</button>
                </div>
              )}
            </div>
            {!editMode ? (
              <div className="mt-3 rounded-2xl p-4 md:p-5 border" style={{ background: "#fff5f5", borderColor: "#fee2e2" }}>
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
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📅</span> PREVISAO DE CONCLUSAO</div>
                    <div className="font-black text-sm mt-1">- {fmtData(selected.previsaoConclusao)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📞</span> TELEFONE</div>
                    <div className="font-black text-sm mt-1">- {selected.telefone || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📦</span> QUANTIDADE</div>
                    <div className="font-black text-sm mt-1">- {selected.quantidade || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>💰</span> VALOR</div>
                    <div className="font-black text-sm mt-1">- {selected.valor || "-"}</div>
                  </div>
                </div>
                {selected.itens && selected.itens.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📋</span> ITENS</div>
                    <div className="font-black text-sm mt-1">- {selected.itens.map(i => i.descricao + " " + i.quantidade + i.unidade).join(" • ")}</div>
                  </div>
                )}
                <div className="mt-3">
                  <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📅</span> INICIO</div>
                  <div className="font-black text-sm mt-1">- {fmtData(selected.dataCriacao)}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Criado {fmtDataHora(selected.dataCriacao)} • Atualizado {fmtDataHora(selected.dataAtualizacao)}</div>
                </div>
              </div>
            ) : (
              <form id="edit-form" className="mt-3 space-y-3" onSubmit={e => {
                e.preventDefault()
                const form = document.getElementById("edit-form") as HTMLFormElement
                if (form) onSalvarEdicao(new FormData(form))
              }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <div>
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>👥</span> CLIENTE *</div>
                    <input name="cliente" defaultValue={selected.cliente} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>🖨️</span> SERVICO *</div>
                    <input name="servico" defaultValue={selected.servico} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>👤</span> ATENDENTE *</div>
                    <input name="atendente" defaultValue={selected.atendente} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📅</span> PREVISAO DE CONCLUSAO *</div>
                    <input name="previsaoConclusao" type="date" defaultValue={selected.previsaoConclusao} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-3">
                  <div>
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📞</span> TELEFONE</div>
                    <input name="telefone" defaultValue={selected.telefone ?? ""} placeholder="Ex: (11) 99999-9999" className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📦</span> QUANTIDADE</div>
                    <input name="quantidade" defaultValue={selected.quantidade ?? ""} placeholder="Ex: 50 UNIDADES" className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>💰</span> VALOR</div>
                    <input name="valor" defaultValue={selected.valor ?? ""} placeholder="Ex: R$ 250,00" className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📋</span> ITENS (opcional)</div>
                    <textarea name="itens" rows={2} defaultValue={selected.itens.map(i => i.descricao + " " + i.quantidade + i.unidade).join(" • ")} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" placeholder="Ex: 50 banners 1.5x2m • 10 adesivos vinil" />
                </div>
                <div className="mt-3">
                  <div className="text-[11px] font-black tracking-wide flex items-center gap-1.5" style={{ color: cor2 }}><span>📝</span> OBSERVACOES</div>
                    <textarea name="observacoes" rows={3} defaultValue={selected.observacoes} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" placeholder="Observacoes do pedido..." />
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="submit" className="flex-1 rounded-full py-3 font-black text-white shadow-md" style={{ background: cor2 }}>Salvar alteracoes</button>
                  <button type="button" onClick={() => setEditMode(false)} className="flex-1 rounded-full py-3 font-bold text-zinc-600 border border-zinc-200">Cancelar</button>
                </div>
              </form>
            )}
          </section>

          {visual.mostrarObs && !editMode && (
            <section className="rounded-2xl overflow-hidden flex border" style={{ background: "#fff5f5", borderColor: "#fee2e2" }}>
              <div className="w-1.5 shrink-0" style={{ background: cor2 }} />
              <div className="p-4 md:p-5 flex-1">
                <div className="flex items-center gap-2 font-black text-sm" style={{ color: cor2 }}>
                  <span className="w-7 h-7 grid place-items-center rounded bg-white border border-red-100">📋</span> OBSERVACOES
                </div>
                <div className="mt-2 font-black text-sm md:text-[15px] leading-tight">- {selected.observacoes || "Nenhuma observacao"}</div>
              </div>
            </section>
          )}

          {visual.mostrarArtes && (() => {
              const sections = []
              
              // ARTE PREPARADA NA ETAPA DE ARTES
              if (selected.arteArteUrls.length > 0) {
                sections.push(
                  <section key="arte-preparada" className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <div className="w-full flex items-center justify-between p-3 md:p-4 bg-zinc-50">
                      <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                        <span className="w-7 h-7 grid place-items-center rounded bg-purple-50 border border-purple-100" style={{ color: "#7c3aed" }}>🎨</span> ARTE PREPARADA
                        <span className="bg-white border border-zinc-200 rounded-full px-2 py-0.5 text-[10px]">{selected.arteArteUrls.length} imagem(ns)</span>
                      </div>
                      <div className="flex gap-1">
                        {selected.arteArteUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            download={`arte-preparada-pedido-${fmtNumero(selected.numero)}-${i + 1}.png`}
                            className="text-xs bg-white border border-zinc-200 rounded-full px-3 py-1.5 font-semibold"
                          >
                            ⬇️ Baixar arte {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-zinc-50 rounded-2xl overflow-hidden">
                      {selected.arteArteUrls.map((url, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-white aspect-[4/3] cursor-pointer" onClick={() => setFullscreenUrl(url)}>
                          {renderArtePreview(url, `Arte preparada ${i + 1}`)}
                          <a href={url} download={`arte-preparada-pedido-${fmtNumero(selected.numero)}-${i + 1}.${extensaoDeArte(url) ?? "bin"}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black transition-opacity" title="Baixar">⬇️</a>
                          {canEditArteArte && editMode && (
                            <button
                              onClick={() => {
                                const atualizadas = selected.arteArteUrls.filter((_, idx) => idx !== i)
                                onSubstituirArteArte(atualizadas)
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow-sm"
                              title="Excluir imagem"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {canEditArteArte && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <input
                          ref={artePrepRef}
                          type="file"
                          accept={ARTE_ACEITOS}
                          multiple
                          className="hidden"
                          onChange={async e => {
                            const files = Array.from(e.target.files ?? [])
                            if (files.length === 0) return
                            const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                            setTempArteUrls(urls)
                          }}
                        />
                        <button
                          onClick={() => artePrepRef.current?.click()}
                          className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                          style={{ background: "#7c3aed" }}
                        >
                          🎨 {selected.arteArteUrls.length > 0 ? "Substituir arte preparada" : "Enviar arte preparada"}
                        </button>
                        {tempArteUrls.length > 0 && (
                          <button
                            onClick={() => {
                              onSubstituirArteArte(tempArteUrls)
                              setTempArteUrls([])
                            }}
                            className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                )
              }
              
              // ARTE ORIGINAL DO CLIENTE
              if ((selected.etapa === "PEDIDO" || selected.etapa === "ARTES" || selected.etapa === "IMPRESSAO") && selected.arteUrls.length > 0) {
                sections.push(
                  <section key="arte-original" className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <div className="w-full flex items-center justify-between p-3 md:p-4 bg-zinc-50">
                      <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                        <span className="w-7 h-7 grid place-items-center rounded bg-red-50 border border-red-100" style={{ color: cor2 }}>🖼️</span> ARTE ORIGINAL DO CLIENTE
                        <span className="bg-white border border-zinc-200 rounded-full px-2 py-0.5 text-[10px]">{selected.arteUrls.length} imagem(ns)</span>
                      </div>
                      <div className="flex gap-1">
                        {selected.arteUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            download={`arte-original-pedido-${fmtNumero(selected.numero)}-${i + 1}.png`}
                            className="text-xs bg-white border border-zinc-200 rounded-full px-3 py-1.5 font-semibold"
                          >
                            ⬇️ Baixar arte {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3 bg-zinc-50 rounded-2xl overflow-hidden">
                      {selected.arteUrls.map((url, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-zinc-200 bg-white aspect-[4/3]">
                          {renderArtePreview(url, `Arte original ${i + 1}`)}
                          <a href={url} download={`arte-original-pedido-${fmtNumero(selected.numero)}-${i + 1}.${extensaoDeArte(url) ?? "bin"}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black transition-opacity" title="Baixar">⬇️</a>
                          {canEditArteUrl && editMode && (
                            <button
                              onClick={() => removerArteUrl(i)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 shadow-sm"
                              title="Excluir imagem"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {canEditArteUrl && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <input
                          ref={arteOrigRef}
                          type="file"
                          accept={ARTE_ACEITOS}
                          multiple
                          className="hidden"
                          onChange={async e => {
                            const files = Array.from(e.target.files ?? [])
                            if (files.length === 0) return
                            const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                            setTempArteUrls(urls)
                          }}
                        />
                        <button
                          onClick={() => arteOrigRef.current?.click()}
                          className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                          style={{ background: cor2 }}
                        >
                          🖼️ {selected.arteUrls.length > 0 ? "Substituir arte original" : "Enviar arte original"}
                        </button>
                        {tempArteUrls.length > 0 && (
                          <button
                            onClick={() => {
                              onSubstituirArte(tempArteUrls)
                              setTempArteUrls([])
                            }}
                            className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                )
              }
              
              // Estado vazio arte preparada
              if (["ARTES", "IMPRESSAO", "PRODUCAO"].includes(selected.etapa) && selected.arteArteUrls.length === 0) {
                sections.push(
                  <section key="arte-preparada-empty" className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 md:p-4">
                    <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                      <span className="w-7 h-7 grid place-items-center rounded bg-purple-50 border border-purple-100" style={{ color: "#7c3aed" }}>🎨</span> ARTE PREPARADA
                    </div>
                    <div className="mt-3 text-center py-4">
                      <div className="text-4xl mb-2">🎨</div>
                      <div className="text-sm text-zinc-500 font-medium">Nenhuma arte preparada enviada</div>
                      <div className="text-xs text-zinc-400 mt-1">Envie a arte preparada abaixo</div>
                      {!canEditArteArte && (
                        <div className="text-xs text-zinc-400 mt-1">Aguardando arte preparada da equipe de artes</div>
                      )}
                    </div>
                    {canEditArteArte && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <input
                          ref={artePrepEmptyRef}
                          type="file"
                          accept={ARTE_ACEITOS}
                          multiple
                          className="hidden"
                          onChange={async e => {
                            const files = Array.from(e.target.files ?? [])
                            if (files.length === 0) return
                            const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                            setTempArteArteUrls(urls)
                          }}
                        />
                        <button
                          onClick={() => artePrepEmptyRef.current?.click()}
                          className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                          style={{ background: "#7c3aed" }}
                        >
                          🎨 Enviar arte preparada
                        </button>
                        {tempArteArteUrls.length > 0 && (
                          <button
                            onClick={() => {
                              onSubstituirArteArte(tempArteArteUrls)
                              setTempArteArteUrls([])
                            }}
                            className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                )
              }
              
              // Estado vazio arte original
              if ((selected.etapa === "PEDIDO" || selected.etapa === "ARTES" || selected.etapa === "IMPRESSAO") && selected.arteUrls.length === 0) {
                sections.push(
                  <section key="arte-original-empty" className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 md:p-4">
                    <div className="flex items-center gap-2 font-black text-zinc-900 tracking-wide text-sm">
                      <span className="w-7 h-7 grid place-items-center rounded bg-red-50 border border-red-100" style={{ color: cor2 }}>🖼️</span> ARTE ORIGINAL DO CLIENTE
                    </div>
                    <div className="mt-3 text-center py-4">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div className="text-sm text-zinc-500 font-medium">Nenhuma arte original enviada</div>
                      {!canEditArteUrl && (
                        <div className="text-xs text-zinc-400 mt-1">Aguardando arte original do atendimento</div>
                      )}
                    </div>
                    {canEditArteUrl && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <input
                          ref={arteOrigEmptyRef}
                          type="file"
                          accept={ARTE_ACEITOS}
                          multiple
                          className="hidden"
                          onChange={async e => {
                            const files = Array.from(e.target.files ?? [])
                            if (files.length === 0) return
                            const urls = await Promise.all(files.map(f => fileToDataUrl(f)))
                            setTempArteUrls(urls)
                          }}
                        />
                        <button
                          onClick={() => arteOrigEmptyRef.current?.click()}
                          className="text-xs rounded-full px-4 py-2 font-bold text-white shadow-md"
                          style={{ background: cor2 }}
                        >
                          🖼️ Enviar arte original
                        </button>
                        {tempArteUrls.length > 0 && (
                          <button
                            onClick={() => {
                              onSubstituirArte(tempArteUrls)
                              setTempArteUrls([])
                            }}
                            className="text-xs rounded-full px-3 py-2 font-black border border-zinc-300 text-zinc-700"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                )
              }
              
              return <div className="space-y-4">{sections}</div>
            })()}
              <div className="flex flex-col md:flex-row gap-3 pt-2 no-print">
                {selected.etapa === "PEDIDO" && (() => {
                  const blq = motivoBloqueio(selected, "ARTES")
                  const ativo = canEnviarParaArtes && !blq
                  return (
                    <button
                      onClick={onEnviarParaArtes}
                      className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                      style={ativo
                        ? { background: cor2, color: "#fff", fontSize: "14px" }
                        : { background: "#e4e4e7", color: "#71717a", cursor: "not-allowed", fontSize: blq ? "12px" : "14px" }}
                    >
                      {blq && canEnviarParaArtes ? `⏳ ${blq}` : ativo ? `➜ ENVIAR PARA ARTES • 25%` : "🔒 Sem permissao (Atendimento)"}
                    </button>
                  )
                })()}
                {selected.etapa === "ARTES" && (() => {
                  const blq = motivoBloqueio(selected, "IMPRESSAO")
                  const ativo = canEnviarParaImpressao && !blq
                  return (
                    <button
                      onClick={onEnviarParaImpressao}
                      className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                      style={ativo
                        ? { background: "#a855f7", color: "#fff", fontSize: "14px" }
                        : { background: "#e4e4e7", color: "#71717a", cursor: "not-allowed", fontSize: blq ? "12px" : "14px" }}
                    >
                      {blq && canEnviarParaImpressao ? `⏳ ${blq}` : ativo ? `➜ ENVIAR PARA IMPRESSAO • 50%` : "🔒 Somente Artes"}
                    </button>
                  )
                })()}
                {selected.etapa === "IMPRESSAO" && (() => {
                  const blq = motivoBloqueio(selected, "PRODUCAO")
                  const ativo = canEnviarParaProducao && !blq
                  return (
                    <button
                      onClick={onEnviarParaProducao}
                      className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                      style={ativo
                        ? { background: "#f59e0b", color: "#fff", fontSize: "14px" }
                        : { background: "#e4e4e7", color: "#71717a", cursor: "not-allowed", fontSize: blq ? "12px" : "14px" }}
                    >
                      {blq && canEnviarParaProducao ? `⏳ ${blq}` : ativo ? `➜ ENVIAR PARA PRODUCAO • 75%` : "🔒 Somente Impressao"}
                    </button>
                  )
                })()}
                {selected.etapa === "PRODUCAO" && (
                  <div className="flex flex-col md:flex-row gap-3 flex-1">
                    <button
                      onClick={onEnviarParaCostura}
                      className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                      style={
                        canEnviarParaCostura
                          ? { background: "#7c3aed", color: "#fff", fontSize: "14px" }
                          : { background: "#e4e4e7", color: "#71717a", cursor: "not-allowed" }}
                      >
                        {canEnviarParaEntrega ? `🚚 ENVIAR PARA ENTREGA • ${config.COSTURA}%` : "🔒 Somente Vendedor"}
                      </button>
                    <button
                      onClick={onFinalizar}
                      disabled={!canFinalizar}
                      className="flex-1 rounded-full py-3.5 font-black text-sm tracking-wide shadow-md flex items-center justify-center gap-2"
                      style={canFinalizar
                        ? { background: "#0f766e", color: "#fff" }
                        : { background: "#e4e4e7", color: "#71717a", cursor: "not-allowed" }}
                    >
                      {canFinalizar ? `✅ FINALIZAR PEDIDO • ${config.FINALIZADO}%` : "🔒 Somente Finalização"}
                    </button>
                  </div>
                )}
                {selected.etapa === "COSTURA" && (
                  <div className="flex flex-col md:flex-row gap-3 flex-1">
                    <button
                      onClick={onEnviarParaEntrega}
                      className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                      style={
                        canEnviarParaEntrega
                          ? { background: "#059669", color: "#fff", fontSize: "14px" }
                          : { background: "#e4e4e7", color: "#71717a", cursor: "not-allowed" }}
                    >
                      {canEnviarParaEntrega ? `🚚 ENVIAR PARA ENTREGA • ${config.ENTREGA}%` : "🔒 Somente Vendedor"}
                    </button>
                  </div>
                )}
                {selected.etapa === "ENTREGA" && (
                  <div className="flex flex-col md:flex-row gap-3 flex-1">
                    <button
                      onClick={onEntregaConcluida}
                      className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                      style={
                        podeEntregaConcluida
                          ? { background: "#059669", color: "#fff", fontSize: "14px" }
                          : { background: "#e4e4e7", color: "#71717a", cursor: "not-allowed" }}
                      >
                        {podeEntregaConcluida ? `✅ ENTREGA CONCLUIDA • 100%` : "🔒 Somente Vendedor"}
                      </button>
                  </div>
                )}
                {selected.etapa === "FINALIZADO" && (
                  <div className="flex flex-col md:flex-row gap-3 flex-1">
                    <button
                      onClick={onEnviarParaEntrega}
                      className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                      style={
                        canEnviarParaEntrega
                          ? { background: "#059669", color: "#fff", fontSize: "14px" }
                          : { background: "#e4e4e7", color: "#71717a", cursor: "not-allowed" }}
                      >
                        {canEnviarParaEntrega ? `🚚 ENVIAR PARA ENTREGA • ${config.ENTREGA}%` : "🔒 Sem permissao (Vendedor/ADMIN)"}
                      </button>
                    {podeReabrir && (
                      <button
                        onClick={onReabrir}
                        className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                        style={{ background: "#7c3aed", color: "#fff", fontSize: "14px" }}
                      >
                        🔄 REABRIR PEDIDO (volta para ativo)
                      </button>
                    )}
                  </div>
                )}
                {(podeVoltarEtapa || podeCancelar) && !selected.canceladoEm && (selected.etapa !== "PEDIDO") && (
                  <div className="flex flex-col md:flex-row gap-3 pt-1 no-print">
                    {podeVoltarEtapa && (
                      <button
                        onClick={onVoltarEtapa}
                        className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                        style={{ background: "#7c3aed", color: "#fff", fontSize: "14px" }}
                      >
                        {selected.etapa === "PRODUCAO" ? "🔄 REPOSIÇÃO" : "↩ VOLTAR UMA ETAPA"}
                      </button>
                    )}
                    {podeCancelar && (
                      <button
                        onClick={onCancelar}
                        className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                        style={{ background: "#dc2626", color: "#fff", fontSize: "14px" }}
                      >
                        ✕ CANCELAR PEDIDO
                      </button>
                    )}
                  </div>
                )}
                {tokenAcompanhamento && tokenAcompanhamentoAtivo && onRevogarLink && (
                  <div className="flex flex-col md:flex-row gap-3 pt-1 no-print">
                    <button
                      onClick={onRevogarLink}
                      className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                      style={{ background: "#dc2626", color: "#fff", fontSize: "14px" }}
                    >
                      ?? Revogar link do cliente
                    </button>
                  </div>
                )}
                {!tokenAcompanhamento || !tokenAcompanhamentoAtivo ? (
                  <div className="flex flex-col md:flex-row gap-3 pt-1 no-print">
                    <button
                      onClick={onGerarLink}
                      className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md flex items-center justify-center gap-2 text-center px-4 leading-tight"
                      style={{ background: "#7c3aed", color: "#fff", fontSize: "14px" }}
                    >
                      ?? Gerar link de acompanhamento (cliente)
                    </button>
                  </div>
                ) : null}
                <button onClick={onClose} className="no-print md:w-auto w-full bg-white border border-zinc-200 rounded-full px-6 py-3.5 font-bold text-sm mt-2">Fechar</button>
                <button onClick={onClose} className="no-print md:w-auto w-full bg-white border border-zinc-200 rounded-full px-6 py-3.5 font-bold text-sm mt-2">Fechar</button>
              </div>
            </div>
          </div>
      </div>
      {fullscreenUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={() => setFullscreenUrl(null)}>
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-4 my-8 bg-white rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-3 right-3 z-10">
              <button onClick={() => setFullscreenUrl(null)} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-xl shadow-lg hover:bg-white transition-colors">✕</button>
            </div>
            <div className="w-full h-full flex items-center justify-center p-2">
              {renderArtePreview(fullscreenUrl, "Visualizacao em tela cheia", "max-w-full max-h-full")}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

