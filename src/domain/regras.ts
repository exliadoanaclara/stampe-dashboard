import { diaLocal } from "./datas"
import type { Etapa, Pedido, StatusPrazo } from "./tipos"

export const ETAPA_ANTERIOR: Record<Etapa, Etapa | null> = {
  PEDIDO: null,
  ARTES: "PEDIDO",
  IMPRESSAO: "ARTES",
  PRODUCAO: "IMPRESSAO",
  COSTURA: "PRODUCAO",
  ENTREGA: "COSTURA",
  FINALIZADO: "ENTREGA",
}

export function ehPedidoValido(x: unknown): x is Pedido {
  if (typeof x !== "object" || x === null) return false
  const p = x as Record<string, unknown>
  if (typeof p.id !== "string" || !p.id) return false
  if (typeof p.numero !== "number" || !Number.isFinite(p.numero)) return false
  if (typeof p.cliente !== "string" || typeof p.servico !== "string") return false
  if (typeof p.etapa !== "string") return false
  if (!["PEDIDO", "ARTES", "IMPRESSAO", "PRODUCAO", "COSTURA", "ENTREGA", "FINALIZADO"].includes(p.etapa)) return false
  if (!Array.isArray(p.infosImpressao) || !Array.isArray(p.infosArtes) || !Array.isArray(p.infosProducao) || !Array.isArray(p.infosEntrega)) return false
  if (!Array.isArray(p.historico) || !Array.isArray(p.etapaHistorico)) return false
  return true
}

export function maxNumeroDoDia(lista: Pedido[], hoje: string): number {
  let max = 0
  for (const p of lista) {
    if (diaLocal(new Date(p.dataCriacao)) === hoje && p.numero > max) max = p.numero
  }
  return max
}

export function sequenciaDoDia(lista: Pedido[], hoje: string, diaSalvo: string | null, armazenado: number): number {
  const max = maxNumeroDoDia(lista, hoje)
  if (diaSalvo !== hoje) return Math.max(1, max + 1)
  return Math.max(armazenado || 1, max + 1)
}

export function proximoNumero(lista: Pedido[], seqAtual: number, hoje: string): number {
  return Math.max(seqAtual || 1, maxNumeroDoDia(lista, hoje) + 1)
}

export function semArte(p: Pedido): boolean {
  return p.arteUrls.length === 0
}

/** Calcula o prazo limite (3 dias uteis) a partir da data de criacao. */
export function calcularPrazo(dataCriacao: string, diasUteis: number = 3): string {
  const d = new Date(dataCriacao)
  let diasSomados = 0
  let cursor = new Date(d)
  while (diasSomados < diasUteis) {
    cursor.setDate(cursor.getDate() + 1)
    const diaSemana = cursor.getDay() // 0=domingo, 6=sabado
    if (diaSemana !== 0 && diaSemana !== 6) diasSomados++
  }
  return `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`
}

/** Calcula o status do prazo com base em hoje e na data limite. */
export function calcularStatusPrazo(dataPrazo?: string): StatusPrazo {
  if (!dataPrazo) return "VERDE"
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const limite = new Date(dataPrazo + "T00:00:00")
  const diffDias = Math.ceil((limite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDias < 0) return "VERMELHO" // atrasado
  if (diffDias <= 1) return "LARANJA" // prazo proximo (amanha ou hoje)
  return "VERDE"
}

export function ehDiaUtil(d: Date): boolean {
  const dia = d.getDay()
  return dia !== 0 && dia !== 6
}