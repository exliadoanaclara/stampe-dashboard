import { useEffect, useState, useMemo, useCallback } from "react"
import type { Pedido, Etapa, UserState, Role } from "../domain/tipos"
import { diaLocal, fmtData, fmtDataHora, fmtNumero } from "../domain/datas"
import { calcularStatusPrazo } from "../domain/regras"
import { getProgresso } from "../domain/progresso"
import { DEFAULT_CONFIG } from "../domain/tipos"

/** Centro de Comando Gerencial (FASE 09).
 * Tela exclusiva para administradores.
 * Dashboard em tempo real com KPIs, graficos, filtros e exportacao PDF/CSV.
 */
interface CentroComandoProps {
  user: UserState
  pedidos: Pedido[]
  onClose: () => void
}

const ETAPAS: Etapa[] = ["PEDIDO", "ARTES", "IMPRESSAO", "PRODUCAO", "COSTURA", "ENTREGA", "FINALIZADO"]
const ETAPA_LABEL: Record<Etapa, string> = {
  PEDIDO: "Pedido",
  ARTES: "Artes",
  IMPRESSAO: "Impressao",
  PRODUCAO: "Producao",
  COSTURA: "Costura",
  ENTREGA: "Entrega",
  FINALIZADO: "Finalizado",
}
const ETAPA_COLOR: Record<Etapa, string> = {
  PEDIDO: "#b5000c",
  ARTES: "#a855f7",
  IMPRESSAO: "#f59e0b",
  PRODUCAO: "#0284c7",
  COSTURA: "#7c3aed",
  ENTREGA: "#059669",
  FINALIZADO: "#0f766e",
}

