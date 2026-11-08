import { describe, expect, it } from "vitest"
import { criarPedidoBase } from "../test/factories"
import { ativoNaFila, motivoBloqueio } from "./fila"

const CANCELADO = "2026-09-26T12:00:00.000Z"

describe("ativoNaFila", () => {
  it("pedido ativo continua na fila", () => {
    expect(ativoNaFila(criarPedidoBase())).toBe(true)
  })

  it("pedido cancelado sai da fila", () => {
    expect(ativoNaFila(criarPedidoBase({ canceladoEm: CANCELADO }))).toBe(false)
  })
})

describe("motivoBloqueio — guarda geral", () => {
  it("pedido cancelado nunca avança", () => {
    const p = criarPedidoBase({ canceladoEm: CANCELADO })
    expect(motivoBloqueio([p], p, "IMPRESSAO")).toMatch(/cancelado/i)
    expect(motivoBloqueio([p], p, "PRODUCAO")).toMatch(/cancelado/i)
  })

  it("retorna null quando a fila está livre", () => {
    const p = criarPedidoBase()
    expect(motivoBloqueio([p], p, "IMPRESSAO")).toBeNull()
    expect(motivoBloqueio([p], p, "PRODUCAO")).toBeNull()
  })

  it("lista vazia não bloqueia", () => {
    const p = criarPedidoBase()
    expect(motivoBloqueio([], p, "IMPRESSAO")).toBeNull()
  })
})

describe("motivoBloqueio — destino ARTES", () => {
  it("bloqueia se houver PEDIDO com numero menor esperando", () => {
    const atual = criarPedidoBase({ id: "b", numero: 10, etapa: "PEDIDO" })
    const frente = criarPedidoBase({ id: "a", numero: 5, etapa: "PEDIDO" })
    const motivo = motivoBloqueio([atual, frente], atual, "ARTES")
    expect(motivo).toMatch(/na frente/i)
    expect(motivo).toContain("005")
  })

  it("não bloqueia por PEDIDO de numero maior", () => {
    const atual = criarPedidoBase({ id: "b", numero: 5, etapa: "PEDIDO" })
    const atras = criarPedidoBase({ id: "a", numero: 9, etapa: "PEDIDO" })
    expect(motivoBloqueio([atual, atras], atual, "ARTES")).toBeNull()
  })

  it("não bloqueia se a Artes já estiver com outro pedido", () => {
    const atual = criarPedidoBase({ id: "b", numero: 10, etapa: "PEDIDO" })
    const ocupando = criarPedidoBase({ id: "a", numero: 3, etapa: "ARTES" })
    const motivo = motivoBloqueio([atual, ocupando], atual, "ARTES")
    expect(motivo).toBeNull()
  })

  it("o proprio pedido nao bloqueia a si mesmo", () => {
    const p = criarPedidoBase({ id: "unico", numero: 7, etapa: "ARTES" })
    expect(motivoBloqueio([p], p, "ARTES")).toBeNull()
  })

  it("pedidos cancelados nao bloqueiam a fila", () => {
    const atual = criarPedidoBase({ id: "b", numero: 10, etapa: "PEDIDO" })
    const cancelado = criarPedidoBase({ id: "a", numero: 1, etapa: "ARTES", canceladoEm: CANCELADO })
    expect(motivoBloqueio([atual, cancelado], atual, "ARTES")).toBeNull()
  })
})

describe("motivoBloqueio — destino IMPRESSAO", () => {
  it("bloqueia se houver ARTES com numero menor esperando", () => {
    const atual = criarPedidoBase({ id: "b", numero: 10, etapa: "ARTES" })
    const frente = criarPedidoBase({ id: "a", numero: 5, etapa: "ARTES" })
    const motivo = motivoBloqueio([atual, frente], atual, "IMPRESSAO")
    expect(motivo).toMatch(/na frente/i)
    expect(motivo).toContain("005")
  })

  it("não bloqueia por ARTES de numero maior", () => {
    const atual = criarPedidoBase({ id: "b", numero: 5, etapa: "ARTES" })
    const atras = criarPedidoBase({ id: "a", numero: 9, etapa: "ARTES" })
    expect(motivoBloqueio([atual, atras], atual, "IMPRESSAO")).toBeNull()
  })

  it("não bloqueia se a Impressao já estiver com outro pedido", () => {
    const atual = criarPedidoBase({ id: "b", numero: 10, etapa: "ARTES" })
    const ocupando = criarPedidoBase({ id: "a", numero: 3, etapa: "IMPRESSAO" })
    const motivo = motivoBloqueio([atual, ocupando], atual, "IMPRESSAO")
    expect(motivo).toBeNull()
  })

  it("o proprio pedido nao bloqueia a si mesmo", () => {
    const p = criarPedidoBase({ id: "unico", numero: 7, etapa: "IMPRESSAO" })
    expect(motivoBloqueio([p], p, "IMPRESSAO")).toBeNull()
  })

  it("pedidos cancelados nao bloqueiam a fila", () => {
    const atual = criarPedidoBase({ id: "b", numero: 10, etapa: "ARTES" })
    const cancelado = criarPedidoBase({ id: "a", numero: 1, etapa: "IMPRESSAO", canceladoEm: CANCELADO })
    expect(motivoBloqueio([atual, cancelado], atual, "IMPRESSAO")).toBeNull()
  })
})

