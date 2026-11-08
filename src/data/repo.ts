import { motivoBloqueio } from "../domain/fila"
import { ETAPA_ANTERIOR, maxNumeroDoDia } from "../domain/regras"
import type { Etapa, Pedido } from "../domain/tipos"
import * as storage from "./storage"
import { criarSupabaseRepo } from "./supabase"

export type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string }

export interface Movimentacao {
  pedidoId: string
  de: Etapa
  para: Etapa
  usuario: string
  /** valor a gravar como previsao do destino (IMPRESSAO -> previsaoImpressao, PRODUCAO -> previsaoProducao) */
  previsao?: string
  /** usado pelo SupabaseRepo (PROBLEMA-015); LocalRepo ignora — escrita local e last-write-wins */
  versao?: number
  /** FASE 07 - campos opcionais de entrega (extensíveis, não bloqueiam o fluxo) */
  entreguePor?: string
  dataEntrega?: string
  entregaSituacao?: string
  entregaPagamento?: string
  entregaAssinatura?: string
}

export interface AcaoAdministrativa {
  pedidoId: string
  motivo: string
  usuario: string
  isReposicao?: boolean
}

export interface PedidosRepo {
  /** snapshot sincrono para o primeiro render (LocalRepo le localStorage; repo remoto usaria cache local) */
  hidratar(): Pedido[]
  listar(): Promise<Resultado<Pedido[]>>
  persistir(lista: Pedido[]): Promise<Resultado<void>>
  proximoNumero(dia: string, seqAtual: number): Promise<Resultado<number>>
  movimentar(m: Movimentacao): Promise<Resultado<Pedido>>
  cancelar(a: AcaoAdministrativa): Promise<Resultado<Pedido>>
  voltarEtapa(a: AcaoAdministrativa): Promise<Resultado<Pedido>>
}

function ok<T>(valor: T): Resultado<T> {
  return { ok: true, valor }
}

function falha<T>(erro: string): Resultado<T> {
  return { ok: false, erro }
}

function agora(): string {
  return new Date().toISOString()
}

function novoPedidoPadrao(p: Pedido): Pedido {
  const resultado: Partial<Pedido> = {
    ...p,
    itens: p.itens ?? [],
    prioridade: p.prioridade ?? "NORMAL",
    arteUrls: p.arteUrls ?? [],
    arteProducaoUrls: p.arteProducaoUrls ?? [],
    infosImpressao: p.infosImpressao ?? [],
    infosProducao: p.infosProducao ?? [],
    infosEntrega: p.infosEntrega ?? [],
    infosCostura: p.infosCostura ?? [],
  }
  if (p.dataEntrega !== undefined) resultado.dataEntrega = p.dataEntrega
  if (p.entreguePor !== undefined) resultado.entreguePor = p.entreguePor
  if (p.dataPrazo !== undefined) resultado.dataPrazo = p.dataPrazo
  if (p.prazoDias !== undefined) resultado.prazoDias = p.prazoDias
  if (p.statusPrazo !== undefined) resultado.statusPrazo = p.statusPrazo
  if (p.alteracaoSolicitada !== undefined) resultado.alteracaoSolicitada = p.alteracaoSolicitada
  return resultado as Pedido
}

export class LocalRepo implements PedidosRepo {
  hidratar(): Pedido[] {
    return storage.carregarPedidos().map(novoPedidoPadrao)
  }

  async listar(): Promise<Resultado<Pedido[]>> {
    return ok(storage.carregarPedidos().map(novoPedidoPadrao))
  }

  async persistir(lista: Pedido[]): Promise<Resultado<void>> {
    const r = storage.salvarPedidos(lista)
    return r.ok ? ok(undefined) : falha(r.erro ?? "falha ao gravar")
  }

  async proximoNumero(dia: string, seqAtual: number): Promise<Resultado<number>> {
    const lista = storage.carregarPedidos()
    return ok(Math.max(seqAtual || 1, maxNumeroDoDia(lista, dia) + 1))
  }

