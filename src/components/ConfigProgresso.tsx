import type { ProgressConfig } from "../domain/tipos"
import { DEFAULT_CONFIG } from "../domain/tipos"

interface ConfigProgressoProps {
  config: ProgressConfig
  onConfigChange: (c: ProgressConfig) => void
  onResetConfig: () => void
  onClose: () => void
  show: boolean
}

export function ConfigProgresso({ config, onConfigChange, onResetConfig, onClose, show }: ConfigProgressoProps) {
  // Se show for falso, não renderiza nada
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[480px] bg-white md:rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-zinc-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 grid place-items-center rounded-full text-xl" style={{ background: "#059669" }}>⚙️</span>
            <div>
              <div className="font-black text-base">CONFIGURAR PROGRESSO</div>
              <div className="text-xs text-zinc-400">Percentuais por etapa</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full bg-white/10 hover:bg-white/20">✕</button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-zinc-500">Ajuste a porcentagem que cada etapa representa. Os valores sao validados para manter a ordem: PEDIDO {'<'} IMPRESSAO {'<'} PRODUCAO {'<'} ENTREGA {'<'} FINALIZADO</p>
          <div className="space-y-4">
            {[
              { key: "PEDIDO", label: "PEDIDO", min: 0, max: 49, color: "#c1121f" },
              { key: "IMPRESSAO", label: "IMPRESSAO", min: 50, max: 74, color: "#f59e0b" },
              { key: "PRODUCAO", label: "PRODUCAO", min: 75, max: 89, color: "#0284c7" },
              { key: "ENTREGA", label: "ENTREGA", min: 90, max: 99, color: "#059669" },
              { key: "FINALIZADO", label: "FINALIZADO", min: 100, max: 100, color: "#0f766e" },
            ].map(({ key, label, min, max, color }) => (
              <label key={key} className="space-y-1 block">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black" style={{ color }}>⬤ {label}</span>
                  <span className="text-sm font-bold" style={{ color }}>{config[key as keyof ProgressConfig]}%</span>
                </div>
                <input
                  type="number"
                  min={min}
                  max={max}
                  defaultValue={config[key as keyof ProgressConfig]}
                  onChange={e => onConfigChange({ ...config, [key]: Math.max(min, Math.min(max, Number(e.target.value))) })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-sm"
                />
              </label>
            ))}
          </div>
          <button
            onClick={onResetConfig}
            className="w-full text-xs bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-full py-2 font-semibold"
          >Resetar para padrao ({DEFAULT_CONFIG.PEDIDO} / {DEFAULT_CONFIG.IMPRESSAO} / {DEFAULT_CONFIG.PRODUCAO} / {DEFAULT_CONFIG.ENTREGA} / {DEFAULT_CONFIG.FINALIZADO})</button>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 bg-white border border-zinc-200 rounded-full px-6 py-2.5 font-bold text-sm">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  )
}