describe("motivoBloqueio — destino PRODUCAO", () => {
  it("não bloqueia se a Finalizacao já estiver com outro pedido (vários podem finalizar ao mesmo tempo)", () => {
    const atual = criarPedidoBase({ id: "b", numero: 10, etapa: "IMPRESSAO" })
    const ocupando = criarPedidoBase({ id: "a", numero: 4, etapa: "PRODUCAO" })
    const motivo = motivoBloqueio([atual, ocupando], atual, "PRODUCAO")
    // Múltiplos pedidos podem estar em PRODUCAO ao mesmo tempo; so bloqueia se houver pedido de menor numero em IMPRESSAO
    expect(motivo).toBeNull()
  })

  it("bloqueia se houver pedido de Impressao antes", () => {
    const atual = criarPedidoBase({ id: "b", numero: 10, etapa: "IMPRESSAO" })
    const antes = criarPedidoBase({ id: "a", numero: 2, etapa: "IMPRESSAO" })
    const motivo = motivoBloqueio([atual, antes], atual, "PRODUCAO")
    expect(motivo).toMatch(/antes na Impressao/i)
    expect(motivo).toContain("002")
  })

  it("passa direto quando é o unico na Impressao", () => {
    const p = criarPedidoBase({ id: "unico", numero: 7, etapa: "IMPRESSAO" })
    expect(motivoBloqueio([p], p, "PRODUCAO")).toBeNull()
  })
})

describe("motivoBloqueio — limite de pedidos simultaneos por etapa", () => {
  const limites4 = { PEDIDO: null, IMPRESSAO: 4, PRODUCAO: 4, ENTREGA: 4 }

  it("nao bloqueia quando abaixo do limite", () => {
    const pedidos = Array.from({ length: 3 }, (_, i) =>
      criarPedidoBase({ id: `p${i}`, numero: i + 1, etapa: "PRODUCAO" })
    )
    const p = criarPedidoBase({ id: "novo", numero: 10, etapa: "IMPRESSAO" })
    expect(motivoBloqueio([...pedidos, p], p, "PRODUCAO", limites4)).toBeNull()
  })

  it("bloqueia quando ja esta no limite na etapa destino", () => {
    const pedidos = Array.from({ length: 4 }, (_, i) =>
      criarPedidoBase({ id: `p${i}`, numero: i + 1, etapa: "PRODUCAO" })
    )
    const p = criarPedidoBase({ id: "novo", numero: 10, etapa: "IMPRESSAO" })
    const motivo = motivoBloqueio([...pedidos, p], p, "PRODUCAO", limites4)
    expect(motivo).toMatch(/limite/i)
    expect(motivo).toContain("PRODUCAO")
  })

  it("nao bloqueia quando limite eh null (sem limite)", () => {
    const semLimite = { PEDIDO: null, IMPRESSAO: null, PRODUCAO: null, ENTREGA: null }
    const pedidos = Array.from({ length: 10 }, (_, i) =>
      criarPedidoBase({ id: `p${i}`, numero: i + 1, etapa: "PRODUCAO" })
    )
    const p = criarPedidoBase({ id: "novo", numero: 11, etapa: "IMPRESSAO" })
    expect(motivoBloqueio([...pedidos, p], p, "PRODUCAO", semLimite)).toBeNull()
  })

  it("pedidos cancelados nao contam para o limite", () => {
    const ativos = Array.from({ length: 3 }, (_, i) =>
      criarPedidoBase({ id: `a${i}`, numero: i + 1, etapa: "PRODUCAO" })
    )
    const cancelados = Array.from({ length: 4 }, (_, i) =>
      criarPedidoBase({ id: `c${i}`, numero: 100 + i, etapa: "PRODUCAO", canceladoEm: CANCELADO })
    )
    const p = criarPedidoBase({ id: "novo", numero: 10, etapa: "IMPRESSAO" })
    expect(motivoBloqueio([...ativos, ...cancelados, p], p, "PRODUCAO", limites4)).toBeNull()
  })

  it("sem limites passados nao bloqueia por ocupacao", () => {
    const pedidos = Array.from({ length: 10 }, (_, i) =>
      criarPedidoBase({ id: `p${i}`, numero: i + 1, etapa: "PRODUCAO" })
    )
    const p = criarPedidoBase({ id: "novo", numero: 11, etapa: "IMPRESSAO" })
    expect(motivoBloqueio([...pedidos, p], p, "PRODUCAO")).toBeNull()
  })
})
