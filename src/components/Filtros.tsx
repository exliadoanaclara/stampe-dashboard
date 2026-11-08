interface FiltrosProps {
  busca: string
  onBuscaChange: (value: string) => void
  filtroAtendente: string
  onFiltroAtendenteChange: (value: string) => void
  atendentes: string[]
  onLimpar: () => void
}

export function Filtros({ busca, onBuscaChange, filtroAtendente, onFiltroAtendenteChange, atendentes, onLimpar }: FiltrosProps) {
  return (
    <section className="no-print max-w-[1280px] mx-auto px-4 mt-4">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-3 md:p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
          <input
            value={busca}
            onChange={e => onBuscaChange(e.target.value)}
            placeholder="Pesquisar por numero, cliente, servico ou atendente..."
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border-2 border-solid border-zinc-400 rounded-xl outline-none text-sm focus:bg-white focus:border-red-700"
          />
        </div>
        <div className="flex gap-2">
          <select value={filtroAtendente} onChange={e => onFiltroAtendenteChange(e.target.value)} className="px-3 py-2.5 bg-zinc-50 border-2 border-solid border-zinc-400 rounded-xl text-sm outline-none">
            <option value="">Todos atendentes</option>
            {atendentes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={onLimpar} className="px-3 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-semibold">Limpar</button>
        </div>
      </div>
    </section>
  )
}