  async movimentar(m: Movimentacao): Promise<Resultado<Pedido>> {
    const lista = storage.carregarPedidos().map(novoPedidoPadrao)
    const p = lista.find(x => x.id === m.pedidoId)
    if (!p) return falha("Pedido nao encontrado")
    if (p.etapa !== m.de) return falha(`Conflito de etapa: o pedido ja esta em ${p.etapa} — recarregue a lista`)
    // Permite ir de PRODUCAO direto para FINALIZADO (quando cliente busca, sem entrega)
    // Permite ir de FINALIZADO para ENTREGA (entrega agendada depois de finalizado)
    const transicaoValida =
      ETAPA_ANTERIOR[m.para] === m.de ||
      (m.de === "PRODUCAO" && m.para === "FINALIZADO") ||
      (m.de === "FINALIZADO" && m.para === "ENTREGA")
    if (!transicaoValida) return falha(`Movimentacao invalida: ${m.de} -> ${m.para}`)
    const bloqueio = motivoBloqueio(lista, p, m.para)
    if (bloqueio) return falha(bloqueio)

    const t = agora()
    
    // Se o pedido com prioridadeLock avanca para PRODUCAO ou FINALIZADO, limpa o lock
    const limparLock = p.prioridadeLock?.ativo && (m.para === "PRODUCAO" || m.para === "FINALIZADO")
    
    const novo: Pedido = {
      ...p,
      etapa: m.para,
      dataAtualizacao: t,
      prioridadeLock: limparLock ? { ...p.prioridadeLock, ativo: false, dataFim: t } : p.prioridadeLock,
      etapaHistorico: [...p.etapaHistorico, { de: p.etapa, para: m.para, usuario: m.usuario, data: t }],
    }
    if (m.para === "IMPRESSAO" && m.previsao) novo.previsaoImpressao = m.previsao
    if (m.para === "PRODUCAO" && m.previsao) novo.previsaoProducao = m.previsao
    if (m.para === "ENTREGA") {
      novo.dataEntrega = m.dataEntrega ?? t
      novo.entreguePor = m.entreguePor ?? m.usuario
      if (m.entregaSituacao !== undefined) novo.entregaSituacao = m.entregaSituacao
      if (m.entregaPagamento !== undefined) novo.entregaPagamento = m.entregaPagamento
      if (m.entregaAssinatura !== undefined) novo.entregaAssinatura = m.entregaAssinatura
    }
    if (m.para === "FINALIZADO") {
      novo.dataFinalizacao = t
      novo.usuarioFinalizacao = m.usuario
      if (m.dataEntrega !== undefined) novo.dataEntrega = m.dataEntrega
      if (m.entreguePor !== undefined) novo.entreguePor = m.entreguePor
      if (m.entregaSituacao !== undefined) novo.entregaSituacao = m.entregaSituacao
      if (m.entregaPagamento !== undefined) novo.entregaPagamento = m.entregaPagamento
      if (m.entregaAssinatura !== undefined) novo.entregaAssinatura = m.entregaAssinatura
    }
    return this.substituir(lista, novo)
  }

  async cancelar(a: AcaoAdministrativa): Promise<Resultado<Pedido>> {
    const lista = storage.carregarPedidos().map(novoPedidoPadrao)
    const p = lista.find(x => x.id === a.pedidoId)
    if (!p) return falha("Pedido nao encontrado")
    if (p.canceladoEm) return falha("Pedido ja cancelado")
    if (!a.motivo.trim()) return falha("Cancelamento exige motivo")

    const t = agora()
    const motivo = a.motivo.trim().toUpperCase()
    const novo: Pedido = {
      ...p,
      canceladoEm: t,
      canceladoMotivo: motivo,
      canceladoPor: a.usuario,
      dataAtualizacao: t,
      historico: [{ id: novoId(), campo: "Cancelamento", anterior: "(ativo)", novo: motivo, usuario: a.usuario, data: t }, ...p.historico],
    }
    return this.substituir(lista, novo)
  }

  async voltarEtapa(a: AcaoAdministrativa): Promise<Resultado<Pedido>> {
    const lista = storage.carregarPedidos().map(novoPedidoPadrao)
    const p = lista.find(x => x.id === a.pedidoId)
    if (!p) return falha("Pedido nao encontrado")
    const destino = ETAPA_ANTERIOR[p.etapa]
    if (!destino) return falha("Pedido ja esta na primeira etapa")
    if (!a.motivo.trim()) return falha("Retorno exige motivo")

    const t = agora()
    const motivo = a.motivo.trim().toUpperCase()
    
    // Se é REPOSIÇÃO (PRODUCAO -> IMPRESSAO), ativa prioridadeLock
    const prioridadeLock = a.isReposicao && p.etapa === "PRODUCAO" && destino === "IMPRESSAO"
      ? {
          ativo: true,
          motivo: "REPOSICAO",
          pedidoOrigemId: p.id,
          numeroOrigem: p.numero,
          etapaOrigem: "PRODUCAO" as const,
          dataInicio: t,
        }
      : undefined

    const novo: Pedido = {
      ...p,
      etapa: destino,
      dataAtualizacao: t,
      dataFinalizacao: undefined,
      usuarioFinalizacao: undefined,
      dataEntrega: undefined,
      entreguePor: undefined,
      prioridadeLock,
      historico: [{ id: novoId(), campo: "Retorno de etapa", anterior: p.etapa, novo: destino, usuario: a.usuario, data: t }, ...p.historico],
      etapaHistorico: [...p.etapaHistorico, { de: p.etapa, para: destino, usuario: a.usuario, data: t, motivo }],
    }
    return this.substituir(lista, novo)
  }

  private substituir(lista: Pedido[], novo: Pedido): Resultado<Pedido> {
    const atualizada = lista.map(p => (p.id === novo.id ? novo : p))
    const r = storage.salvarPedidos(atualizada)
    return r.ok ? ok(novo) : falha(r.erro ?? "falha ao gravar")
  }
}

function novoId(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

export function criarRepo(): PedidosRepo {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  if (useSupabase) {
    const supabaseRepo = criarSupabaseRepo();
    if (supabaseRepo) {
      console.info('SupabaseRepo ativado (VITE_USE_SUPABASE=true)');
      return supabaseRepo;
    }
    console.warn('SupabaseRepo não pôde ser criado; usando LocalRepo como fallback');
  }
  return new LocalRepo();
}

export async function criarSupabaseRepoPromise(): Promise<PedidosRepo | null> {
  return criarSupabaseRepo();
}