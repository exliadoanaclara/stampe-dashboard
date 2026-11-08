// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import { criarPedidoBase } from "../test/factories"
import { diaLocal } from "../domain/datas"
import { criarRepo } from "./repo"
import * as storage from "./storage"

const repo = criarRepo()

function persistir(lista: unknown[]) {
  localStorage.setItem(storage.LS_PEDIDOS, JSON.stringify(lista))
}

beforeEach(() => {
  localStorage.clear()
  storage.pegarAvisoCarga()
  vi.restoreAllMocks()
})

describe("LocalRepo — leitura e gravação", () => {
  it("hidratar devolve o que está gravado (primeiro render)", async () => {
    persistir([criarPedidoBase()])
    expect(repo.hidratar()).toHaveLength(1)
    const r = await repo.listar()
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.valor[0].id).toBe("p1")
  })

  it("persistir grava a lista inteira e relê igual", async () => {
    const lista = [criarPedidoBase(), criarPedidoBase({ id: "p2", numero: 2 })]
    const w = await repo.persistir(lista)
    expect(w.ok).toBe(true)
    const r = await repo.listar()
    expect(r.ok && r.valor).toEqual(lista)
  })

  it("persistir reporta erro de quota em vez de falhar em silêncio", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota") })
    const r = await repo.persistir([criarPedidoBase()])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/espaco|backup/i)
  })
})

describe("LocalRepo.proximoNumero", () => {
  it("respeita o máximo do dia e a sequência informada", async () => {
    const hoje = diaLocal()
    persistir([criarPedidoBase({ numero: 4, dataCriacao: `${hoje}T10:00:00.000Z` })])
    const r = await repo.proximoNumero(hoje, 1)
    expect(r.ok && r.valor).toBe(5)
  })

  it("nunca devolve número menor que a sequência atual", async () => {
    const hoje = diaLocal()
    const r = await repo.proximoNumero(hoje, 9)
    expect(r.ok && r.valor).toBe(9)
  })

  it("numeração reinicia no dia seguinte", async () => {
    const ontem = "2019-12-31"
    persistir([criarPedidoBase({ numero: 99, dataCriacao: `${ontem}T10:00:00.000Z` })])
    const r = await repo.proximoNumero(diaLocal(), 1)
    expect(r.ok && r.valor).toBe(1)
  })
})