export function CentroComando({ user, pedidos, onClose }: CentroComandoProps) {
  const ehAdmin = (user.roles ?? []).includes("ADMIN")
  const [filtroDataInicial, setFiltroDataInicial] = useState("")
  const [filtroDataFinal, setFiltroDataFinal] = useState("")
  const [filtroFuncionario, setFiltroFuncionario] = useState("")
  const [filtroEtapa, setFiltroEtapa] = useState<Etapa | "">("")
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "atrasados" | "proximos">("todos")
  const [preset, setPreset] = useState<"todos" | "hoje" | "7dias" | "30dias" | "mes">("todos")
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date())

  const hoje = diaLocal()
  const agoraBrasilia = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })

  // Atualizacao em tempo real: escuta mudanças no localStorage (outras abas) e BroadcastChannel
  useEffect(() => {
    const canal = new BroadcastChannel("stampe_atualizacao")

    function aoReceberAtualizacao() {
      setUltimaAtualizacao(new Date())
    }

    // Escuta mensagens de outras abas via BroadcastChannel
    canal.addEventListener("message", aoReceberAtualizacao)

    // Escrita no localStorage por outra aba dispara o evento storage
    window.addEventListener("storage", aoReceberAtualizacao)

    // Polling leve como fallback (apenas quando autoRefresh esta ativo)
    let id: ReturnType<typeof setInterval> | null = null
    if (autoRefresh) {
      id = setInterval(aoReceberAtualizacao, 30000)
    }

    return () => {
      canal.removeEventListener("message", aoReceberAtualizacao)
      canal.close()
      window.removeEventListener("storage", aoReceberAtualizacao)
      if (id) clearInterval(id)
    }
  }, [autoRefresh])

  // Notifica outras abas quando este componente monta (para sincronizar dados iniciais)
  useEffect(() => {
    const canal = new BroadcastChannel("stampe_atualizacao")
    canal.postMessage({ tipo: "sincronizar", ts: Date.now() })
    canal.close()
  }, [])

  // Pedidos filtrados
  const pedidosFiltrados = useMemo(() => {
    let lista = [...pedidos]

    // Filtro por periodo (data de criacao)
    if (preset === "hoje") {
      lista = lista.filter(p => diaLocal(new Date(p.dataCriacao)) === hoje)
    } else if (preset === "7dias") {
      const limite = new Date()
      limite.setDate(limite.getDate() - 7)
      lista = lista.filter(p => new Date(p.dataCriacao) >= limite)
    } else if (preset === "30dias") {
      const limite = new Date()
      limite.setDate(limite.getDate() - 30)
      lista = lista.filter(p => new Date(p.dataCriacao) >= limite)
    } else if (preset === "mes") {
      const [ano, mes] = hoje.split("-").map(Number)
      lista = lista.filter(p => {
        const d = new Date(p.dataCriacao)
        return d.getFullYear() === ano && d.getMonth() + 1 === mes
      })
    }
    if (filtroDataInicial) {
      lista = lista.filter(p => p.dataCriacao >= filtroDataInicial)
    }
    if (filtroDataFinal) {
      lista = lista.filter(p => p.dataCriacao <= filtroDataFinal + "T23:59:59")
    }
    if (filtroFuncionario) {
      lista = lista.filter(p => p.atendente === filtroFuncionario)
    }
    if (filtroEtapa) {
      lista = lista.filter(p => p.etapa === filtroEtapa)
    }
    if (filtroStatus === "atrasados") {
      lista = lista.filter(p => p.dataPrazo && calcularStatusPrazo(p.dataPrazo) === "VERMELHO")
    }
    if (filtroStatus === "proximos") {
      lista = lista.filter(p => p.dataPrazo && calcularStatusPrazo(p.dataPrazo) === "LARANJA")
    }

    return lista
  }, [pedidos, filtroDataInicial, filtroDataFinal, filtroFuncionario, filtroEtapa, filtroStatus, preset, hoje])

  // ===== KPIs =====
  const totalPedidos = pedidosFiltrados.length
  const pedidosHoje = pedidosFiltrados.filter(p => diaLocal(new Date(p.dataCriacao)) === hoje).length
  const pedidosConcluidosHoje = pedidosFiltrados.filter(
    p => p.etapa === "FINALIZADO" && p.dataFinalizacao && diaLocal(new Date(p.dataFinalizacao)) === hoje
  ).length
  const pedidosAndamento = pedidosFiltrados.filter(p => p.etapa !== "FINALIZADO" && !p.canceladoEm).length
  const pedidosAtrasados = pedidosFiltrados.filter(
    p => p.dataPrazo && calcularStatusPrazo(p.dataPrazo) === "VERMELHO"
  ).length
  const pedidosProximos = pedidosFiltrados.filter(
    p => p.dataPrazo && calcularStatusPrazo(p.dataPrazo) === "LARANJA"
  ).length
  const pedidosUrgentes = pedidosFiltrados.filter(p => p.prioridade === "URGENTE").length
  const pedidosAguardandoArte = pedidosFiltrados.filter(p => p.etapa === "PEDIDO" || p.etapa === "ARTES").length
  const pedidosAguardandoImpressao = pedidosFiltrados.filter(p => p.etapa === "IMPRESSAO").length

  // ===== Grafico: pedidos por etapa =====
  const contagemPorEtapa = useMemo(() => {
    const cont: Record<string, number> = {}
    ETAPAS.forEach(e => { cont[e] = 0 })
    pedidosFiltrados.forEach(p => { cont[p.etapa] = (cont[p.etapa] || 0) + 1 })
    return cont
  }, [pedidosFiltrados])

  // ===== Grafico: producao por funcionario =====
  const producaoPorFuncionario = useMemo(() => {
    const cont: Record<string, { concluidos: number; totais: number }> = {}
    pedidosFiltrados.forEach(p => {
      if (!cont[p.atendente]) cont[p.atendente] = { concluidos: 0, totais: 0 }
      cont[p.atendente].totais++
      if (p.etapa === "FINALIZADO") cont[p.atendente].concluidos++
    })
    return cont
  }, [pedidosFiltrados])

  const funcionarios = useMemo(() => Object.keys(producaoPorFuncionario), [producaoPorFuncionario])

  // ===== Grafico: evolucao por periodo (ultimos 7 dias) =====
  const evolucaoSeteDias = useMemo(() => {
    const dias: string[] = []
    const valores: number[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const diaStr = diaLocal(d)
      dias.push(diaStr)
      valores.push(pedidosFiltrados.filter(p => diaLocal(new Date(p.dataCriacao)) === diaStr).length)
    }
    return { dias, valores }
  }, [pedidosFiltrados])

  // ===== Estatisticas de prazo =====
  const statusPrazoContagem = useMemo(() => {
    const cont = { VERDE: 0, LARANJA: 0, VERMELHO: 0 }
    pedidosFiltrados.forEach(p => {
      if (p.dataPrazo) {
        const s = calcularStatusPrazo(p.dataPrazo)
        cont[s as keyof typeof cont]++
      }
    })
    return cont
  }, [pedidosFiltrados])

  // ===== Funcoes de exportacao =====
  const exportarCSV = useCallback(() => {
    const cabecalho = "Numero,Cliente,Servico,Atendente,Etapa,Prioridade,Data Criacao,Previsao,Status Prazo\n"
    const linhas = pedidosFiltrados.map(p =>
      `${p.numero},"${p.cliente}","${p.servico}","${p.atendente}",${p.etapa},${p.prioridade},${p.dataCriacao},${p.previsaoConclusao || "-"},${p.statusPrazo || "-"}`
    ).join("\n")
    const blob = new Blob([cabecalho + linhas], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `stampe-relatorio-${hoje}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [pedidosFiltrados, hoje])

  const exportarPDF = useCallback(() => {
    // Simples: abrir janela de impressao com layout A4
    const conteudo = `
      <html><head><style>
        body{font-family:sans-serif;} h1{color:#b5000c;} table{border-collapse:collapse;width:100%;}
        th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f4f4f4;}
      </style></head><body>
        <h1>STAMPE - Relatório Gerencial</h1>
        <p>Gerado em: ${agoraBrasilia}</p>
        <table>
          <thead><tr><th>Nº</th><th>Cliente</th><th>Serviço</th><th>Atendente</th><th>Etapa</th><th>Prioridade</th><th>Data Criação</th></tr></thead>
          <tbody>
            ${pedidosFiltrados.map(p => `<tr><td>${p.numero}</td><td>${p.cliente}</td><td>${p.servico}</td><td>${p.atendente}</td><td>${p.etapa}</td><td>${p.prioridade}</td><td>${p.dataCriacao}</td></tr>`).join("")}
          </tbody>
        </table>
      </body></html>
    `
    const win = window.open("", "_blank")
    if (win) {
      win.document.write(conteudo)
      win.document.close()
      win.print()
    }
  }, [pedidosFiltrados, agoraBrasilia])

  const funcionarioOpcoes = useMemo(() => {
    const set = new Set<string>()
    pedidos.forEach(p => { if (p.atendente) set.add(p.atendente) })
    return Array.from(set).sort()
  }, [pedidos])

  if (!ehAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-zinc-100">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-black text-zinc-900 mb-2">Acesso restrito</h1>
          <p className="text-zinc-600 mb-6">O Centro de Comando é exclusivo para administradores.</p>
          <button onClick={onClose} className="rounded-full py-3 font-black text-white shadow-md" style={{ background: "#b5000c" }}>
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const totalMax = Math.max(1, ...Object.values(contagemPorEtapa))

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-800 p-2 md:p-4">
      {/* Cabeçalho fixo */}
      <header className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 md:p-6 mb-4 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-600/30">
              📊
            </div>
            <div>
              <div className="text-xs font-black tracking-widest text-zinc-500 uppercase">STAMPE</div>
              <div className="text-xl font-black text-zinc-900">Centro de Comando Gerencial</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-end gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-zinc-900">{hoje}</span>
              <span className="text-zinc-500">|</span>
              <span id="relogio-brasilia" className="font-mono font-bold text-blue-600">{agoraBrasilia.split(", ")[1] ?? ""}</span>
              <span className="text-zinc-500">|</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-zinc-600">Conectado</span>
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              Atualizado: {fmtDataHora(ultimaAtualizacao.toISOString())} • {user.nome}
              {autoRefresh && (
                <span className="ml-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600">Tempo real ativo</span>
                </span>
              )}
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${autoRefresh
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-zinc-100 text-zinc-600 border border-zinc-200"}`}
            >
              {autoRefresh ? "⏸️ Pausar tempo real" : "▶️ Tempo real"}
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-4">
        {/* Filtros */}
        <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-black text-sm tracking-wide text-zinc-900">Filtros</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Preset</label>
              <div className="flex gap-1">
                {["todos", "hoje", "7dias", "30dias", "mes"].map(p => (
                  <button
                    key={p}
                    onClick={() => { setPreset(p); setFiltroDataInicial(""); setFiltroDataFinal("") }}
                    className={`px-2 py-1 rounded text-xs font-bold transition ${preset === p
                      ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                  >
                    {p === "todos" ? "Todos" : p === "hoje" ? "Hoje" : p === "7dias" ? "Últimos 7d" : p === "30dias" ? "Últimos 30d" : "Mês atual"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Data inicial</label>
              <input
                type="date"
                value={filtroDataInicial}
                onChange={e => setFiltroDataInicial(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm font-bold focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Data final</label>
              <input
                type="date"
                value={filtroDataFinal}
                onChange={e => setFiltroDataFinal(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm font-bold focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Funcionário</label>
              <select
                value={filtroFuncionario}
                onChange={e => setFiltroFuncionario(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm font-bold focus:border-blue-500"
              >
                <option value="">Todos</option>
                {funcionarioOpcoes.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Etapa</label>
              <select
                value={filtroEtapa}
                onChange={e => setFiltroEtapa(e.target.value as Etapa | "")}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm font-bold focus:border-blue-500"
              >
                <option value="">Todas</option>
                {ETAPAS.map(e => <option key={e} value={e}>{ETAPA_LABEL[e]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-500 uppercase">Status prazo</label>
              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-sm font-bold focus:border-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="atrasados">Atrasados</option>
                <option value="proximos">Próximos do vencimento</option>
              </select>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <KpiCard
            label="Total de pedidos"
            valor={totalPedidos}
            cor="#b5000c"
            icone="📄"
            subtitulo={pedidosHoje > 0 ? `${pedidosHoje} hoje` : ""}
          />
          <KpiCard
            label="Recebidos hoje"
            valor={pedidosHoje}
            cor="#0284c7"
            icone="📥"
            subtitulo={pedidosConcluidosHoje > 0 ? `${pedidosConcluidosHoje} concluídos` : ""}
          />
          <KpiCard
            label="Em andamento"
            valor={pedidosAndamento}
            cor="#f59e0b"
            icone="⚙️"
            subtitulo="Não finalizados"
          />
          <KpiCard
            label="Atrasados"
            valor={pedidosAtrasados}
            cor="#dc2626"
            icone="⚠️"
            subtitulo={pedidosProximos > 0 ? `+${pedidosProximos} próximos` : ""}
          />
          <KpiCard
            label="Urgentes"
            valor={pedidosUrgentes}
            cor="#7c3aed"
            icone="🚨"
            subtitulo={pedidosAguardandoArte > 0 ? `${pedidosAguardandoArte} arte` : ""}
          />
        </section>

        {/* Linha dos graficos */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Grafico 1: Pedidos por etapa */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">📊</span>
                <span className="font-black text-sm tracking-wide text-zinc-900">Pedidos por etapa</span>
              </div>
              <button
                onClick={exportarCSV}
                className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-full px-3 py-1.5 transition"
              >
                📥 CSV
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ETAPAS.map(etapa => {
                const qtd = contagemPorEtapa[etapa] || 0
                const pct = totalMax > 0 ? (qtd / totalMax) * 100 : 0
                return (
                  <div key={etapa} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-600">{ETAPA_LABEL[etapa]}</span>
                      <span className={qtd > 0 ? "text-zinc-900" : "text-zinc-400"}>{qtd}</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: ETAPA_COLOR[etapa] }}
                      />
                    </div>
                  </div>
                )
              })}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-600">Total</span>
                  <span className="text-zinc-900">{totalPedidos}</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                  <div className="h-full rounded-full bg-zinc-400" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Grafico 2: Status do prazo */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 lg:col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">⏰</span>
              <span className="font-black text-sm tracking-wide text-zinc-900">Status do prazo</span>
            </div>
            <div className="space-y-3">
              {[
                { key: "VERDE", label: "Dentro do prazo", cor: "#059669", qtd: statusPrazoContagem.VERDE },
                { key: "LARANJA", label: "Próximo do vencimento", cor: "#f59e0b", qtd: statusPrazoContagem.LARANJA },
                { key: "VERMELHO", label: "Atrasado", cor: "#dc2626", qtd: statusPrazoContagem.VERMELHO },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.cor }} />
                    <span className="text-sm font-bold text-zinc-800">{item.label}</span>
                  </div>
                  <span className={`font-black text-sm ${item.cor === "#dc2626" ? "text-red-600" : item.cor === "#f59e0b" ? "text-amber-600" : "text-emerald-600"}`}>
                    {item.qtd}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-zinc-200">
                <div className="text-xs font-bold text-zinc-900 mb-1">Total no filtro</div>
                <div className="text-xl font-black text-zinc-900">{totalPedidos}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Linha 2: Produção por funcionário + Evolução */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Producao por funcionario */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 lg:col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">👥</span>
              <span className="font-black text-sm tracking-wide text-zinc-900">Produção por funcionário</span>
            </div>
            <div className="space-y-3">
              {funcionarios.map(f => {
                const dados = producaoPorFuncionario[f]
                const pct = dados.totais > 0 ? (dados.concluidos / dados.totais) * 100 : 0
                return (
                  <div key={f} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50">
                    <div>
                      <div className="text-sm font-bold text-zinc-800">{f}</div>
                      <div className="text-xs text-zinc-500">{dados.concluidos} concluídos / {dados.totais} totais</div>
                    </div>
                    <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {funcionarios.length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-sm">Sem dados no período selecionado</div>
              )}
            </div>
          </div>

          {/* Evolucao por periodo */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 lg:col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">📈</span>
              <span className="font-black text-sm tracking-wide text-zinc-900">Evolução da produção (últimos 7 dias)</span>
            </div>
            <div className="h-64 flex items-end gap-2 w-full">
              {evolucaoSeteDias.dias.map((dia, i) => {
                const valor = evolucaoSeteDias.valores[i]
                const maxVal = Math.max(1, ...evolucaoSeteDias.valores)
                const pct = (valor / maxVal) * 100
                return (
                  <div key={dia} className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full bg-zinc-100 rounded-full overflow-hidden h-full flex flex-col justify-end" style={{ height: `${Math.max(pct, 10)}%` }}>
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: "60%" }} />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600">{valor}</span>
                    <span className="text-[10px] text-zinc-400">{dia.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Exportacao */}
        <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">📤</span>
              <span className="font-black text-sm tracking-wide text-zinc-900">Exportar relatórios</span>
            </div>
            <div className="flex gap-2">
              <button onClick={exportarCSV} className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-full px-4 py-2 text-sm shadow-md transition">
                Exportar CSV
              </button>
              <button onClick={exportarPDF} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-4 py-2 text-sm shadow-md transition">
                Exportar PDF (imprimir)
              </button>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            Os dados são provenientes dos registros reais do sistema. Nenhum dado fictício é utilizado.
          </p>
        </section>

        <button onClick={onClose} className="w-full mt-6 rounded-full py-3 font-black text-white shadow-md" style={{ background: "#b5000c" }}>
          Voltar para pedidos
        </button>
      </main>

      <style>
        {`
          #relogio-brasilia {
            font-variant-numeric: tabular-nums;
          }
        `}
      </style>
    </div>
  )
}

function KpiCard({ label, valor, cor, icone, subtitulo }: { label: string; valor: number | string; cor: string; icone: string; subtitulo?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-xl" style={{ color: cor }}>
          {icone}
        </div>
        <div className="ml-auto text-right">
          <div className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">{label}</div>
          {subtitulo && <div className="text-[10px] text-zinc-400">{subtitulo}</div>}
        </div>
      </div>
      <div className="text-3xl font-black text-zinc-900">{valor}</div>
    </div>
  )
}
