import { useEffect, useMemo, useState, useCallback } from "react"
import type { Pedido, Etapa, Aba, ProgressConfig, UserState, VisualConfig, Prioridade, LimitesEtapa, StatusPrazo, HistoricoItem } from "../domain/tipos"
import { fmtNumero } from "../domain/datas"
import { motivoBloqueio as bloqueioDaFila } from "../domain/fila"
import { getProgresso } from "../domain/progresso"
import { diaLocal } from "../domain/datas"
import { calcularPrazo, calcularStatusPrazo } from "../domain/regras"
import {
  canEditProducao as podeEditFin,
  canEditImpressao as podeEditImp,
  canEditResumo as podeEditResumo,
  canEnviarParaArtes as podeEnvArtes,
  canEnviarParaProducao as podeEnvFin,
  canEnviarParaImpressao as podeEnvImp,
  canFinalizar as podeFinalizar,
  canEnviarParaEntrega as podeEnvEntrega,
  canEnviarParaCostura as podeEnvCostura,
  podeCancelar,
  podeVoltarEtapa,
  podeEntregaConcluida,
  canEditArteUrl as podeEditArteUrl,
  canEditArteArte as podeEditArteArte,
  canEditArteProducao as podeEditArteProducao,
  canEditCostura as podeEditCostura,
  podeAvancarParaArtes,
  podeAvancarParaImpressao,
  podeAvancarParaProducao,
  podeAvancarParaCostura,
  getPedidoPrioritario,
} from "../domain/permissoes"
import { ETAPA_ANTERIOR, maxNumeroDoDia, semArte } from "../domain/regras"
import * as storage from "../data/storage"
import { criarRepo, type PedidosRepo } from "../data/repo"

function genId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

const repo: PedidosRepo = criarRepo()

interface UsePedidosReturn {
  pedidos: Pedido[]
  carregando: boolean
  setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
  seq: number
  setSeq: React.Dispatch<React.SetStateAction<number>>
  selectedId: string | null
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>
  selected: Pedido | null
  editMode: boolean
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>
  showHistorico: boolean
  setShowHistorico: React.Dispatch<React.SetStateAction<boolean>>
  previsaoEdit: { id: string; imp: string; fin: string } | null
  setPrevisaoEdit: React.Dispatch<React.SetStateAction<{ id: string; imp: string; fin: string } | null>>
  tempPrevisaoImp: string
  setTempPrevisaoImp: React.Dispatch<React.SetStateAction<string>>
  tempPrevisaoFin: string
  setTempPrevisaoFin: React.Dispatch<React.SetStateAction<string>>
  tempPrevisaoEntrega: string
  setTempPrevisaoEntrega: React.Dispatch<React.SetStateAction<string>>
  tempInfoImp: string
  setTempInfoImp: React.Dispatch<React.SetStateAction<string>>
  tempInfoArtes: string
  setTempInfoArtes: React.Dispatch<React.SetStateAction<string>>
  tempInfoFin: string
  setTempInfoFin: React.Dispatch<React.SetStateAction<string>>
  tempInfoEntrega: string
  setTempInfoEntrega: React.Dispatch<React.SetStateAction<string>>
  filtered: Pedido[]
  stats: { todos: number; pedido: number; artes: number; impressao: number; producao: number; costura: number; entrega: number; finalizado: number }
  atendentes: string[]
  aba: Aba
  setAba: React.Dispatch<React.SetStateAction<Aba>>
  busca: string
  setBusca: React.Dispatch<React.SetStateAction<string>>
  filtroAtendente: string
  setFiltroAtendente: React.Dispatch<React.SetStateAction<string>>
  canEditResumo: (p: Pedido) => boolean
  canEnviarParaArtes: (p: Pedido) => boolean
  canEnviarParaImpressao: (p: Pedido) => boolean
  canEnviarParaProducao: (p: Pedido) => boolean
  canEnviarParaCostura: (p: Pedido) => boolean
  canEnviarParaEntrega: (p: Pedido) => boolean
  canFinalizar: (p: Pedido) => boolean
  canEditImpressao: (p: Pedido) => boolean
  canEditArtes: (p: Pedido) => boolean
  canEditProducao: (p: Pedido) => boolean
  canEditEntrega: (p: Pedido) => boolean
  canEditCostura: (p: Pedido) => boolean
  canEditArteUrl: (p: Pedido) => boolean
  canEditArteArte: (p: Pedido) => boolean
  canEditArteProducao: (p: Pedido) => boolean
  prog: (p: Pedido) => number
  motivoBloqueio: (p: Pedido, destino: Etapa) => string | null
  statusPrazo: (p: Pedido) => StatusPrazo
  criarPedido: (form: FormState) => Promise<void>
  salvarEdicao: (selected: Pedido, formData: FormData, userNome: string) => void
  enviarParaArtes: (p: Pedido, user: UserState) => Promise<void>
  enviarParaImpressao: (p: Pedido, user: UserState) => Promise<void>
  enviarParaProducao: (p: Pedido, user: UserState) => Promise<void>
  enviarParaEntrega: (p: Pedido, user: UserState) => Promise<void>
  finalizarPedido: (p: Pedido, user: UserState) => Promise<void>
  voltarEtapa: (p: Pedido, user: UserState) => Promise<void>
  reabrirPedido: (p: Pedido, user: UserState) => Promise<void>
  cancelarPedido: (p: Pedido, user: UserState) => Promise<void>
  podeEntregaConcluida: (p: Pedido) => boolean
  entregaConcluida: (p: Pedido, user: UserState) => Promise<void>
  substituirArte: (p: Pedido, urls: string[], userNome: string) => void
  substituirArteProducao: (p: Pedido, urls: string[], userNome: string) => void
  addInfoImpressao: (p: Pedido) => void
  addInfoArtes: (p: Pedido) => void
  addInfoProducao: (p: Pedido) => void
  addInfoEntrega: (p: Pedido) => void
  salvarPrevisaoImp: (p: Pedido) => void
  salvarPrevisaoFin: (p: Pedido) => void
  salvarPrevisaoCostura: (p: Pedido) => void
  salvarPrevisaoEntrega: (p: Pedido) => void
  editarPrevisao: (imp: string, fin: string) => void
}