describe("LocalRepo.movimentar", () => {
  it("avança de etapa, grava previsão e registra o histórico", async () => {
    persistir([criarPedidoBase({ etapa: "ARTES" })])
    const r = await repo.movimentar({ pedidoId: "p1", de: "ARTES", para: "IMPRESSAO", usuario: "ITALO", previsao: "2026-09-30" })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.valor.etapa).toBe("IMPRESSAO")
    expect(r.valor.previsaoImpressao).toBe("2026-09-30")
    expect(r.valor.etapaHistorico).toHaveLength(1)
    expect(r.valor.etapaHistorico[0]).toMatchObject({ de: "ARTES", para: "IMPRESSAO", usuario: "ITALO" })

    const gravado = storage.carregarPedidos()
    expect(gravado[0].etapa).toBe("IMPRESSAO")
  })

  it("FINALIZADO marca data e responsável da finalização", async () => {
    persistir([criarPedidoBase({ etapa: "ENTREGA" })])
    const r = await repo.movimentar({ pedidoId: "p1", de: "ENTREGA", para: "FINALIZADO", usuario: "ANA" })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.valor.dataFinalizacao).toBeTruthy()
    expect(r.valor.usuarioFinalizacao).toBe("ANA")
  })

  it("rejeita movimentação quando a etapa de origem não confere (conflito)", async () => {
    persistir([criarPedidoBase({ etapa: "IMPRESSAO" })])
    const r = await repo.movimentar({ pedidoId: "p1", de: "PEDIDO", para: "IMPRESSAO", usuario: "ITALO" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/conflito/i)
    expect(storage.carregarPedidos()[0].etapa).toBe("IMPRESSAO")
  })

  it("rejeita salto de etapa (PEDIDO -> PRODUCAO)", async () => {
    persistir([criarPedidoBase()])
    const r = await repo.movimentar({ pedidoId: "p1", de: "PEDIDO", para: "PRODUCAO", usuario: "ITALO" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/invalida/i)
  })

  it("aplica a fila estrita: pedido com número maior não passa na frente", async () => {
    persistir([criarPedidoBase({ etapa: "ARTES" }), criarPedidoBase({ id: "p2", numero: 2, etapa: "ARTES" })])
    const r = await repo.movimentar({ pedidoId: "p2", de: "ARTES", para: "IMPRESSAO", usuario: "ITALO" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/fila estrita/i)
    expect(storage.carregarPedidos()[1].etapa).toBe("ARTES")
  })

  it("pedido cancelado não avança", async () => {
    persistir([criarPedidoBase({ etapa: "ARTES", canceladoEm: "2026-09-26T12:00:00.000Z" })])
    const r = await repo.movimentar({ pedidoId: "p1", de: "ARTES", para: "IMPRESSAO", usuario: "ITALO" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/cancelado/i)
  })

  it("falha de gravação não devolve pedido como sucesso", async () => {
    persistir([criarPedidoBase()])
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota") })
    const r = await repo.movimentar({ pedidoId: "p1", de: "PEDIDO", para: "IMPRESSAO", usuario: "ITALO" })
    expect(r.ok).toBe(false)
  })
})

describe("LocalRepo.cancelar", () => {
  it("cancela, grava motivo/autor e preserva o histórico", async () => {
    persistir([criarPedidoBase()])
    const r = await repo.cancelar({ pedidoId: "p1", motivo: "cliente desistiu", usuario: "ADMIN" })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.valor.canceladoEm).toBeTruthy()
    expect(r.valor.canceladoMotivo).toBe("CLIENTE DESISTIU")
    expect(r.valor.canceladoPor).toBe("ADMIN")
    expect(r.valor.historico[0]).toMatchObject({ campo: "Cancelamento", novo: "CLIENTE DESISTIU" })
    expect(storage.carregarPedidos()[0].canceladoEm).toBeTruthy()
  })

  it("não cancela duas vezes", async () => {
    persistir([criarPedidoBase({ canceladoEm: "2026-09-26T12:00:00.000Z" })])
    const r = await repo.cancelar({ pedidoId: "p1", motivo: "de novo", usuario: "ADMIN" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/ja cancelado/i)
  })

  it("exige motivo", async () => {
    persistir([criarPedidoBase()])
    const r = await repo.cancelar({ pedidoId: "p1", motivo: "   ", usuario: "ADMIN" })
    expect(r.ok).toBe(false)
  })
})

describe("LocalRepo.voltarEtapa", () => {
  it("volta uma etapa com motivo e limpa a finalização", async () => {
      persistir([criarPedidoBase({ etapa: "FINALIZADO", dataFinalizacao: "2026-09-26T12:00:00.000Z", usuarioFinalizacao: "ANA" })])
      const r = await repo.voltarEtapa({ pedidoId: "p1", motivo: "faltou rodar", usuario: "ADMIN" })
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.valor.etapa).toBe("ENTREGA")
      expect(r.valor.dataFinalizacao).toBeUndefined()
      expect(r.valor.usuarioFinalizacao).toBeUndefined()
      expect(r.valor.etapaHistorico[0].motivo).toBe("FALTOU RODAR")
      expect(storage.carregarPedidos()[0].etapa).toBe("ENTREGA")
    })

  it("não volta quando já está na primeira etapa", async () => {
    persistir([criarPedidoBase()])
    const r = await repo.voltarEtapa({ pedidoId: "p1", motivo: "qualquer", usuario: "ADMIN" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/primeira etapa/i)
  })

  it("exige motivo", async () => {
    persistir([criarPedidoBase({ etapa: "IMPRESSAO" })])
    const r = await repo.voltarEtapa({ pedidoId: "p1", motivo: "", usuario: "ADMIN" })
    expect(r.ok).toBe(false)
  })
})
