import { useState } from "react"
import { ARTE_ACEITOS } from "../domain/tipos"

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

interface NovoPedidoModalProps {
  show: boolean
  onClose: () => void
  onSubmit: (form: {
    cliente: string
    servico: string
    atendente: string
    telefone: string
    quantidade: string
    valor: string
    dataInicio: string
    previsaoConclusao: string
    observacoes: string
    arteUrls: string[]
    prioridade: string
    itens: string
  }) => void
  user: { nome: string; roles: string[] }
  cor2: string
}

export function NovoPedidoModal({ show, onClose, onSubmit, user, cor2 }: NovoPedidoModalProps) {
  const [artePreviews, setArtePreviews] = useState<string[]>([])

  if (!show) return null

  const handleArteChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const previews: string[] = []
    for (const f of files) {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(f)
      })
      previews.push(data)
    }
    setArtePreviews(prev => [...prev, ...previews])
    // Limpa o input para permitir selecionar os mesmos arquivos novamente
    ;(e.target as HTMLInputElement).value = ""
  }

  const removerArte = (index: number) => {
    setArtePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSubmit({
      cliente: fd.get("cliente") as string,
      servico: fd.get("servico") as string,
      atendente: fd.get("atendente") as string,
      telefone: fd.get("telefone") as string,
      quantidade: fd.get("quantidade") as string,
      valor: fd.get("valor") as string,
      dataInicio: fd.get("dataInicio") as string,
      previsaoConclusao: fd.get("previsaoConclusao") as string,
      observacoes: fd.get("observacoes") as string,
      arteUrls: artePreviews,
      prioridade: fd.get("prioridade") as string,
      itens: fd.get("itens") as string,
    })
    setArtePreviews([])
    ;(e.currentTarget as HTMLFormElement).reset()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[600px] bg-white md:rounded-2xl shadow-2xl overflow-hidden my-4 md:my-6 max-h-[90vh] flex flex-col">
        <div className="bg-zinc-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 grid place-items-center rounded-full text-2xl" style={{ background: cor2 }}>＋</span>
            <div>
              <div className="font-black text-lg">NOVO PEDIDO</div>
              <div className="text-xs text-zinc-400">Preencha os campos abaixo</div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4" id="novo-pedido-form">
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>👥 CLIENTE *</span>
            <input name="cliente" required className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" placeholder="Ex: EMPRESA ABC LTDA" />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>🖨️ SERVICO *</span>
            <input name="servico" required className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" placeholder="Ex: BANNERS 4X2M" />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>👤 ATENDENTE *</span>
            <input name="atendente" required defaultValue={user.nome} list="atendente-suggestions" className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" placeholder="Seu nome" />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>📅 DATA INICIO *</span>
            <input name="dataInicio" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>📅 PREVISAO CONCLUSAO *</span>
            <input name="previsaoConclusao" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>📋 OBSERVACOES</span>
            <textarea name="observacoes" rows={3} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" placeholder="Observacoes do pedido..." />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>📞 TELEFONE</span>
            <input name="telefone" placeholder="Ex: (11) 99999-0000" className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>📦 QUANTIDADE</span>
            <input name="quantidade" placeholder="Ex: 50 UNIDADES" className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>💰 VALOR</span>
            <input name="valor" placeholder="Ex: R$ 250,00" className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>⚡ PRIORIDADE</span>
            <select name="prioridade" defaultValue="NORMAL" className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm">
              <option value="BAIXA">Baixa</option>
              <option value="NORMAL">Normal</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>📋 ITENS (opcional)</span>
            <textarea name="itens" rows={2} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" placeholder="Ex: 50 banners 1.5x2m • 10 adesivos vinil" />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black" style={{ color: cor2 }}>🖼️ ARTE (opcional - varias imagens)</span>
            <input
              name="arteUrls"
              type="file"
              accept={ARTE_ACEITOS}
              multiple
              onChange={handleArteChange}
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm"
            />
            {artePreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {artePreviews.map((prev, i) => (
                  <div key={i} className="relative bg-zinc-100 border border-zinc-200 rounded-xl p-1">
                    {ehImagem(prev) ? (
                      <img src={prev} alt={`Arte ${i + 1}`} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-zinc-200 flex flex-col items-center justify-center rounded text-zinc-400">
                        <span className="text-2xl mb-1">📄</span>
                        <span className="text-[10px] font-bold uppercase truncate">{extensaoDeArte(prev)}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removerArte(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                      title="Remover imagem"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="text-[10px] text-zinc-500 mt-1">{artePreviews.length} arquivo(s) selecionado(s)</div>
              </div>
            )}
          </label>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-full py-3.5 font-black tracking-wide shadow-md text-white" style={{ background: cor2 }}>CRIAR PEDIDO</button>
            <button type="button" onClick={onClose} className="no-print md:w-auto w-full bg-white border border-zinc-200 rounded-full px-6 py-3.5 font-bold text-sm">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}