interface FormState {
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
  itens: { descricao: string; quantidade: number; unidade: string }[]
}

export function usePedidos(user: UserState, config: ProgressConfig, visual: VisualConfig): UsePedidosReturn {
  const [pedidos, setPedidos] = useState<Pedido[]>(() => repo.hidratar())
  const [carregando, setCarregando] = useState(false)
  const [seq, setSeq] = useState<number>(() => storage.calcularSeqInicial())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [showHistorico, setShowHistorico] = useState(false)
  const [previsaoEdit, setPrevisaoEdit] = useState<{ id: string; imp: string; fin: string } | null>(null)
  const [tempPrevisaoImp, setTempPrevisaoImp] = useState("")
  const [tempPrevisaoFin, setTempPrevisaoFin] = useState("")
  const [tempPrevisaoEntrega, setTempPrevisaoEntrega] = useState("")
  const [tempInfoImp, setTempInfoImp] = useState("")
  const [tempInfoFin, setTempInfoFin] = useState("")
  const [tempInfoEntrega, setTempInfoEntrega] = useState("")
  const [tempInfoArtes, setTempInfoArtes] = useState("")
  const [tempInfoCostura, setTempInfoCostura] = useState("")
  const [tempPrevisaoCostura, setTempPrevisaoCostura] = useState("")

  const [aba, setAba] = useState<Aba>("TODOS")
  const [busca, setBusca] = useState("")
  const [filtroAtendente, setFiltroAtendente] = useState("")
  const [limites] = useState<LimitesEtapa>(() => storage.carregarLimites())

  // seleção DERIVADA da lista
  const selected = useMemo(
    () => (selectedId ? pedidos.find(p => p.id === selectedId) ?? null : null),
    [pedidos, selectedId]
  )

  // Reset seleção quando muda de usuário
  useEffect(() => {
    setSelectedId(null)
    setEditMode(false)
    setShowHistorico(false)
    setPrevisaoEdit(null)
  }, [user.id])

  // Filtrar pedidos por vendedor (admin vê todos; somente vendedor vê apenas seus proprios pedidos)
  const pedidosVisiveis = useMemo(() => {
    if ((user.roles ?? []).includes("ADMIN")) return pedidos
    // Somente role PEDIDO restringe por vendedorId; outros veem todos (filtro por etapa vem depois)
    if ((user.roles ?? []).includes("PEDIDO")) {
      return pedidos.filter(p => p.vendedorId === user.id)
    }
    return pedidos
  }, [pedidos, user])

  const filtered = useMemo(() => {
    let list = [...pedidosVisiveis]
    // Pedidos ja finalizados saem da lista de ativos e ficam apenas no Historico
    if (aba === "HISTORICO") {
      list = list.filter(p => p.etapa === "FINALIZADO")
    } else if (aba === "TODOS") {
      list = list.filter(p => p.etapa !== "FINALIZADO")
    } else {
      list = list.filter(p => p.etapa === aba)
    }
    // Quando aba e ARTES, mostra pedidos em ARTES e PEDIDO (aguardando preparacao de arte)
    if (aba === "ARTES") {
      list = list.filter(p => p.etapa === "ARTES" || p.etapa === "PEDIDO")
    }
    if (busca.trim()) {
      const q = busca.toLowerCase()
      list = list.filter(p =>
        fmtNumero(p.numero).includes(q) || String(p.numero).includes(q) ||
        p.cliente.toLowerCase().includes(q) || p.servico.toLowerCase().includes(q) ||
        p.atendente.toLowerCase().includes(q))
    }
    if (filtroAtendente) list = list.filter(p => p.atendente === filtroAtendente)
    return list.sort((a, b) => visual.ordemVisao === "MENOR" ? a.numero - b.numero : b.numero - a.numero)
  }, [pedidosVisiveis, aba, busca, filtroAtendente, visual.ordemVisao])

  const stats = useMemo(() => ({
    todos: pedidosVisiveis.length,
    pedido: pedidosVisiveis.filter(p => p.etapa === "PEDIDO").length,
    artes: pedidosVisiveis.filter(p => p.etapa === "ARTES").length,
    impressao: pedidosVisiveis.filter(p => p.etapa === "IMPRESSAO").length,
    producao: pedidosVisiveis.filter(p => p.etapa === "PRODUCAO").length,
    costura: pedidosVisiveis.filter(p => p.etapa === "COSTURA").length,
    entrega: pedidosVisiveis.filter(p => p.etapa === "ENTREGA").length,
    finalizado: pedidosVisiveis.filter(p => p.etapa === "FINALIZADO").length,
  }), [pedidosVisiveis])

  const atendentes = useMemo(() => Array.from(new Set(pedidosVisiveis.map(p => p.atendente))).filter(Boolean), [pedidosVisiveis])

  // Persistência de pedidos
  useEffect(() => {
    repo.persistir(pedidos).then(r => {
      if (!r.ok) console.error("Falha ao salvar pedidos:", r.erro)
    })
  }, [pedidos])

  // Carrega pedidos do repositório remoto (Supabase) na primeira montagem.
  // No LocalRepo, listar() equivale a hidratar(), então é seguro executar sempre.
  useEffect(() => {
    let cancelado = false
    async function carregar() {
      setCarregando(true)
      try {
        const r = await repo.listar()
        if (r.ok && !cancelado) {
          setPedidos(r.valor)
        } else if (!cancelado) {
          console.error("Falha ao carregar pedidos:", r.erro)
        }
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }
    carregar()
    return () => { cancelado = true }
  }, [])

  useEffect(() => { storage.salvarSeq(seq) }, [seq])

  // Persistir limites de fila quando mudarem
  useEffect(() => {
    storage.salvarLimites(limites)
  }, [limites])

  // Novo dia - reinicia numeração
  useEffect(() => {
    const checarNovoDia = () => {
      const hoje = diaLocal()
      const ultimo = storage.lerDiaSalvo()
      if (ultimo === hoje) return
      storage.salvarDia(hoje)
      const nova = Math.max(1, maxNumeroDoDia(pedidosVisiveis, hoje) + 1)
      if (nova !== seq) setSeq(nova)
      storage.salvarSeq(nova)
    }
    checarNovoDia()
    const id = setInterval(checarNovoDia, 30000)
    document.addEventListener("visibilitychange", checarNovoDia)
    window.addEventListener("focus", checarNovoDia)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", checarNovoDia)
      window.removeEventListener("focus", checarNovoDia)
    }
  }, [pedidosVisiveis, seq])

  // Permissões
  const canEditResumo = useCallback((p: Pedido) => podeEditResumo(p, user.roles, user.id), [user.roles, user.id])
  const canEnviarParaArtes = useCallback((p: Pedido) => {
    const base = podeEnvArtes(p, user.roles, user.id)
    if (!base) return false
    const prioridade = podeAvancarParaArtes(p, pedidosVisiveis)
    return prioridade.ok
  }, [user.roles, user.id, pedidosVisiveis])
  const canEnviarParaImpressao = useCallback((p: Pedido) => {
    const base = podeEnvImp(p, user.roles, user.id)
    if (!base) return false
    const prioridade = podeAvancarParaImpressao(p, pedidosVisiveis)
    return prioridade.ok
  }, [user.roles, user.id, pedidosVisiveis])
  const canEnviarParaProducao = useCallback((p: Pedido) => {
    const base = podeEnvFin(p, user.roles, user.id)
    if (!base) return false
    const prioridade = podeAvancarParaProducao(p, pedidosVisiveis)
    return prioridade.ok
  }, [user.roles, user.id, pedidosVisiveis])
  const canEnviarParaEntrega = useCallback((p: Pedido) => podeEnvEntrega(p, user.roles, user.id), [user.roles, user.id])
  const canFinalizar = useCallback((p: Pedido) => podeFinalizar(p, user.roles, user.id), [user.roles, user.id])
  const canEditImpressao = useCallback((p: Pedido) => podeEditImp(p, user.roles, user.id), [user.roles, user.id])
  const canEditArtes = useCallback((p: Pedido) => podeEditArteArte(p, user.roles, user.id), [user.roles, user.id])
  const canEditArteArte = useCallback((p: Pedido) => podeEditArteArte(p, user.roles, user.id), [user.roles, user.id])
  const canEditProducao = useCallback((p: Pedido) => podeEditFin(p, user.roles, user.id), [user.roles, user.id])
  const canEditEntrega = useCallback((p: Pedido) => podeEditFin(p, user.roles, user.id), [user.roles, user.id])
  const canEditCostura = useCallback((p: Pedido) => podeEditCostura(p, user.roles, user.id), [user.roles, user.id])
  const canEnviarParaCostura = useCallback((p: Pedido) => {
    const base = podeEnvCostura(p, user.roles, user.id)
    if (!base) return false
    const prioridade = podeAvancarParaCostura(p, pedidosVisiveis)
    return prioridade.ok
  }, [user.roles, user.id, pedidosVisiveis])
  const canEditArteUrl = useCallback((p: Pedido) => podeEditArteUrl(p, user.roles, user.id), [user.roles, user.id])
  const canEditArteProducao = useCallback((p: Pedido) => podeEditArteProducao(p, user.roles, user.id), [user.roles, user.id])
  const prog = useCallback((p: Pedido) => getProgresso(p.etapa, config), [config])

  const motivoBloqueio = useCallback((p: Pedido, destino: Etapa) => {
    const bloqueioFila = bloqueioDaFila(pedidosVisiveis, p, destino, limites)
    if (bloqueioFila) return bloqueioFila
    
    // Verifica prioridade de reposição
    if (destino === "ARTES") {
      const prioridade = podeAvancarParaArtes(p, pedidosVisiveis)
      if (!prioridade.ok) return prioridade.motivo
    }
    if (destino === "IMPRESSAO") {
      const prioridade = podeAvancarParaImpressao(p, pedidosVisiveis)
      if (!prioridade.ok) return prioridade.motivo
    }
    if (destino === "PRODUCAO") {
      const prioridade = podeAvancarParaProducao(p, pedidosVisiveis)
      if (!prioridade.ok) return prioridade.motivo
    }
    if (destino === "COSTURA") {
      const prioridade = podeAvancarParaCostura(p, pedidosVisiveis)
      if (!prioridade.ok) return prioridade.motivo
    }
    return null
  }, [pedidosVisiveis, limites])

  const enviarParaArtes = useCallback(async (p: Pedido, user: UserState) => {
    if (!canEnviarParaArtes(p)) return
    const bloqueio = motivoBloqueio(p, "ARTES")
    if (bloqueio) return
    const r = await repo.movimentar({ pedidoId: p.id, de: p.etapa, para: "ARTES", usuario: user.nome, previsao: p.previsaoConclusao })
    if (!r.ok) return
    setPedidos(prev => prev.map(x => x.id === r.valor.id ? r.valor : x))
  }, [canEnviarParaArtes, motivoBloqueio])

  const statusPrazo = useCallback((p: Pedido): StatusPrazo => {
    if (!p.dataPrazo) return "VERDE"
    return calcularStatusPrazo(p.dataPrazo)
  }, [])

  // Operações
  const criarPedido = useCallback(async (form: FormState) => {
    if (!form.cliente.trim() || !form.servico.trim() || !form.atendente.trim()) return
    const hoje = diaLocal()
    const rNum = await repo.proximoNumero(hoje, seq)
    if (!rNum.ok) return
    const numero = rNum.valor
    const dataPrazo = calcularPrazo(new Date().toISOString(), 3)
    const novo: Pedido = {
      id: genId(), numero,
      cliente: form.cliente.trim().toUpperCase(), servico: form.servico.trim().toUpperCase(),
      atendente: form.atendente.trim().toUpperCase(),
      vendedorId: user.id,
      telefone: form.telefone.trim(), quantidade: form.quantidade.trim(), valor: form.valor.trim(),
      dataInicio: form.dataInicio, previsaoConclusao: form.previsaoConclusao,
      observacoes: form.observacoes.trim().toUpperCase(),
      arteUrls: form.arteUrls ?? [],
      arteProducaoUrls: [],
      arteArteUrls: [],
      etapa: "PEDIDO",
      dataCriacao: new Date().toISOString(), dataAtualizacao: new Date().toISOString(),
      dataPrazo,
      prazoDias: 3,
      statusPrazo: "VERDE",
      infosImpressao: [], infosArtes: [], infosProducao: [], infosCostura: [], infosEntrega: [],
      historico: [], etapaHistorico: [],
      itens: form.itens,
      prioridade: (form.prioridade || "NORMAL") as Prioridade,
      tokenAcompanhamento: undefined,
      tokenAcompanhamentoAtivo: false,
    }
    setPedidos(prev => [novo, ...prev])
    setSeq(numero + 1)
    setSelectedId(novo.id)
    setPrevisaoEdit(null)
    setEditMode(false)
  }, [seq, user.id])

  const salvarEdicao = useCallback((selected: Pedido, formData: FormData, userNome: string) => {
    if (selected.etapa !== "PEDIDO" || !canEditResumo(selected)) return
    const novoCliente = ((formData.get("cliente") as string) || "").trim().toUpperCase()
    const novoServico = ((formData.get("servico") as string) || "").trim().toUpperCase()
    const novoAtendente = ((formData.get("atendente") as string) || "").trim().toUpperCase()
    const novaInicio = (formData.get("dataInicio") as string) || selected.dataInicio
    const novaPrev = (formData.get("previsaoConclusao") as string) || selected.previsaoConclusao
    const novaObs = ((formData.get("observacoes") as string) || "").trim().toUpperCase()
    const novoTelefone = ((formData.get("telefone") as string) || "").trim()
    const novaQtd = ((formData.get("quantidade") as string) || "").trim()
    const novoValor = ((formData.get("valor") as string) || "").trim()
    if (!novoCliente || !novoServico || !novoAtendente) return

    const historico: Array<{ id: string; campo: string; anterior: string; novo: string; usuario: string; data: string }> = []
    const pushHist = (campo: string, ant: string, novo: string) => {
      if (ant !== novo) historico.push({ id: genId(), campo, anterior: ant, novo, usuario: userNome, data: new Date().toISOString() })
    }
    pushHist("Cliente", selected.cliente, novoCliente)
    pushHist("Servico", selected.servico, novoServico)
    pushHist("Atendente", selected.atendente, novoAtendente)
    pushHist("Inicio", selected.dataInicio, novaInicio)
    pushHist("Previsao", selected.previsaoConclusao, novaPrev)
    pushHist("Observacoes", selected.observacoes, novaObs)
    pushHist("Telefone", selected.telefone ?? "", novoTelefone)
    pushHist("Quantidade", selected.quantidade ?? "", novaQtd)
    pushHist("Valor", selected.valor ?? "", novoValor)

    const atualizado: Pedido = {
      ...selected, cliente: novoCliente, servico: novoServico, atendente: novoAtendente,
      dataInicio: novaInicio, previsaoConclusao: novaPrev, observacoes: novaObs,
      telefone: novoTelefone, quantidade: novaQtd, valor: novoValor,
      historico: [...historico, ...selected.historico],
      dataAtualizacao: new Date().toISOString(),
    }
    setPedidos(prev => prev.map(p => p.id === atualizado.id ? atualizado : p))
    setEditMode(false)
  }, [canEditResumo])

  const enviarParaImpressao = useCallback(async (p: Pedido, user: UserState) => {
    if (!canEnviarParaImpressao(p)) return
    if (semArte(p)) {
      const okSemArte = window.confirm(`Pedido No ${fmtNumero(p.numero)} SEM ARTE. Enviar mesmo assim para IMPRESSAO?`)
      if (!okSemArte) return
    }
    const bloqueio = motivoBloqueio(p, "IMPRESSAO")
    if (bloqueio) return
    const r = await repo.movimentar({ pedidoId: p.id, de: p.etapa, para: "IMPRESSAO", usuario: user.nome, previsao: p.previsaoConclusao })
    if (!r.ok) return
    setPedidos(prev => prev.map(x => x.id === r.valor.id ? r.valor : x))
  }, [canEnviarParaImpressao, motivoBloqueio])

  const enviarParaProducao = useCallback(async (p: Pedido, user: UserState) => {
    if (!canEnviarParaProducao(p)) return
    const bloqueio = motivoBloqueio(p, "PRODUCAO")
    if (bloqueio) return
    const r = await repo.movimentar({
      pedidoId: p.id, de: p.etapa, para: "PRODUCAO", usuario: user.nome,
      previsao: p.previsaoImpressao || p.previsaoConclusao,
    })
    if (!r.ok) return
    setPedidos(prev => prev.map(x => x.id === r.valor.id ? r.valor : x))
  }, [canEnviarParaProducao, motivoBloqueio])

  const enviarParaCostura = useCallback(async (p: Pedido, user: UserState) => {
    if (!canEnviarParaCostura(p)) return
    const bloqueio = motivoBloqueio(p, "COSTURA")
    if (bloqueio) return
    const r = await repo.movimentar({
      pedidoId: p.id, de: p.etapa, para: "COSTURA", usuario: user.nome,
      previsao: p.previsaoProducao || p.previsaoImpressao || p.previsaoConclusao,
    })
    if (!r.ok) return
    setPedidos(prev => prev.map(x => x.id === r.valor.id ? r.valor : x))
  }, [canEnviarParaCostura, motivoBloqueio])

  const gerarTokenAcompanhamento = useCallback(async (p: Pedido, user: UserState) => {
    if (!podeAcessarPedido(p, user.id, user.roles)) return
    const token = `stampe-track-${crypto.randomUUID()}`
    setPedidos(prev => prev.map(x => {
      if (x.id !== p.id) return x
      return {
        ...x,
        tokenAcompanhamento: token,
        tokenAcompanhamentoAtivo: true,
        tokenAcompanhamentoCriadoEm: new Date().toISOString(),
        tokenAcompanhamentoCriadoPor: user.nome,
        dataAtualizacao: new Date().toISOString(),
      }
    }))
    return token
  }, [user])

  const revogarTokenAcompanhamento = useCallback(async (p: Pedido) => {
    setPedidos(prev => prev.map(x => {
      if (x.id !== p.id) return x
      return {
        ...x,
        tokenAcompanhamentoAtivo: false,
        dataAtualizacao: new Date().toISOString(),
      }
    }))
  }, [])

  const finalizarPedido = useCallback(async (p: Pedido, user: UserState) => {
    if (!canFinalizar(p)) return
    const r = await repo.movimentar({ pedidoId: p.id, de: p.etapa, para: "FINALIZADO", usuario: user.nome })
    if (!r.ok) return
    setPedidos(prev => prev.map(x => x.id === r.valor.id ? r.valor : x))
  }, [canFinalizar])

  const enviarParaEntrega = useCallback(async (p: Pedido, user: UserState) => {
    if (!canEnviarParaEntrega(p)) return
    const bloqueio = motivoBloqueio(p, "ENTREGA")
    if (bloqueio) return
    const r = await repo.movimentar({
      pedidoId: p.id, de: p.etapa, para: "ENTREGA", usuario: user.nome,
      previsao: p.previsaoProducao || p.previsaoImpressao || p.previsaoConclusao,
    })
    if (!r.ok) return
    setPedidos(prev => prev.map(x => x.id === r.valor.id ? r.valor : x))
  }, [canEnviarParaEntrega, motivoBloqueio])

  const voltarEtapa = useCallback(async (p: Pedido, user: UserState) => {
    if (!podeVoltarEtapa(user.roles)) return
    const de = ETAPA_ANTERIOR[p.etapa]
    if (!de) return
    
    let motivo = ""
    let isReposicao = false
    
    // Se voltando de PRODUCAO para IMPRESSAO, pergunta se é REPOSIÇÃO
    if (p.etapa === "PRODUCAO" && de === "IMPRESSAO") {
      const escolha = window.confirm(
        `Pedido No ${fmtNumero(p.numero)} voltando de PRODUÇÃO para IMPRESSÃO.\n\n` +
        `É REPOSIÇÃO (faltaram peças)?\n` +
        `OK = SIM (ativa prioridade)\n` +
        `Cancelar = NÃO (motivo livre)`
      )
      if (escolha) {
        isReposicao = true
        motivo = "REPOSIÇÃO"
      } else {
        motivo = window.prompt(`Motivo do retorno do Pedido No ${fmtNumero(p.numero)} (${p.etapa} -> ${de}):`)
        if (motivo === null || !motivo.trim()) return
      }
    } else {
      motivo = window.prompt(`Motivo do retorno do Pedido No ${fmtNumero(p.numero)} (${p.etapa} -> ${de}):`)
      if (motivo === null || !motivo.trim()) return
    }
    
    const r = await repo.voltarEtapa({ pedidoId: p.id, motivo: motivo.trim().toUpperCase(), usuario: user.nome, isReposicao })
    if (!r.ok) return
    setPedidos(prev => prev.map(x => x.id === r.valor.id ? r.valor : x))
  }, [user.roles])

  const reabrirPedido = useCallback(async (p: Pedido, user: UserState) => {
    if (!podeVoltarEtapa(user.roles)) return
    const de = ETAPA_ANTERIOR[p.etapa]
    if (!de) return
    const motivo = window.prompt(`Motivo para reabrir o Pedido No ${fmtNumero(p.numero)} (${p.etapa} -> ${de}):`)
    if (motivo === null || !motivo.trim()) return
    const r = await repo.voltarEtapa({ pedidoId: p.id, motivo, usuario: user.nome })
    if (!r.ok) return
    setPedidos(prev => prev.map(x => x.id === r.valor.id ? r.valor : x))
  }, [user.roles])

  const cancelarPedido = useCallback(async (p: Pedido, user: UserState) => {
    if (!podeCancelar(user.roles)) return
    if (p.canceladoEm) return
    const motivo = window.prompt(`Motivo do cancelamento do Pedido No ${fmtNumero(p.numero)}:`)
    if (motivo === null || !motivo.trim()) return
    const okConfirm = window.confirm(`Cancelar o Pedido No ${fmtNumero(p.numero)}? Ele sai da fila, mas continua no historico.`)
    if (!okConfirm) return
    const r = await repo.cancelar({ pedidoId: p.id, motivo, usuario: user.nome })
    if (!r.ok) return
    setPedidos(prev => prev.map(x => x.id === r.valor.id ? r.valor : x))
  }, [user.roles])

  const podeEntregaConcluidaCb = useCallback((p: Pedido) => podeEntregaConcluida(p), [])

  /** Conclui a entrega e move para FINALIZADO, registrando campos opcionais de entrega (FASE 07). */
  const entregaConcluida = useCallback(async (p: Pedido, user: UserState, entregaDados?: {
    entreguePor?: string
    dataEntrega?: string
    entregaSituacao?: string
    entregaPagamento?: string
    entregaAssinatura?: string
    observacoes?: string
  }) => {
    if (!podeEntregaConcluida(p)) return
    const r = await repo.movimentar({ pedidoId: p.id, de: p.etapa, para: "FINALIZADO", usuario: user.nome })
    if (!r.ok) return
    const agora = new Date().toISOString()
    const historicoExtra: HistoricoItem[] = []
    if (entregaDados?.observacoes && entregaDados.observacoes.trim()) {
      historicoExtra.push({ id: genId(), campo: "Observacoes entrega", anterior: "", novo: entregaDados.observacoes.trim(), usuario: user.nome, data: agora })
    }
    if (entregaDados?.entregaSituacao) {
      historicoExtra.push({ id: genId(), campo: "Situacao entrega", anterior: "", novo: entregaDados.entregaSituacao, usuario: user.nome, data: agora })
    }
    if (entregaDados?.entregaPagamento) {
      historicoExtra.push({ id: genId(), campo: "Pagamento entrega", anterior: "", novo: entregaDados.entregaPagamento, usuario: user.nome, data: agora })
    }
    setPedidos(prev => prev.map(x => {
      if (x.id !== p.id) return x
      return {
        ...x, etapa: "FINALIZADO", dataAtualizacao: agora, dataFinalizacao: agora, usuarioFinalizacao: user.nome,
        dataEntrega: entregaDados?.dataEntrega ?? x.dataEntrega,
        entreguePor: entregaDados?.entreguePor ?? x.entreguePor,
        entregaSituacao: entregaDados?.entregaSituacao ?? x.entregaSituacao,
        entregaPagamento: entregaDados?.entregaPagamento ?? x.entregaPagamento,
        entregaAssinatura: entregaDados?.entregaAssinatura ?? x.entregaAssinatura,
        historico: [...historicoExtra, ...x.historico],
      }
    }))
  }, [podeEntregaConcluida])

  const substituirArte = useCallback((p: Pedido, urls: string[], userNome: string) => {
    const agora = new Date().toISOString()
    setPedidos(prev => prev.map(x => x.id === p.id ? {
      ...x, arteUrls: [...x.arteUrls, ...urls], dataAtualizacao: agora,
      historico: [{ id: genId(), campo: "Arte do cliente", anterior: x.arteUrls.length ? `${x.arteUrls.length} imagem(ens)` : "(sem arte)", novo: `${x.arteUrls.length + urls.length} imagem(ens)`, usuario: userNome, data: agora }, ...x.historico],
    } : x))
  }, [])

  const substituirArteProducao = useCallback((p: Pedido, urls: string[], userNome: string) => {
    const agora = new Date().toISOString()
    setPedidos(prev => prev.map(x => x.id === p.id ? {
      ...x, arteProducaoUrls: [...x.arteProducaoUrls, ...urls], dataAtualizacao: agora,
      historico: [{ id: genId(), campo: "Arte de producao", anterior: x.arteProducaoUrls.length ? `${x.arteProducaoUrls.length} imagem(ens)` : "(sem arte)", novo: `${x.arteProducaoUrls.length + urls.length} imagem(ens)`, usuario: userNome, data: agora }, ...x.historico],
    } : x))
  }, [])

  const addInfoImpressao = useCallback((p: Pedido) => {
    if (!tempInfoImp.trim() || !canEditImpressao(p)) return
    const item = { id: genId(), texto: tempInfoImp.trim(), usuario: `${user.nome} (Impressao)`, data: new Date().toISOString() }
    setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, infosImpressao: [...x.infosImpressao, item], dataAtualizacao: new Date().toISOString() } : x))
    setTempInfoImp("")
  }, [tempInfoImp, canEditImpressao, user.nome])

  const addInfoArtes = useCallback((p: Pedido) => {
    if (!tempInfoArtes.trim() || !canEditArtes(p)) return
    const item = { id: genId(), texto: tempInfoArtes.trim(), usuario: `${user.nome} (Artes)`, data: new Date().toISOString() }
    setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, infosArtes: [...x.infosArtes, item], dataAtualizacao: new Date().toISOString() } : x))
    setTempInfoArtes("")
  }, [tempInfoArtes, canEditArtes, user.nome])

  const addInfoProducao = useCallback((p: Pedido) => {
    if (!tempInfoFin.trim() || !canEditProducao(p)) return
    const item = { id: genId(), texto: tempInfoFin.trim(), usuario: `${user.nome} (Producao)`, data: new Date().toISOString() }
    setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, infosProducao: [...x.infosProducao, item], dataAtualizacao: new Date().toISOString() } : x))
    setTempInfoFin("")
  }, [tempInfoFin, canEditProducao, user.nome])

  const addInfoCostura = useCallback((p: Pedido) => {
    if (!tempInfoCostura.trim() || !canEditCostura(p)) return
    const item = { id: genId(), texto: tempInfoCostura.trim(), usuario: `${user.nome} (Costura)`, data: new Date().toISOString() }
    setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, infosCostura: [...x.infosCostura, item], dataAtualizacao: new Date().toISOString() } : x))
    setTempInfoCostura("")
  }, [tempInfoCostura, canEditCostura, user.nome])

  const addInfoEntrega = useCallback((p: Pedido) => {
    if (!tempInfoEntrega.trim() || !canEditEntrega(p)) return
    const item = { id: genId(), texto: tempInfoEntrega.trim(), usuario: `${user.nome} (Entrega)`, data: new Date().toISOString() }
    setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, infosEntrega: [...x.infosEntrega, item], dataAtualizacao: new Date().toISOString() } : x))
    setTempInfoEntrega("")
  }, [tempInfoEntrega, canEditEntrega, user.nome])

  const salvarPrevisaoImp = useCallback((p: Pedido) => {
    if (!tempPrevisaoImp || !canEditImpressao(p)) return
    setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, previsaoImpressao: tempPrevisaoImp, dataAtualizacao: new Date().toISOString() } : x))
  }, [tempPrevisaoImp, canEditImpressao])

  const salvarPrevisaoFin = useCallback((p: Pedido) => {
    if (!tempPrevisaoFin || !canEditProducao(p)) return
    setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, previsaoProducao: tempPrevisaoFin, dataAtualizacao: new Date().toISOString() } : x))
  }, [tempPrevisaoFin, canEditProducao])

  const salvarPrevisaoCostura = useCallback((p: Pedido) => {
    if (!tempPrevisaoCostura || !canEditCostura(p)) return
    setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, previsaoCostura: tempPrevisaoCostura, dataAtualizacao: new Date().toISOString() } : x))
  }, [tempPrevisaoCostura, canEditCostura])

  const salvarPrevisaoEntrega = useCallback((p: Pedido) => {
    if (!tempPrevisaoEntrega || !canEditEntrega(p)) return
    setPedidos(prev => prev.map(x => x.id === p.id ? { ...x, previsaoEntrega: tempPrevisaoEntrega, dataAtualizacao: new Date().toISOString() } : x))
  }, [tempPrevisaoEntrega, canEditEntrega])

  const editarPrevisao = useCallback((imp: string, fin: string) => {
    if (!selected) return
    setPrevisaoEdit({ id: selected.id, imp, fin })
  }, [selected])

  return {
    pedidos, carregando, setPedidos, seq, setSeq, selectedId, setSelectedId, selected, editMode, setEditMode,
    showHistorico, setShowHistorico, previsaoEdit, setPrevisaoEdit,
    tempPrevisaoImp, setTempPrevisaoImp, tempPrevisaoFin, setTempPrevisaoFin, tempPrevisaoEntrega, setTempPrevisaoEntrega,
    tempInfoImp, setTempInfoImp, tempInfoArtes, setTempInfoArtes, tempInfoCostura, setTempInfoCostura, tempInfoFin, setTempInfoFin, tempInfoEntrega, setTempInfoEntrega,
    filtered, stats, atendentes, aba, setAba, busca, setBusca, filtroAtendente, setFiltroAtendente,
    canEditResumo, canEnviarParaArtes, canEnviarParaImpressao, canEnviarParaProducao, canEnviarParaCostura, canEnviarParaEntrega, canFinalizar,
    canEditImpressao, canEditArtes, canEditProducao, canEditEntrega, canEditCostura, canEditArteUrl, canEditArteArte, canEditArteProducao, prog, motivoBloqueio, statusPrazo,
    criarPedido, salvarEdicao, enviarParaArtes, enviarParaImpressao, enviarParaProducao, enviarParaCostura, enviarParaEntrega, finalizarPedido,
    voltarEtapa, reabrirPedido, cancelarPedido, podeEntregaConcluida: podeEntregaConcluidaCb, entregaConcluida, substituirArte, substituirArteProducao, addInfoImpressao, addInfoArtes, addInfoProducao, addInfoCostura, addInfoEntrega,
    salvarPrevisaoImp, salvarPrevisaoFin, salvarPrevisaoEntrega, salvarPrevisaoCostura, editarPrevisao,
    gerarTokenAcompanhamento, revogarTokenAcompanhamento,
  }
}