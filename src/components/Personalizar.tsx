import type { VisualConfig, ProgressConfig } from "../domain/tipos"

interface PersonalizarProps {
  visual: VisualConfig
  config: ProgressConfig
  onVisualChange: (v: VisualConfig) => void
  onConfigChange: (c: ProgressConfig) => void
  onResetVisual: () => void
  onResetConfig: () => void
  onClose: () => void
}

export function Personalizar({
  visual, config, onVisualChange, onConfigChange, onResetVisual, onResetConfig, onClose
}: PersonalizarProps) {

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, campo: keyof VisualConfig) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 1_000_000) { alert("Imagem muito grande (max 1MB)."); return }
    const reader = new FileReader()
    reader.onload = () => onVisualChange({ ...visual, [campo]: reader.result as string })
    reader.readAsDataURL(f)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[980px] bg-white md:rounded-2xl shadow-2xl overflow-hidden my-0 md:my-6 min-h-[100dvh] md:min-h-0">
        <div className="bg-zinc-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 grid place-items-center rounded-full text-2xl" style={{ background: visual.corHeader2 }}>🎨</span>
            <div>
              <div className="font-black text-lg">PERSONALIZAR VISUAL</div>
              <div className="text-xs text-zinc-400">Tudo e salvo automaticamente no localStorage</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onResetVisual} className="no-print text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5">Resetar Visual</button>
            <button onClick={onResetConfig} className="no-print text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5">Resetar Progresso</button>
            <button onClick={onClose} className="w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20">✕</button>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-8 max-h-[90dvh] overflow-y-auto">
          <section>
            <h3 className="font-black text-zinc-900 text-lg mb-4 flex items-center gap-2">🎨 IDENTIDADE VISUAL</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-[11px] font-black text-zinc-600">EMPRESA</span>
                <input defaultValue={visual.nomeEmpresa} onChange={e => onVisualChange({ ...visual, nomeEmpresa: e.target.value.toUpperCase() })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black text-zinc-600">SUB-LOGO / SLOGAN</span>
                <input defaultValue={visual.subLogo} onChange={e => onVisualChange({ ...visual, subLogo: e.target.value.toUpperCase() })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
              </label>
            </div>
            <label className="space-y-1 mt-4 md:col-span-2">
              <span className="text-[11px] font-black text-zinc-600">TITULO PRINCIPAL</span>
              <input defaultValue={visual.titulo} onChange={e => onVisualChange({ ...visual, titulo: e.target.value.toUpperCase() })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-[11px] font-black text-zinc-600">SUBTITULO</span>
              <input defaultValue={visual.subtitulo} onChange={e => onVisualChange({ ...visual, subtitulo: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-[11px] font-black text-zinc-600">TAMANHO DO LOGO/TITULO (px)</span>
                <input type="number" min="12" max="60" defaultValue={visual.logoTam} onChange={e => onVisualChange({ ...visual, logoTam: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black text-zinc-600">ALTURA LOGO IMAGEM (px)</span>
                <input type="number" min="20" max="120" defaultValue={visual.logoImgAlt} onChange={e => onVisualChange({ ...visual, logoImgAlt: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
              </label>
            </div>
          </section>

          <section>
            <h3 className="font-black text-zinc-900 text-lg mb-4 flex items-center gap-2">🌈 GRADIENTE DO CABECALHO</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "corHeader" as const, label: "Cor 1 (inicio)" },
                { key: "corHeader2" as const, label: "Cor 2 (meio)" },
                { key: "corHeader3" as const, label: "Cor 3 (fim)" },
              ].map(({ key, label }) => (
                <label key={key} className="space-y-1">
                  <span className="text-[11px] font-black text-zinc-600">{label}</span>
                  <input type="color" defaultValue={visual[key]} onChange={e => onVisualChange({ ...visual, [key]: e.target.value })} className="w-full h-10 border-0 bg-transparent cursor-pointer" />
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-black text-zinc-900 text-lg mb-4 flex items-center gap-2">🖼️ LOGO (opcional - base64)</h3>
            <label className="space-y-1">
              <span className="text-[11px] font-black text-zinc-600">IMAGEM LOGO</span>
              <input type="file" accept="image/*" onChange={e => handleFile(e, "logoUrl")} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
              {visual.logoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={visual.logoUrl} alt="preview" className="w-16 h-16 object-contain rounded-lg border" />
                  <button onClick={() => onVisualChange({ ...visual, logoUrl: null })} className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1.5">Remover logo</button>
                </div>
              )}
            </label>
            <label className="space-y-1 mt-4">
              <span className="text-[11px] font-black text-zinc-600">MARCA D'AGUA (watermark - opcional)</span>
              <input type="file" accept="image/*" onChange={e => handleFile(e, "marcaUrl")} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
              {visual.marcaUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={visual.marcaUrl} alt="preview" className="w-16 h-16 object-contain rounded-lg border" />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-sm">
                      <input type="checkbox" defaultChecked={visual.marcaCobrir} onChange={e => onVisualChange({ ...visual, marcaCobrir: e.target.checked })} /> Cobrir pagina inteira
                    </label>
                    <label className="flex items-center gap-1.5 text-sm">
                      Opacidade: <input type="range" min="1" max="100" defaultValue={visual.marcaOpacidade} onChange={e => onVisualChange({ ...visual, marcaOpacidade: Number(e.target.value) })} className="w-32" /> {visual.marcaOpacidade}%
                    </label>
                  </div>
                  <button onClick={() => onVisualChange({ ...visual, marcaUrl: null })} className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1.5">Remover marca</button>
                </div>
              )}
            </label>
          </section>

          <section>
            <h3 className="font-black text-zinc-900 text-lg mb-4 flex items-center gap-2">🔍 OPCOES DE EXIBICAO</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "mostrarObs" as const, label: "Mostrar observacoes" },
                { key: "mostrarArte" as const, label: "Mostrar previa da arte" },
                { key: "mostrarHistorico" as const, label: "Mostrar historico" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={visual[key]} onChange={e => onVisualChange({ ...visual, [key]: e.target.checked })} className="w-5 h-5 accent-red-600" />
                  <span className="text-sm font-medium text-zinc-700">{label}</span>
                </label>
              ))}
              <label className="space-y-1 md:col-span-3">
                <span className="text-[11px] font-black text-zinc-600">ORDEM DA LISTAGEM</span>
                <select defaultValue={visual.ordemVisao} onChange={e => onVisualChange({ ...visual, ordemVisao: e.target.value as "MENOR" | "MAIOR" })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm">
                  <option value="MENOR">Menor numero primeiro (crescente)</option>
                  <option value="MAIOR">Maior numero primeiro (decrescente)</option>
                </select>
              </label>
            </div>
          </section>

          <section>
            <h3 className="font-black text-zinc-900 text-lg mb-4 flex items-center gap-2">⚙️ PROGRESSO POR ETAPA (%)</h3>
            <p className="text-sm text-zinc-500 mb-4">Ajuste a porcentagem que cada etapa representa no progresso total.</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { key: "PEDIDO", label: "PEDIDO", min: 0, max: 49 },
                { key: "IMPRESSAO", label: "IMPRESSAO", min: 50, max: 74 },
                { key: "PRODUCAO", label: "PRODUCAO", min: 75, max: 99 },
                { key: "FINALIZADO", label: "FINALIZADO", min: 100, max: 100 },
              ].map(({ key, label, min, max }) => (
                <label key={key} className="space-y-1">
                  <span className="text-[11px] font-black text-zinc-600">{label}</span>
                  <input type="number" min={min} max={max} defaultValue={config[key as keyof ProgressConfig]} onChange={e => onConfigChange({ ...config, [key]: Math.max(min, Math.min(max, Number(e.target.value))) })} className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm" />
                </label>
              ))}
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              Valores sao validados para manter ordem: PEDIDO {'<'} IMPRESSAO {'<'} PRODUCAO {'<'} FINALIZADO
            </div>
          </section>

          <div className="pt-4 border-t border-zinc-200 flex flex-col md:flex-row gap-3 justify-end">
            <button onClick={onClose} className="no-print md:w-auto w-full bg-white border border-zinc-200 rounded-full px-6 py-3 font-bold text-sm">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  )
}