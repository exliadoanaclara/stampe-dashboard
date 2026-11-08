import { fmtNumero } from "./datas"
import type { Etapa, LimitesEtapa, Pedido } from "./tipos"

export function ativoNaFila(p: Pedido): boolean {
  return !p.canceladoEm
}

/** Verifica se ha algum pedido na etapa de origem com numero menor que o pedido atual.
 * Pedidos URGENTE passam na frente de pedidos nao-urgentes. */
function pedidoNaFrente(ativos: Pedido[], p: Pedido, etapaOrigem: Etapa): Pedido | null {
  const candidatos = ativos.filter(x => x.etapa === etapaOrigem && x.numero < p.numero)
  if (p.prioridade === "URGENTE") {
    // Urgente so fica atras de outro urgente com numero menor
    return candidatos.filter(x => x.prioridade === "URGENTE").sort((a, b) => a.numero - b.numero)[0] ?? null
  }
  // Nao urgente respeita ordem de numero (qualquer um com numero menor bloqueia)
  return candidatos.sort((a, b) => a.numero - b.numero)[0] ?? null
}

/** Verifica se a etapa destino ja atingiu o limite maximo de pedidos simultaneos.
 * null/undefined = sem limite. */
export function motivoLimiteExcedido(pedidos: Pedido[], destino: Etapa, limites: LimitesEtapa): string | null {
  const limite = (limites as Record<string, number | null | undefined>)[destino]
  if (limite === null || limite === undefined) return null
  const ativos = pedidos.filter(ativoNaFila).filter(x => x.etapa === destino)
  if (ativos.length >= limite) {
    return `Limite de ${limite} pedido(s) simultaneo(s) em ${destino} atingido`
  }
  return null
}

export function motivoBloqueio(pedidos: Pedido[], p: Pedido, destino: Etapa, limites?: LimitesEtapa): string | null {
  if (p.canceladoEm) return "Pedido cancelado — não pode avançar de etapa"
  const ativos = pedidos.filter(ativoNaFila)

  if (destino === "ARTES") {
    const espera = pedidoNaFrente(ativos, p, "PEDIDO")
    if (espera) return `Fila estrita: o Pedido No ${fmtNumero(espera.numero)} esta na frente (fila de atendimento)`
  }

  if (destino === "IMPRESSAO") {
    const espera = pedidoNaFrente(ativos, p, "ARTES")
    if (espera) return `Fila estrita: o Pedido No ${fmtNumero(espera.numero)} esta na frente (fila de artes)`
  }

  if (destino === "PRODUCAO") {
    const naFrente = pedidoNaFrente(ativos, p, "IMPRESSAO")
    if (naFrente) return `Fila estrita: o Pedido No ${fmtNumero(naFrente.numero)} esta antes na Impressao`
  }

  if (destino === "COSTURA") {
    const naFrente = pedidoNaFrente(ativos, p, "PRODUCAO")
    if (naFrente) return `Fila estrita: o Pedido No ${fmtNumero(naFrente.numero)} esta antes na Producao`
  }

  if (destino === "ENTREGA") {
    const naFrente = pedidoNaFrente(ativos, p, "PRODUCAO")
    if (naFrente) return `Fila estrita: o Pedido No ${fmtNumero(naFrente.numero)} esta antes na Producao`
  }

  if (limites) {
    const blqLimite = motivoLimiteExcedido(pedidos, destino, limites)
    if (blqLimite) return blqLimite
  }

  return null
}